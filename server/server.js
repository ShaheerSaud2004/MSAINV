require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const { sendOverdueNotifications, sendDueSoonReminders } = require('./services/notificationService');

// Initialize express app
const app = express();

// Trust proxy - Required for Railway and other reverse proxies
// This allows express-rate-limit to work correctly with X-Forwarded-For header
app.set('trust proxy', true);

// Connect to database (MongoDB or JSON storage)
connectDatabase();

// Middleware
app.use(helmet()); // Security headers

// CORS - Allow Railway or local development
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.RAILWAY_STATIC_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production on Railway, allow same domain
    if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/qr', require('./routes/qr'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    storageMode: process.env.STORAGE_MODE || 'mongodb',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing - return index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Root endpoint for development
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'MSA Inventory Management System API',
      version: '1.0.0',
      documentation: '/api/health'
    });
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Background jobs using cron
// Run overdue check every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running overdue detection job...');
  try {
    const overdueCount = await sendOverdueNotifications();
    console.log(`Overdue detection complete. Found ${overdueCount} overdue transactions.`);
  } catch (error) {
    console.error('Error in overdue detection job:', error);
  }
});

// Run due soon reminders every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running due soon reminder job...');
  try {
    const reminderCount = await sendDueSoonReminders();
    console.log(`Due soon reminders sent. ${reminderCount} reminders sent.`);
  } catch (error) {
    console.error('Error in due soon reminder job:', error);
  }
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   MSA Inventory Management System                        ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Storage Mode: ${process.env.STORAGE_MODE || 'mongodb'}                           ║
║                                                           ║
║   API Health: http://localhost:${PORT}/api/health           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;


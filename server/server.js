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

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET environment variable is not set!');
  console.error('   Please set JWT_SECRET in Railway environment variables.');
  console.error('   Example: JWT_SECRET=your-super-secret-key-min-32-characters-long');
  process.exit(1);
}

// Connect to database (MongoDB or JSON storage)
connectDatabase().then(() => {
  // Auto-initialize: Create default admin user if no users exist
  initializeDefaultUsers();
});

// Auto-initialize default admin user if database is empty
async function initializeDefaultUsers() {
  try {
    const { getStorageService } = require('./services/storageService');
    const storageService = getStorageService();
    const bcrypt = require('bcryptjs');
    
    // Check if any users exist
    const users = await storageService.findAllUsers();
    
    if (users.length === 0) {
      console.log('👤 No users found. Creating default admin user...');
      
      // Create default admin user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = {
        name: 'Admin User',
        email: 'admin@msa.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        phone: '',
        team: '',
        department: '',
        permissions: {
          canViewItems: true,
          canManageItems: true,
          canCheckout: true,
          canReturn: true,
          canApproveTransactions: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageSettings: true,
          canDeleteItems: true,
          canOverrideRestrictions: true
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          language: 'en',
          theme: 'light'
        },
        profile: {
          avatar: '',
          bio: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await storageService.createUser(adminUser);
      console.log('✅ Default admin user created: admin@msa.com / admin123');
      console.log('⚠️  IMPORTANT: Change the default password after first login!');
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
    // Don't fail server startup if initialization fails
  }
}

// Middleware
app.use(helmet()); // Security headers

// CORS - Allow Railway, Vercel, or local development
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3021', // Custom development port
  'http://localhost:3022',
  process.env.RAILWAY_STATIC_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.VERCEL ? `https://${process.env.VERCEL}` : null
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production on Vercel/Railway, allow same domain and vercel.app domains
    if (process.env.NODE_ENV === 'production') {
      // Allow same origin (when API and frontend are on same domain)
      if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      // Allow if in allowedOrigins
      if (allowedOrigins.length === 0 || allowedOrigins.some(allowed => origin.includes(allowed))) {
        return callback(null, true);
      }
    }
    
    // Allow all in development or if no CLIENT_URL set
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Rate limiting - only apply in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: {
      trustProxy: true // Match the app's trust proxy setting
    },
    // Use a custom key generator that works with Railway's proxy
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if available, otherwise use IP
      return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    }
  });
  app.use('/api/', limiter);
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/storage-visits', require('./routes/storageVisits'));
app.use('/api/guest-requests', require('./routes/guestRequests'));

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
  
  // Serve uploaded files
  app.use('/storage/uploads', express.static(path.join(__dirname, 'storage/uploads')));
  
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
const server = app.listen(PORT, '0.0.0.0', () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.RENDER_EXTERNAL_URL || `https://your-app.onrender.com`)
    : `http://localhost:${PORT}`;
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   MSA Inventory Management System                        ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Storage Mode: ${process.env.STORAGE_MODE || 'mongodb'}                           ║
║                                                           ║
║   API Health: ${baseUrl}/api/health           ║
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


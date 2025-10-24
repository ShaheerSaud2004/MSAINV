const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || process.env.STORAGE_MODE === 'json') {
      console.log('📁 Using JSON file storage mode');
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Fallback to JSON storage if MongoDB connection fails
    if (process.env.STORAGE_MODE !== 'json') {
      console.log('⚠️  MongoDB connection failed. Falling back to JSON storage mode.');
      process.env.STORAGE_MODE = 'json';
    }
    
    return null;
  }
};

module.exports = connectDatabase;


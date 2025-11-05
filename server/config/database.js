const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const storageMode = process.env.STORAGE_MODE || 'mongodb';
    
    if (storageMode === 'supabase') {
      console.log('🔵 Using Supabase storage mode');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set');
        throw new Error('Supabase configuration missing');
      }
      
      console.log(`✅ Supabase configured: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}`);
      return null; // Supabase doesn't need a connection object
    }
    
    if (storageMode === 'json') {
      console.log('📁 Using JSON file storage mode');
      return null;
    }
    
    // MongoDB mode
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI not set. Falling back to JSON storage mode.');
      process.env.STORAGE_MODE = 'json';
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
    
    // Fallback to JSON storage if connection fails
    if (process.env.STORAGE_MODE !== 'json' && process.env.STORAGE_MODE !== 'supabase') {
      console.log('⚠️  Database connection failed. Falling back to JSON storage mode.');
      process.env.STORAGE_MODE = 'json';
    }
    
    return null;
  }
};

module.exports = connectDatabase;


const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/LMS-Project';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');
    console.log('📡 Database:', mongoURI);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

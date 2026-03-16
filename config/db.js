const mongoose = require('mongoose');

const connectionOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
};

mongoose.connect(process.env.MONGO_URI, connectionOptions)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
      console.warn('CRITICAL: Connecting to localhost in production? Check your MONGO_URI environment variable on Render.');
    }
    process.exit(1);
  });
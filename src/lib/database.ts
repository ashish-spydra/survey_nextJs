import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survey_db';

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔌 Attempting to connect to MongoDB at:', MONGODB_URI);
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 2) {
      console.log('⏳ Connection already in progress, waiting...');
      // Wait for connection to complete
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', resolve);
      });
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Connection string used:', MONGODB_URI);
    console.error('❌ Please ensure MongoDB is running and accessible');
    throw error; // Re-throw to let the calling function handle it
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

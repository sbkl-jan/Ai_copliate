import mongoose from 'mongoose';

export const connectMongoDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/copilot_db';

  try {
    mongoose.connection.on('connected', () => {
      console.log('AI Agent microservice successfully connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`AI Agent MongoDB connection error: ${err.message}`);
    });

    await mongoose.connect(mongoUri);
  } catch (error: any) {
    console.error(`AI Agent failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

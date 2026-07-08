import mongoose from 'mongoose';
import { createClient } from 'redis';
import logger from '../utils/logger';

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/copilot_db';

  try {
    mongoose.connection.on('connected', () => {
      logger.info('Successfully connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected. Retrying...');
    });

    await mongoose.connect(mongoUri);
  } catch (error: any) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Redis Client Initialisation
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('connect', () => {
  logger.info('Redis client connecting to server...');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected and ready for cache queries');
});

redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err.message}`);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error: any) {
    logger.error(`Failed to start Redis connection: ${error.message}`);
  }
};

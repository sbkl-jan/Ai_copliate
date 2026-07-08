import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import { connectMongoDB, connectRedis, redisClient } from './config/db';
import rabbitMQInstance from './config/rabbitmq';
import { initSocket } from './config/socket';
import logger from './utils/logger';

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5050;
const server = http.createServer(app);

// Initialize Socket.io Server
initSocket(server);

const startServer = async () => {
  try {
    // Connect to Databases & Message Broker
    await connectMongoDB();
    await connectRedis();
    await rabbitMQInstance.connect();

    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server is executing on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error: any) {
    logger.error(`Critical error starting backend server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    // Close Database connections
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis connection closed.');
      }
      
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during graceful shutdown: ${err.message}`);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

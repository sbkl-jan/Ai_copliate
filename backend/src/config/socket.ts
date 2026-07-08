import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware for WebSocket Handshake
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      logger.warn('Socket connection attempt rejected: No token provided');
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data = {
        userId: decoded.userId,
        role: decoded.role,
        businessId: decoded.businessId,
      };
      next();
    } catch (err: any) {
      logger.warn(`Socket connection attempt rejected: Invalid token - ${err.message}`);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, role, businessId } = socket.data;
    logger.info(`Socket connected: ${socket.id} (User: ${userId}, Business: ${businessId})`);

    // Join isolated tenant rooms
    socket.join(`business_${businessId}`);
    socket.join(`user_${userId}`);

    // Join dynamic conversation chats
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat_${chatId}`);
      logger.debug(`User ${userId} joined room: chat_${chatId}`);
    });

    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat_${chatId}`);
      logger.debug(`User ${userId} left room: chat_${chatId}`);
    });

    // Handle Live Typing Indicators
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat_${data.chatId}`).emit('typing_status', {
        chatId: data.chatId,
        userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialised. Please call initSocket(server) first.');
  }
  return io;
};

// Messaging & Notifications helper broadcasters
export const broadcastToBusiness = (businessId: string, event: string, data: any): void => {
  if (io) {
    io.to(`business_${businessId}`).emit(event, data);
  }
};

export const sendToUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const broadcastToChat = (chatId: string, event: string, data: any): void => {
  if (io) {
    io.to(`chat_${chatId}`).emit(event, data);
  }
};

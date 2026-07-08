import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { firebaseApp } from '../config/firebase';
import logger from '../utils/logger';

// Extend Express Request interface to host user context
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * requireAuth middleware
 * Verifies custom JWT token passed in Authorization: Bearer <token>.
 * Fallback to Firebase admin verification if client requests OAuth verification directly.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 1. Try to verify as custom local JWT
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (localJwtError) {
      // 2. If JWT is invalid, check if we can verify via Firebase Admin
      if (firebaseApp) {
        try {
          const decodedFirebaseToken = await firebaseApp.auth().verifyIdToken(token);
          // If validated, user context is loaded but needs mapping in controllers.
          // For endpoints relying on req.user, mapping should occur in sign-in routes.
          // So we attach a generic payload or allow routing if specific mapping exists.
          req.user = {
            userId: decodedFirebaseToken.uid,
            role: (decodedFirebaseToken.role as any) || 'customer',
            businessId: (decodedFirebaseToken.businessId as string) || '',
          };
          return next();
        } catch (firebaseError) {
          logger.warn('Token verification failed on both local JWT and Firebase authentication.');
        }
      }
      
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }
  } catch (error: any) {
    logger.error(`Authentication Middleware Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal authentication verification error' });
  }
};

/**
 * requireRole middleware
 * Ensures the authenticated user possesses one of the allowed roles.
 */
export const requireRole = (allowedRoles: ('admin' | 'manager' | 'employee' | 'customer')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      logger.warn(`Access denied. Role [${req.user.role}] is insufficient for target path: ${req.originalUrl}`);
      return res.status(403).json({ success: false, error: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
};

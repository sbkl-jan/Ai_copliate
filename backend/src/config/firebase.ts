import admin from 'firebase-admin';
import logger from '../utils/logger';

let firebaseApp: admin.app.App | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace escaped newlines from environment config strings
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    logger.info('Firebase Admin SDK successfully initialised');
  } else {
    logger.warn('Firebase configuration missing in .env. Falling back to local JWT/Password flow only.');
  }
} catch (error: any) {
  logger.error(`Error initializing Firebase Admin SDK: ${error.message}`);
}

export { firebaseApp };

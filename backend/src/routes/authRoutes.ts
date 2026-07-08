import { Router } from 'express';
import { register, login, refresh, firebaseSSO } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/firebase-sso', firebaseSSO);

export default router;

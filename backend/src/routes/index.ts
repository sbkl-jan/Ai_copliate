import { Router } from 'express';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import leadRoutes from './leadRoutes';
import appointmentRoutes from './appointmentRoutes';
import ocrRoutes from './ocrRoutes';
import notificationRoutes from './notificationRoutes';
import workflowRoutes from './workflowRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/leads', leadRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/documents', ocrRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workflows', workflowRoutes);

export default router;

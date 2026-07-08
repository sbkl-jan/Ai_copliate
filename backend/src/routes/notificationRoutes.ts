import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { getNotifications, markAsRead } from '../controllers/notificationController';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['admin', 'manager', 'employee', 'customer']), getNotifications);
router.patch('/:id/read', requireRole(['admin', 'manager', 'employee', 'customer']), markAsRead);

export default router;

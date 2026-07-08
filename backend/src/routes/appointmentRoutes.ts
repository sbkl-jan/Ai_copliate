import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['admin', 'manager', 'employee', 'customer']), getAppointments);
router.post('/', requireRole(['admin', 'manager', 'employee', 'customer']), createAppointment);
router.patch('/:id/status', requireRole(['admin', 'manager', 'employee']), updateAppointmentStatus);

export default router;

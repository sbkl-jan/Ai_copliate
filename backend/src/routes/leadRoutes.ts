import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadController';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['admin', 'manager', 'employee']), getLeads);
router.get('/:id', requireRole(['admin', 'manager', 'employee']), getLeadById);
router.post('/', requireRole(['admin', 'manager', 'employee']), createLead);
router.put('/:id', requireRole(['admin', 'manager', 'employee']), updateLead);
router.delete('/:id', requireRole(['admin', 'manager']), deleteLead);

export default router;

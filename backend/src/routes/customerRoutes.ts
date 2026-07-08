import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';

const router = Router();

// Protect all customer endpoints
router.use(requireAuth);

router.get('/', requireRole(['admin', 'manager', 'employee']), getCustomers);
router.get('/:id', requireRole(['admin', 'manager', 'employee']), getCustomerById);
router.post('/', requireRole(['admin', 'manager', 'employee']), createCustomer);
router.put('/:id', requireRole(['admin', 'manager', 'employee']), updateCustomer);
router.delete('/:id', requireRole(['admin', 'manager']), deleteCustomer);

export default router;

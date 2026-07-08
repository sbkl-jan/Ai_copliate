import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { initiateWorkflow, getWorkflowStatus } from '../controllers/workflowController';

const router = Router();

router.use(requireAuth);

router.post('/initiate', requireRole(['admin', 'manager', 'employee', 'customer']), initiateWorkflow);
router.get('/:id', requireRole(['admin', 'manager', 'employee', 'customer']), getWorkflowStatus);

export default router;

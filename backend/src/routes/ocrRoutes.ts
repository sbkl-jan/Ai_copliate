import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
} from '../controllers/ocrController';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(['admin', 'manager', 'employee']), getDocuments);
router.get('/:id', requireRole(['admin', 'manager', 'employee']), getDocumentById);
router.post('/upload', requireRole(['admin', 'manager', 'employee']), uploadDocument);

export default router;

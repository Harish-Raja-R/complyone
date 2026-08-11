import { Router } from 'express';
import { getActivityLogs } from '../controllers/logController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Executive', 'Compliance Officer']), getActivityLogs);

export default router;

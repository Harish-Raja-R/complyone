import express from 'express';
import { getRisks, createRisk, updateRisk, deleteRisk } from '../controllers/riskController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getRisks);
router.post('/', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), createRisk);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), updateRisk);
router.delete('/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager']), deleteRisk);

export default router;

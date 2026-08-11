import express from 'express';
import {
  getAudits, getAuditById, createAudit, updateAudit, deleteAudit,
  getFindingsByAudit, createFinding, updateFinding, deleteFinding
} from '../controllers/auditController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAudits);
router.get('/:id', authenticateToken, getAuditById);
router.post('/', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Auditor']), createAudit);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Auditor']), updateAudit);
router.delete('/:id', authenticateToken, requireRole(['Admin']), deleteAudit);

// Audit findings
router.get('/:id/findings', authenticateToken, getFindingsByAudit);
router.post('/:id/findings', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Auditor']), createFinding);
router.put('/findings/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Auditor']), updateFinding);
router.delete('/findings/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager']), deleteFinding);

export default router;

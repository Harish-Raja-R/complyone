import express from 'express';
import { uploadEvidence, uploadMiddleware, getEvidence, getEvidenceById, reviewEvidence, downloadEvidenceFile } from '../controllers/evidenceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', authenticateToken, uploadMiddleware, uploadEvidence);
router.get('/', authenticateToken, getEvidence);
router.get('/:id', authenticateToken, getEvidenceById);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), reviewEvidence);
router.get('/:id/download', authenticateToken, downloadEvidenceFile);

export default router;

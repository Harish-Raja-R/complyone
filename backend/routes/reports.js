import express from 'express';
import {
  getDashboardStats,
  getComplianceDistribution,
  getDepartmentCompliance,
  getRiskDistribution,
  getTaskTrend,
  exportReportCSV
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard-stats', authenticateToken, getDashboardStats);
router.get('/compliance-distribution', authenticateToken, getComplianceDistribution);
router.get('/department-compliance', authenticateToken, getDepartmentCompliance);
router.get('/risk-distribution', authenticateToken, getRiskDistribution);
router.get('/task-trend', authenticateToken, getTaskTrend);
router.get('/export', authenticateToken, exportReportCSV);

export default router;

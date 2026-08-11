import express from 'express';
import {
  getRegulations, getRegulationById, createRegulation, updateRegulation, deleteRegulation,
  getRequirements, getRequirementById, createRequirement, updateRequirement, deleteRequirement,
  getControls, getControlById, createControl, updateControl, deleteControl,
  getTasks, getTaskById, createTask, updateTask, deleteTask
} from '../controllers/complianceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Regulations routes
router.get('/regulations', authenticateToken, getRegulations);
router.get('/regulations/:id', authenticateToken, getRegulationById);
router.post('/regulations', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), createRegulation);
router.put('/regulations/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), updateRegulation);
router.delete('/regulations/:id', authenticateToken, requireRole(['Admin']), deleteRegulation);

// Requirements routes
router.get('/requirements', authenticateToken, getRequirements);
router.get('/requirements/:id', authenticateToken, getRequirementById);
router.post('/requirements', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), createRequirement);
router.put('/requirements/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), updateRequirement);
router.delete('/requirements/:id', authenticateToken, requireRole(['Admin']), deleteRequirement);

// Controls routes
router.get('/controls', authenticateToken, getControls);
router.get('/controls/:id', authenticateToken, getControlById);
router.post('/controls', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), createControl);
router.put('/controls/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), updateControl);
router.delete('/controls/:id', authenticateToken, requireRole(['Admin']), deleteControl);

// Tasks routes
router.get('/tasks', authenticateToken, getTasks);
router.get('/tasks/:id', authenticateToken, getTaskById);
router.post('/tasks', authenticateToken, requireRole(['Admin', 'Compliance Manager', 'Compliance Officer']), createTask);
router.put('/tasks/:id', authenticateToken, updateTask); // Employees can update status, officers can update everything
router.delete('/tasks/:id', authenticateToken, requireRole(['Admin', 'Compliance Manager']), deleteTask);

export default router;

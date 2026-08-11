import express from 'express';
import { register, login, logout, getProfile, getUsers } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, getUsers);

export default router;

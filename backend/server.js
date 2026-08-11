import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import configuration to auto-initialize DB
import './config/db.js';

// Import route files
import authRoutes from './routes/auth.js';
import complianceRoutes from './routes/compliance.js';
import evidenceRoutes from './routes/evidence.js';
import riskRoutes from './routes/risks.js';
import auditRoutes from './routes/audits.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import logRoutes from './routes/logs.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For local dev integration, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express parse middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists and serve files statically
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api', complianceRoutes); // exposes regulations, requirements, controls, tasks
app.use('/api/evidence', evidenceRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date() });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `API Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`ComplyOne Backend Server running on port ${PORT}`);
});

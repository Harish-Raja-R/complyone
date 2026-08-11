import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { run, query, queryOne } from '../config/db.js';
import complianceEmitter from '../events/events.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer memory storage
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Maximum file size 10MB
}).single('file');

export const uploadEvidence = async (req, res) => {
  const { task_id } = req.body;
  if (!task_id) {
    return res.status(400).json({ success: false, message: 'Task ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  // Validate File Extension and MIME Type
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.txt'];
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ success: false, message: `Unsupported file type: ${ext}` });
  }

  try {
    // Check if task exists
    const task = await queryOne('SELECT * FROM tasks WHERE id = ?', [task_id]);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Ensure upload directory exists
    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
    const targetFilePath = path.join(uploadDir, uniqueFileName);
    const databaseFilePath = `uploads/${uniqueFileName}`;

    // --- STREAMS & BUFFERS ---
    // Create a readable stream from the multer buffer and pipe it to the writable stream
    const readable = Readable.from(req.file.buffer);
    const writable = fs.createWriteStream(targetFilePath);

    await new Promise((resolve, reject) => {
      readable.pipe(writable);
      writable.on('finish', resolve);
      writable.on('error', reject);
    });

    // Write metadata to SQLite
    const result = await run(
      'INSERT INTO evidence (task_id, file_name, file_path, uploaded_by, status) VALUES (?, ?, ?, ?, ?)',
      [task_id, req.file.originalname, databaseFilePath, req.user.id, 'Pending Review']
    );

    // Update Task status to Submitted
    await run('UPDATE tasks SET status = ? WHERE id = ?', ['Submitted', task_id]);

    // Emit event
    complianceEmitter.emit('evidence.uploaded', {
      evidenceId: result.id,
      taskId: task_id,
      fileName: req.file.originalname,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded and processed successfully via stream buffer',
      evidenceId: result.id,
      filePath: databaseFilePath
    });
  } catch (err) {
    console.error('Error during evidence upload:', err);
    res.status(500).json({ success: false, message: 'Server error during evidence processing', error: err.message });
  }
};

export const getEvidence = async (req, res) => {
  const { task_id } = req.query;
  let sql = `
    SELECT e.*, t.title AS task_title, u.name AS uploaded_by_name, rev.name AS reviewed_by_name
    FROM evidence e
    JOIN tasks t ON e.task_id = t.id
    LEFT JOIN users u ON e.uploaded_by = u.id
    LEFT JOIN users rev ON e.reviewed_by = rev.id
    WHERE 1=1
  `;
  const params = [];

  if (task_id) {
    sql += ' AND e.task_id = ?';
    params.push(task_id);
  }

  // If Employee, only show their uploaded evidence
  if (req.user.role === 'Employee') {
    sql += ' AND e.uploaded_by = ?';
    params.push(req.user.id);
  }

  try {
    const rows = await query(sql, params);
    res.status(200).json({ success: true, evidence: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving evidence', error: err.message });
  }
};

export const getEvidenceById = async (req, res) => {
  try {
    const row = await queryOne(`
      SELECT e.*, t.title AS task_title, u.name AS uploaded_by_name, rev.name AS reviewed_by_name
      FROM evidence e
      JOIN tasks t ON e.task_id = t.id
      LEFT JOIN users u ON e.uploaded_by = u.id
      LEFT JOIN users rev ON e.reviewed_by = rev.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    if (req.user.role === 'Employee' && row.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
    }

    res.status(200).json({ success: true, evidence: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving evidence details', error: err.message });
  }
};

export const reviewEvidence = async (req, res) => {
  const { status, comments } = req.body;
  const { id } = req.params;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Valid status (Approved or Rejected) is required' });
  }

  try {
    const evidenceItem = await queryOne(`
      SELECT e.*, t.title AS task_title, t.assigned_to AS task_owner_id, t.requirement_id
      FROM evidence e
      JOIN tasks t ON e.task_id = t.id
      WHERE e.id = ?
    `, [id]);

    if (!evidenceItem) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    // Update evidence review status
    await run(
      'UPDATE evidence SET status = ?, reviewed_by = ?, comments = ? WHERE id = ?',
      [status, req.user.id, comments, id]
    );

    // If approved, set task to Under Review or Completed. Usually, once approved, task status is Completed, requirement status is updated to Compliant
    const taskStatus = status === 'Approved' ? 'Completed' : 'To Do';
    await run('UPDATE tasks SET status = ? WHERE id = ?', [taskStatus, evidenceItem.task_id]);

    if (status === 'Approved') {
      // Update linked requirement to Compliant if all tasks for that requirement are Completed
      const pendingTasks = await queryOne(
        "SELECT COUNT(id) AS count FROM tasks WHERE requirement_id = ? AND status != 'Completed'",
        [evidenceItem.requirement_id]
      );
      if (pendingTasks.count === 0) {
        await run('UPDATE requirements SET status = ? WHERE id = ?', ['Compliant', evidenceItem.requirement_id]);
      }
    } else {
      // If rejected, set requirement status to Non-Compliant/Partially Compliant
      await run('UPDATE requirements SET status = ? WHERE id = ?', ['Non-Compliant', evidenceItem.requirement_id]);
    }

    // Emit event
    complianceEmitter.emit('evidence.reviewed', {
      evidenceId: id,
      status,
      comments,
      reviewerId: req.user.id,
      taskOwnerId: evidenceItem.task_owner_id,
      taskTitle: evidenceItem.task_title
    });

    res.status(200).json({ success: true, message: `Evidence reviewed and ${status.toLowerCase()}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error reviewing evidence', error: err.message });
  }
};

// Stream file download for premium media performance
export const downloadEvidenceFile = async (req, res) => {
  try {
    const evidenceItem = await queryOne('SELECT file_path, file_name FROM evidence WHERE id = ?', [req.params.id]);
    if (!evidenceItem) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    const fullPath = path.resolve(__dirname, '../../', evidenceItem.file_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${evidenceItem.file_name}"`);
    const readStream = fs.createReadStream(fullPath);
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error downloading file', error: err.message });
  }
};

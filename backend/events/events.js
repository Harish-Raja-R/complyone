import { EventEmitter } from 'events';
import { run } from '../config/db.js';

class ComplianceEventEmitter extends EventEmitter {}

const complianceEmitter = new ComplianceEventEmitter();

// Utility function to log activities and notify users
const createSystemNotification = async (userId, title, message, type) => {
  try {
    await run(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
  } catch (err) {
    console.error('Error creating system notification:', err.message);
  }
};

const createActivityLog = async (userId, action, entity, entityId, ipAddress = '127.0.0.1') => {
  try {
    await run(
      'INSERT INTO activity_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entity, entityId, ipAddress]
    );
  } catch (err) {
    console.error('Error creating activity log:', err.message);
  }
};

// --- Register Event Listeners ---

// 1. Task Created
complianceEmitter.on('task.created', async (data) => {
  const { taskId, assignedTo, title, createdBy } = data;
  await createActivityLog(createdBy, 'Create', 'Task', taskId);
  if (assignedTo) {
    await createSystemNotification(
      assignedTo,
      'New Task Assigned',
      `You have been assigned the task: "${title}".`,
      'task.created'
    );
  }
});

// 2. Task Completed (Status updated to Completed)
complianceEmitter.on('task.completed', async (data) => {
  const { taskId, title, assignedTo } = data;
  await createActivityLog(assignedTo, 'Status changes', 'Task', taskId);
  // Notify compliance managers or officers
  // In a real application, we would search for users with managerial roles. Here, we can create activity logs and general alerts.
  console.log(`Event [task.completed] fired for task ID: ${taskId}`);
});

// 3. Task Overdue
complianceEmitter.on('task.overdue', async (data) => {
  const { taskId, title, assignedTo } = data;
  await createSystemNotification(
    assignedTo,
    'Task Overdue Alert',
    `The task: "${title}" is overdue. Please upload evidence.`,
    'task.overdue'
  );
  await createActivityLog(assignedTo, 'Status changes', 'Task', taskId);
});

// 4. Evidence Uploaded
complianceEmitter.on('evidence.uploaded', async (data) => {
  const { evidenceId, taskId, fileName, uploadedBy } = data;
  await createActivityLog(uploadedBy, 'Upload', 'Evidence', evidenceId);
  // Notify officers that evidence needs review
  console.log(`Event [evidence.uploaded] fired: File "${fileName}" for Task ${taskId}`);
});

// 5. Evidence Approved / Rejected
complianceEmitter.on('evidence.reviewed', async (data) => {
  const { evidenceId, status, comments, reviewerId, taskOwnerId, taskTitle } = data;
  const action = status === 'Approved' ? 'Approve' : 'Reject';
  await createActivityLog(reviewerId, action, 'Evidence', evidenceId);
  await createSystemNotification(
    taskOwnerId,
    `Evidence ${status}`,
    `Your evidence for "${taskTitle}" was ${status.toLowerCase()}. Comments: "${comments || 'None'}"`,
    status === 'Approved' ? 'evidence.approved' : 'evidence.rejected'
  );
});

// 6. Audit Created
complianceEmitter.on('audit.created', async (data) => {
  const { auditId, name, auditorId, createdBy } = data;
  await createActivityLog(createdBy, 'Create', 'Audit', auditId);
  if (auditorId) {
    await createSystemNotification(
      auditorId,
      'Audit Scheduled',
      `You are assigned to conduct the audit: "${name}".`,
      'audit.created'
    );
  }
});

// 7. Risk Created
complianceEmitter.on('risk.created', async (data) => {
  const { riskId, name, ownerId, createdBy } = data;
  await createActivityLog(createdBy, 'Create', 'Risk', riskId);
  if (ownerId) {
    await createSystemNotification(
      ownerId,
      'Risk Ownership Assigned',
      `You have been assigned as the owner for Risk: "${name}".`,
      'risk.created'
    );
  }
});

// 8. Regulation Updated
complianceEmitter.on('regulation.updated', async (data) => {
  const { regulationId, name, updatedBy } = data;
  await createActivityLog(updatedBy, 'Update', 'Regulation', regulationId);
  console.log(`Event [regulation.updated] fired for regulation ID: ${regulationId}`);
});

// General Log Helper
complianceEmitter.on('log.activity', async (data) => {
  const { userId, action, entity, entityId, ipAddress } = data;
  await createActivityLog(userId, action, entity, entityId, ipAddress);
});

export default complianceEmitter;
export { createActivityLog };

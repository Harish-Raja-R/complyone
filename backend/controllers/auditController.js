import { run, query, queryOne } from '../config/db.js';
import complianceEmitter from '../events/events.js';

// --- AUDITS ---

export const getAudits = async (req, res) => {
  try {
    const audits = await query(`
      SELECT a.*, r.name AS regulation_name, u.name AS auditor_name
      FROM audits a
      LEFT JOIN regulations r ON a.regulation_id = r.id
      LEFT JOIN users u ON a.auditor_id = u.id
    `);
    res.status(200).json({ success: true, audits });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving audits', error: err.message });
  }
};

export const getAuditById = async (req, res) => {
  try {
    const audit = await queryOne(`
      SELECT a.*, r.name AS regulation_name, u.name AS auditor_name
      FROM audits a
      LEFT JOIN regulations r ON a.regulation_id = r.id
      LEFT JOIN users u ON a.auditor_id = u.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }
    res.status(200).json({ success: true, audit });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving audit details', error: err.message });
  }
};

export const createAudit = async (req, res) => {
  const { name, regulation_id, auditor_id, start_date, end_date, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Audit name is required' });
  }

  try {
    const result = await run(
      'INSERT INTO audits (name, regulation_id, auditor_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, regulation_id, auditor_id, start_date, end_date, status || 'Planned']
    );

    complianceEmitter.emit('audit.created', {
      auditId: result.id,
      name,
      auditorId: auditor_id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, auditId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating audit', error: err.message });
  }
};

export const updateAudit = async (req, res) => {
  const { name, regulation_id, auditor_id, start_date, end_date, status } = req.body;
  try {
    const existing = await queryOne('SELECT id FROM audits WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    await run(
      'UPDATE audits SET name = ?, regulation_id = ?, auditor_id = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, regulation_id, auditor_id, start_date, end_date, status, req.params.id]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Update',
      entity: 'Audit',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Audit updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating audit', error: err.message });
  }
};

export const deleteAudit = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM audits WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    await run('DELETE FROM audits WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Audit',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Audit deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting audit', error: err.message });
  }
};

// --- FINDINGS (associated with Audits) ---

export const getFindingsByAudit = async (req, res) => {
  try {
    const findings = await query('SELECT * FROM findings WHERE audit_id = ?', [req.params.id]);
    res.status(200).json({ success: true, findings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving findings', error: err.message });
  }
};

export const createFinding = async (req, res) => {
  const { description, severity, corrective_action, due_date, status } = req.body;
  const auditId = req.params.id;

  if (!description) {
    return res.status(400).json({ success: false, message: 'Finding description is required' });
  }

  try {
    // Check if audit exists
    const audit = await queryOne('SELECT id FROM audits WHERE id = ?', [auditId]);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    const result = await run(
      'INSERT INTO findings (audit_id, description, severity, corrective_action, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [auditId, description, severity || 'Minor', corrective_action, due_date, status || 'Open']
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Create',
      entity: 'Finding',
      entityId: result.id
    });

    res.status(201).json({ success: true, findingId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating finding', error: err.message });
  }
};

export const updateFinding = async (req, res) => {
  const { description, severity, corrective_action, due_date, status } = req.body;
  try {
    const existing = await queryOne('SELECT id FROM findings WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    await run(
      'UPDATE findings SET description = ?, severity = ?, corrective_action = ?, due_date = ?, status = ? WHERE id = ?',
      [description, severity, corrective_action, due_date, status, req.params.id]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Update',
      entity: 'Finding',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Finding updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating finding', error: err.message });
  }
};

export const deleteFinding = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM findings WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    await run('DELETE FROM findings WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Finding',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Finding deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting finding', error: err.message });
  }
};

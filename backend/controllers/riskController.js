import { run, query, queryOne } from '../config/db.js';
import complianceEmitter from '../events/events.js';

export const getRisks = async (req, res) => {
  try {
    const risks = await query(`
      SELECT r.*, u.name AS owner_name
      FROM risks r
      LEFT JOIN users u ON r.owner_id = u.id
    `);
    res.status(200).json({ success: true, risks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving risks', error: err.message });
  }
};

export const createRisk = async (req, res) => {
  const { name, description, probability, impact, owner_id, mitigation, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Risk name is required' });
  }

  const prob = parseInt(probability) || 3;
  const imp = parseInt(impact) || 3;
  const riskScore = prob * imp;

  try {
    const result = await run(
      'INSERT INTO risks (name, description, probability, impact, risk_score, owner_id, mitigation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, prob, imp, riskScore, owner_id, mitigation, status || 'Active']
    );

    complianceEmitter.emit('risk.created', {
      riskId: result.id,
      name,
      ownerId: owner_id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, riskId: result.id, risk_score: riskScore });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating risk', error: err.message });
  }
};

export const updateRisk = async (req, res) => {
  const { name, description, probability, impact, owner_id, mitigation, status } = req.body;
  const prob = parseInt(probability) || 3;
  const imp = parseInt(impact) || 3;
  const riskScore = prob * imp;

  try {
    const existing = await queryOne('SELECT id FROM risks WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    await run(
      'UPDATE risks SET name = ?, description = ?, probability = ?, impact = ?, risk_score = ?, owner_id = ?, mitigation = ?, status = ? WHERE id = ?',
      [name, description, prob, imp, riskScore, owner_id, mitigation, status, req.params.id]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Update',
      entity: 'Risk',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Risk updated successfully', risk_score: riskScore });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating risk', error: err.message });
  }
};

export const deleteRisk = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM risks WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    await run('DELETE FROM risks WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Risk',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Risk deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting risk', error: err.message });
  }
};

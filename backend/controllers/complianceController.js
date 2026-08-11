import { run, query, queryOne } from '../config/db.js';
import complianceEmitter from '../events/events.js';

// --- REGULATIONS ---

export const getRegulations = async (req, res) => {
  const { search, category, status } = req.query;
  let sql = 'SELECT * FROM regulations WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR regulatory_body LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  try {
    const rows = await query(sql, params);
    res.status(200).json({ success: true, regulations: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving regulations', error: err.message });
  }
};

export const getRegulationById = async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM regulations WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Regulation not found' });
    }
    res.status(200).json({ success: true, regulation: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving regulation', error: err.message });
  }
};

export const createRegulation = async (req, res) => {
  const { name, regulatory_body, category, description, effective_date, status, reference_url } = req.body;
  if (!name || !regulatory_body || !category) {
    return res.status(400).json({ success: false, message: 'Name, Regulatory Body, and Category are required' });
  }

  try {
    const result = await run(
      'INSERT INTO regulations (name, regulatory_body, category, description, effective_date, status, reference_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, regulatory_body, category, description, effective_date, status || 'Active', reference_url]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Create',
      entity: 'Regulation',
      entityId: result.id
    });

    res.status(201).json({ success: true, regulationId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating regulation', error: err.message });
  }
};

export const updateRegulation = async (req, res) => {
  const { name, regulatory_body, category, description, effective_date, status, reference_url } = req.body;
  try {
    const existing = await queryOne('SELECT id FROM regulations WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Regulation not found' });
    }

    await run(
      'UPDATE regulations SET name = ?, regulatory_body = ?, category = ?, description = ?, effective_date = ?, status = ?, reference_url = ? WHERE id = ?',
      [name, regulatory_body, category, description, effective_date, status, reference_url, req.params.id]
    );

    complianceEmitter.emit('regulation.updated', {
      regulationId: req.params.id,
      name,
      updatedBy: req.user.id
    });

    res.status(200).json({ success: true, message: 'Regulation updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating regulation', error: err.message });
  }
};

export const deleteRegulation = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM regulations WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Regulation not found' });
    }

    await run('DELETE FROM regulations WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Regulation',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Regulation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting regulation', error: err.message });
  }
};


// --- REQUIREMENTS ---

export const getRequirements = async (req, res) => {
  const { regulation_id, department, status, search } = req.query;
  let sql = `
    SELECT req.*, reg.name AS regulation_name, u.name AS owner_name 
    FROM requirements req
    JOIN regulations reg ON req.regulation_id = reg.id
    LEFT JOIN users u ON req.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (regulation_id) {
    sql += ' AND req.regulation_id = ?';
    params.push(regulation_id);
  }
  if (department) {
    sql += ' AND req.department = ?';
    params.push(department);
  }
  if (status) {
    sql += ' AND req.status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (req.title LIKE ? OR req.description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  try {
    const rows = await query(sql, params);
    res.status(200).json({ success: true, requirements: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving requirements', error: err.message });
  }
};

export const getRequirementById = async (req, res) => {
  try {
    const row = await queryOne(`
      SELECT req.*, reg.name AS regulation_name, u.name AS owner_name
      FROM requirements req
      JOIN regulations reg ON req.regulation_id = reg.id
      LEFT JOIN users u ON req.owner_id = u.id
      WHERE req.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    res.status(200).json({ success: true, requirement: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving requirement', error: err.message });
  }
};

export const createRequirement = async (req, res) => {
  const { regulation_id, title, description, owner_id, department, priority, due_date, status } = req.body;
  if (!regulation_id || !title || !department) {
    return res.status(400).json({ success: false, message: 'Regulation ID, Title, and Department are required' });
  }

  try {
    const result = await run(
      'INSERT INTO requirements (regulation_id, title, description, owner_id, department, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [regulation_id, title, description, owner_id, department, priority || 'Medium', due_date, status || 'Not Started']
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Create',
      entity: 'Requirement',
      entityId: result.id
    });

    res.status(201).json({ success: true, requirementId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating requirement', error: err.message });
  }
};

export const updateRequirement = async (req, res) => {
  const { regulation_id, title, description, owner_id, department, priority, due_date, status } = req.body;
  try {
    const existing = await queryOne('SELECT id FROM requirements WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    await run(
      'UPDATE requirements SET regulation_id = ?, title = ?, description = ?, owner_id = ?, department = ?, priority = ?, due_date = ?, status = ? WHERE id = ?',
      [regulation_id, title, description, owner_id, department, priority, due_date, status, req.params.id]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Update',
      entity: 'Requirement',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Requirement updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating requirement', error: err.message });
  }
};

export const deleteRequirement = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM requirements WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    await run('DELETE FROM requirements WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Requirement',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Requirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting requirement', error: err.message });
  }
};


// --- CONTROLS ---

export const getControls = async (req, res) => {
  const { requirement_id, status } = req.query;
  let sql = `
    SELECT c.*, req.title AS requirement_title, u.name AS owner_name
    FROM controls c
    JOIN requirements req ON c.requirement_id = req.id
    LEFT JOIN users u ON c.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (requirement_id) {
    sql += ' AND c.requirement_id = ?';
    params.push(requirement_id);
  }
  if (status) {
    sql += ' AND c.status = ?';
    params.push(status);
  }

  try {
    const rows = await query(sql, params);
    res.status(200).json({ success: true, controls: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving controls', error: err.message });
  }
};

export const getControlById = async (req, res) => {
  try {
    const row = await queryOne(`
      SELECT c.*, req.title AS requirement_title, u.name AS owner_name
      FROM controls c
      JOIN requirements req ON c.requirement_id = req.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Control not found' });
    }
    res.status(200).json({ success: true, control: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving control', error: err.message });
  }
};

export const createControl = async (req, res) => {
  const { requirement_id, name, description, owner_id, frequency, effectiveness, status, last_reviewed, next_review } = req.body;
  if (!requirement_id || !name) {
    return res.status(400).json({ success: false, message: 'Requirement ID and Name are required' });
  }

  try {
    const result = await run(
      'INSERT INTO controls (requirement_id, name, description, owner_id, frequency, effectiveness, status, last_reviewed, next_review) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [requirement_id, name, description, owner_id, frequency || 'Continuous', effectiveness || 'Not Tested', status || 'Active', last_reviewed, next_review]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Create',
      entity: 'Control',
      entityId: result.id
    });

    res.status(201).json({ success: true, controlId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating control', error: err.message });
  }
};

export const updateControl = async (req, res) => {
  const { requirement_id, name, description, owner_id, frequency, effectiveness, status, last_reviewed, next_review } = req.body;
  try {
    const existing = await queryOne('SELECT id FROM controls WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Control not found' });
    }

    await run(
      'UPDATE controls SET requirement_id = ?, name = ?, description = ?, owner_id = ?, frequency = ?, effectiveness = ?, status = ?, last_reviewed = ?, next_review = ? WHERE id = ?',
      [requirement_id, name, description, owner_id, frequency, effectiveness, status, last_reviewed, next_review, req.params.id]
    );

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Update',
      entity: 'Control',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Control updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating control', error: err.message });
  }
};

export const deleteControl = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM controls WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Control not found' });
    }

    await run('DELETE FROM controls WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Control',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Control deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting control', error: err.message });
  }
};


// --- TASKS ---

export const getTasks = async (req, res) => {
  const { assigned_to, status, requirement_id } = req.query;
  let sql = `
    SELECT t.*, req.title AS requirement_title, u.name AS assigned_to_name
    FROM tasks t
    JOIN requirements req ON t.requirement_id = req.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (assigned_to) {
    sql += ' AND t.assigned_to = ?';
    params.push(assigned_to);
  }
  if (status) {
    sql += ' AND t.status = ?';
    params.push(status);
  }
  if (requirement_id) {
    sql += ' AND t.requirement_id = ?';
    params.push(requirement_id);
  }

  // Employees should only view their assigned tasks
  if (req.user.role === 'Employee') {
    sql += ' AND t.assigned_to = ?';
    params.push(req.user.id);
  }

  try {
    const rows = await query(sql, params);
    res.status(200).json({ success: true, tasks: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving tasks', error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const row = await queryOne(`
      SELECT t.*, req.title AS requirement_title, u.name AS assigned_to_name
      FROM tasks t
      JOIN requirements req ON t.requirement_id = req.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'Employee' && row.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this task' });
    }

    res.status(200).json({ success: true, task: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving task', error: err.message });
  }
};

export const createTask = async (req, res) => {
  const { requirement_id, assigned_to, title, description, priority, due_date, status } = req.body;
  if (!requirement_id || !title) {
    return res.status(400).json({ success: false, message: 'Requirement ID and Title are required' });
  }

  try {
    const result = await run(
      'INSERT INTO tasks (requirement_id, assigned_to, title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [requirement_id, assigned_to, title, description, priority || 'Medium', due_date, status || 'To Do']
    );

    complianceEmitter.emit('task.created', {
      taskId: result.id,
      assignedTo: assigned_to,
      title,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, taskId: result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  const { requirement_id, assigned_to, title, description, priority, due_date, status } = req.body;
  try {
    const existing = await queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Role verification: Employee can only update the status of their task, not rename or reassign it
    if (req.user.role === 'Employee') {
      if (existing.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own assigned tasks' });
      }
      await run('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    } else {
      await run(
        'UPDATE tasks SET requirement_id = ?, assigned_to = ?, title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ?',
        [requirement_id, assigned_to, title, description, priority, due_date, status, req.params.id]
      );
    }

    // Emit event if task completes
    if (status === 'Completed' && existing.status !== 'Completed') {
      complianceEmitter.emit('task.completed', {
        taskId: req.params.id,
        title: title || existing.title,
        assignedTo: assigned_to || existing.assigned_to
      });
    }

    res.status(200).json({ success: true, message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await run('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    complianceEmitter.emit('log.activity', {
      userId: req.user.id,
      action: 'Delete',
      entity: 'Task',
      entityId: req.params.id
    });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting task', error: err.message });
  }
};

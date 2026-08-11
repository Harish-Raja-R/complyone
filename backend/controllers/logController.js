import { query } from '../config/db.js';

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await query(`
      SELECT l.*, u.name AS user_name, u.email AS user_email
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `);
    res.status(200).json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving activity logs', error: err.message });
  }
};

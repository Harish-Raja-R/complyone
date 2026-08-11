import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { run, queryOne, query } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';
import complianceEmitter from '../events/events.js';

export const register = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const result = await run(
      'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department]
    );

    // Log registration activity
    complianceEmitter.emit('log.activity', {
      userId: result.id,
      action: 'Register',
      entity: 'User',
      entityId: result.id
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    complianceEmitter.emit('log.activity', {
      userId: user.id,
      action: 'Login',
      entity: 'User',
      entityId: user.id
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await queryOne('SELECT id, name, email, role, department, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving profile', error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      complianceEmitter.emit('log.activity', {
        userId: req.user.id,
        action: 'Logout',
        entity: 'User',
        entityId: req.user.id
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during logout', error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, department FROM users');
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching users', error: err.message });
  }
};

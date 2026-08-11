-- SQLite Database Schema for ComplyOne Platform

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Admin', 'Compliance Manager', 'Compliance Officer', 'Employee', 'Auditor', 'Executive')),
  department TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  regulatory_body TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  effective_date TEXT,
  status TEXT CHECK(status IN ('Active', 'Draft', 'Archived')) DEFAULT 'Active',
  reference_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  regulation_id INTEGER NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  department TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  due_date TEXT,
  status TEXT CHECK(status IN ('Not Started', 'In Progress', 'Compliant', 'Partially Compliant', 'Non-Compliant')) DEFAULT 'Not Started'
);

CREATE TABLE IF NOT EXISTS controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requirement_id INTEGER NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  frequency TEXT CHECK(frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'Continuous')) DEFAULT 'Continuous',
  effectiveness TEXT CHECK(effectiveness IN ('Effective', 'Partially Effective', 'Ineffective', 'Not Tested')) DEFAULT 'Not Tested',
  status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
  last_reviewed TEXT,
  next_review TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requirement_id INTEGER NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  due_date TEXT,
  status TEXT CHECK(status IN ('To Do', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Overdue')) DEFAULT 'To Do',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK(status IN ('Pending Review', 'Approved', 'Rejected', 'Expired')) DEFAULT 'Pending Review',
  comments TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  probability INTEGER CHECK(probability BETWEEN 1 AND 5) DEFAULT 3,
  impact INTEGER CHECK(impact BETWEEN 1 AND 5) DEFAULT 3,
  risk_score INTEGER NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  mitigation TEXT,
  status TEXT CHECK(status IN ('Active', 'Mitigated', 'Accepted')) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  regulation_id INTEGER REFERENCES regulations(id) ON DELETE SET NULL,
  auditor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT CHECK(status IN ('Planned', 'In Progress', 'Completed', 'Closed')) DEFAULT 'Planned'
);

CREATE TABLE IF NOT EXISTS findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('Critical', 'Major', 'Minor', 'Observation')) DEFAULT 'Minor',
  corrective_action TEXT,
  due_date TEXT,
  status TEXT CHECK(status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read INTEGER CHECK(is_read IN (0, 1)) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT
);

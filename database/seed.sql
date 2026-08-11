-- SQLite Database Seed File for ComplyOne Platform

-- Seed Users (Passwords are bcrypt hashes of 'password123')
INSERT INTO users (name, email, password, role, department, created_at, updated_at) VALUES
('System Admin', 'admin@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Admin', 'Information Technology', datetime('now', '-30 days'), datetime('now', '-30 days')),
('Sarah Compliance', 'manager@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Compliance Manager', 'Compliance', datetime('now', '-30 days'), datetime('now', '-30 days')),
('Officer David', 'officer@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Compliance Officer', 'Compliance', datetime('now', '-30 days'), datetime('now', '-30 days')),
('Harish Employee', 'employee@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Employee', 'Engineering', datetime('now', '-30 days'), datetime('now', '-30 days')),
('Alice Auditor', 'auditor@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Auditor', 'Audit & Risk', datetime('now', '-30 days'), datetime('now', '-30 days')),
('John Executive', 'executive@complyone.com', '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', 'Executive', 'Executive Office', datetime('now', '-30 days'), datetime('now', '-30 days'));

-- Seed Regulations
INSERT INTO regulations (name, regulatory_body, category, description, effective_date, status, reference_url) VALUES
('ISO/IEC 27001:2022', 'ISO', 'Information Security', 'International standard for information security management systems (ISMS).', '2022-10-25', 'Active', 'https://www.iso.org/standard/27001'),
('GDPR', 'European Union', 'Data Privacy', 'General Data Protection Regulation regulating personal data privacy protection inside the EU.', '2018-05-25', 'Active', 'https://gdpr.eu'),
('HIPAA', 'US Department of Health & Human Services', 'Healthcare Privacy', 'Health Insurance Portability and Accountability Act safeguarding medical information.', '1996-08-21', 'Active', 'https://www.hhs.gov/hipaa');

-- Seed Requirements (linked to Regulations)
INSERT INTO requirements (regulation_id, title, description, owner_id, department, priority, due_date, status) VALUES
(1, 'Access Control Policy', 'Establish, document, and review access control policies based on business needs.', 3, 'Engineering', 'Critical', '2026-09-30', 'In Progress'),
(1, 'Cryptographic Controls', 'Implement encryption standards for data at rest and in transit.', 3, 'Engineering', 'High', '2026-10-15', 'In Progress'),
(2, 'Right to Erasure (Forgotten)', 'Provide mechanisms for users to request erasure of personal data.', 2, 'Engineering', 'High', '2026-08-31', 'Partially Compliant'),
(2, 'Data Processing Agreement', 'Ensure all vendor data processing agreements are reviewed and signed.', 2, 'Legal', 'Medium', '2026-12-01', 'Not Started'),
(3, 'PHI Transmission Security', 'Ensure Protected Health Information (PHI) is transmitted securely with end-to-end encryption.', 3, 'IT Infrastructure', 'Critical', '2026-08-15', 'Compliant');

-- Seed Controls
INSERT INTO controls (requirement_id, name, description, owner_id, frequency, effectiveness, status, last_reviewed, next_review) VALUES
(1, 'Quarterly User Access Review', 'Review active user accounts and privilege levels every quarter.', 3, 'Quarterly', 'Effective', 'Active', '2026-07-10', '2026-10-10'),
(2, 'AES-256 Storage Encryption', 'Enforce AES-256 encryption on all production databases and cloud storage buckets.', 3, 'Continuous', 'Partially Effective', 'Active', '2026-06-15', '2026-12-15'),
(3, 'User Erasure Request Portal', 'Self-service portal interface for EU customers to request account deletion.', 4, 'Monthly', 'Not Tested', 'Active', '2026-08-01', '2026-09-01'),
(5, 'TLS 1.3 Transmission protocol', 'Configure load balancers and APIs to refuse connections below TLS 1.3.', 3, 'Continuous', 'Effective', 'Active', '2026-08-05', '2027-02-05');

-- Seed Tasks
INSERT INTO tasks (requirement_id, assigned_to, title, description, priority, due_date, status) VALUES
(1, 4, 'Quarterly Access Audit Q3', 'Review user privilege spreadsheet and deactivate inactive accounts.', 'High', '2026-08-13', 'To Do'),
(2, 4, 'Configure Database Encryption', 'Enable encryption key rotation in AWS KMS for DB storage.', 'Critical', '2026-08-25', 'In Progress'),
(3, 4, 'Test Deletion Endpoint API', 'Verify erasure endpoints delete references across backup nodes.', 'Medium', '2026-08-10', 'Completed'),
(5, 4, 'Transmit PHI audit log', 'Review network capture logs for PHI transmitted to audit partners.', 'Critical', '2026-08-05', 'Completed');

-- Seed Evidence
INSERT INTO evidence (task_id, file_name, file_path, uploaded_by, reviewed_by, status, comments, uploaded_at) VALUES
(3, 'erasure_test_results.pdf', 'uploads/erasure_test_results.pdf', 4, 3, 'Approved', 'Verification completed successfully.', datetime('now', '-5 days')),
(4, 'phi_audit_capture.txt', 'uploads/phi_audit_capture.txt', 4, 3, 'Approved', 'All traffic conforms to standard TLS 1.3.', datetime('now', '-3 days'));

-- Seed Risks
INSERT INTO risks (name, description, probability, impact, risk_score, owner_id, mitigation, status) VALUES
('Unauthorized PHI Access', 'Risk of malicious actor accessing protected health details due to weak tokens.', 4, 5, 20, 3, 'Enforcing 2FA and JWT token expiration.', 'Active'),
('GDPR Fines for Late Erasure', 'Regulatory fine if customer erasure request takes longer than 30 days.', 3, 4, 12, 2, 'Implementing automated queues.', 'Active'),
('Unencrypted DB Backups', 'Exposed database backups in public-facing buckets.', 2, 5, 10, 3, 'Automatic bucket scanning policies.', 'Mitigated');

-- Seed Audits
INSERT INTO audits (name, regulation_id, auditor_id, start_date, end_date, status) VALUES
('ISO 27001 Pre-Assessment Audit', 1, 5, '2026-07-01', '2026-07-15', 'Completed'),
('GDPR Privacy Compliance Review', 2, 5, '2026-08-10', '2026-08-20', 'In Progress');

-- Seed Findings (linked to Audits)
INSERT INTO findings (audit_id, description, severity, corrective_action, due_date, status) VALUES
(1, 'Three offboarded employee emails were still active in G-Suite.', 'Major', 'Deactivate accounts and automate offboarding scripts.', '2026-08-20', 'Open'),
(1, 'Developer machine backups saved locally without encryption keys.', 'Minor', 'Update developer machine compliance profiles.', '2026-09-01', 'In Progress');

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(4, 'Task Assignment', 'You have been assigned task: Quarterly Access Audit Q3', 'task.created', 0),
(3, 'Evidence Uploaded', 'Harish uploaded evidence for: Test Deletion Endpoint API', 'evidence.uploaded', 0),
(4, 'Task Deadline Approaching', 'Task Configure Database Encryption is due in 3 days.', 'task.overdue', 0);

-- Seed Activity Logs
INSERT INTO activity_logs (user_id, action, entity, entity_id, ip_address) VALUES
(1, 'Login', 'User', 1, '192.168.1.5'),
(4, 'Upload', 'Evidence', 1, '192.168.1.10'),
(3, 'Approve', 'Evidence', 1, '192.168.1.12'),
(2, 'Create', 'Regulation', 3, '192.168.1.8');

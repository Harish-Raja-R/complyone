import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'complyone';

const collections = [
  'users',
  'regulations',
  'requirements',
  'controls',
  'tasks',
  'evidence',
  'risks',
  'audits',
  'findings',
  'notifications',
  'activity_logs'
];

const nowIso = () => new Date().toISOString();
const daysAgoIso = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const seedData = {
  users: [
    { id: 1, name: 'System Admin', email: 'admin@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Admin', department: 'Information Technology', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) },
    { id: 2, name: 'Sarah Compliance', email: 'manager@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Compliance Manager', department: 'Compliance', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) },
    { id: 3, name: 'Officer David', email: 'officer@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Compliance Officer', department: 'Compliance', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) },
    { id: 4, name: 'Harish Employee', email: 'employee@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Employee', department: 'Engineering', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) },
    { id: 5, name: 'Alice Auditor', email: 'auditor@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Auditor', department: 'Audit & Risk', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) },
    { id: 6, name: 'John Executive', email: 'executive@complyone.com', password: '$2a$10$0N1feigDpZluNOQ6b.8Yhuc743kIlsNtEO9Jog7PjJZUYAO8ULKFW', role: 'Executive', department: 'Executive Office', created_at: daysAgoIso(30), updated_at: daysAgoIso(30) }
  ],
  regulations: [
    { id: 1, name: 'ISO/IEC 27001:2022', regulatory_body: 'ISO', category: 'Information Security', description: 'International standard for information security management systems (ISMS).', effective_date: '2022-10-25', status: 'Active', reference_url: 'https://www.iso.org/standard/27001', created_at: nowIso() },
    { id: 2, name: 'GDPR', regulatory_body: 'European Union', category: 'Data Privacy', description: 'General Data Protection Regulation regulating personal data privacy protection inside the EU.', effective_date: '2018-05-25', status: 'Active', reference_url: 'https://gdpr.eu', created_at: nowIso() },
    { id: 3, name: 'HIPAA', regulatory_body: 'US Department of Health & Human Services', category: 'Healthcare Privacy', description: 'Health Insurance Portability and Accountability Act safeguarding medical information.', effective_date: '1996-08-21', status: 'Active', reference_url: 'https://www.hhs.gov/hipaa', created_at: nowIso() }
  ],
  requirements: [
    { id: 1, regulation_id: 1, title: 'Access Control Policy', description: 'Establish, document, and review access control policies based on business needs.', owner_id: 3, department: 'Engineering', priority: 'Critical', due_date: '2026-09-30', status: 'In Progress' },
    { id: 2, regulation_id: 1, title: 'Cryptographic Controls', description: 'Implement encryption standards for data at rest and in transit.', owner_id: 3, department: 'Engineering', priority: 'High', due_date: '2026-10-15', status: 'In Progress' },
    { id: 3, regulation_id: 2, title: 'Right to Erasure (Forgotten)', description: 'Provide mechanisms for users to request erasure of personal data.', owner_id: 2, department: 'Engineering', priority: 'High', due_date: '2026-08-31', status: 'Partially Compliant' },
    { id: 4, regulation_id: 2, title: 'Data Processing Agreement', description: 'Ensure all vendor data processing agreements are reviewed and signed.', owner_id: 2, department: 'Legal', priority: 'Medium', due_date: '2026-12-01', status: 'Not Started' },
    { id: 5, regulation_id: 3, title: 'PHI Transmission Security', description: 'Ensure Protected Health Information (PHI) is transmitted securely with end-to-end encryption.', owner_id: 3, department: 'IT Infrastructure', priority: 'Critical', due_date: '2026-08-15', status: 'Compliant' }
  ],
  controls: [
    { id: 1, requirement_id: 1, name: 'Quarterly User Access Review', description: 'Review active user accounts and privilege levels every quarter.', owner_id: 3, frequency: 'Quarterly', effectiveness: 'Effective', status: 'Active', last_reviewed: '2026-07-10', next_review: '2026-10-10' },
    { id: 2, requirement_id: 2, name: 'AES-256 Storage Encryption', description: 'Enforce AES-256 encryption on all production databases and cloud storage buckets.', owner_id: 3, frequency: 'Continuous', effectiveness: 'Partially Effective', status: 'Active', last_reviewed: '2026-06-15', next_review: '2026-12-15' },
    { id: 3, requirement_id: 3, name: 'User Erasure Request Portal', description: 'Self-service portal interface for EU customers to request account deletion.', owner_id: 4, frequency: 'Monthly', effectiveness: 'Not Tested', status: 'Active', last_reviewed: '2026-08-01', next_review: '2026-09-01' },
    { id: 4, requirement_id: 5, name: 'TLS 1.3 Transmission protocol', description: 'Configure load balancers and APIs to refuse connections below TLS 1.3.', owner_id: 3, frequency: 'Continuous', effectiveness: 'Effective', status: 'Active', last_reviewed: '2026-08-05', next_review: '2027-02-05' }
  ],
  tasks: [
    { id: 1, requirement_id: 1, assigned_to: 4, title: 'Quarterly Access Audit Q3', description: 'Review user privilege spreadsheet and deactivate inactive accounts.', priority: 'High', due_date: '2026-08-13', status: 'To Do', created_at: nowIso() },
    { id: 2, requirement_id: 2, assigned_to: 4, title: 'Configure Database Encryption', description: 'Enable encryption key rotation in AWS KMS for DB storage.', priority: 'Critical', due_date: '2026-08-25', status: 'In Progress', created_at: nowIso() },
    { id: 3, requirement_id: 3, assigned_to: 4, title: 'Test Deletion Endpoint API', description: 'Verify erasure endpoints delete references across backup nodes.', priority: 'Medium', due_date: '2026-08-10', status: 'Completed', created_at: nowIso() },
    { id: 4, requirement_id: 5, assigned_to: 4, title: 'Transmit PHI audit log', description: 'Review network capture logs for PHI transmitted to audit partners.', priority: 'Critical', due_date: '2026-08-05', status: 'Completed', created_at: nowIso() }
  ],
  evidence: [
    { id: 1, task_id: 3, file_name: 'erasure_test_results.pdf', file_path: 'uploads/erasure_test_results.pdf', uploaded_by: 4, reviewed_by: 3, status: 'Approved', comments: 'Verification completed successfully.', uploaded_at: daysAgoIso(5) },
    { id: 2, task_id: 4, file_name: 'phi_audit_capture.txt', file_path: 'uploads/phi_audit_capture.txt', uploaded_by: 4, reviewed_by: 3, status: 'Approved', comments: 'All traffic conforms to standard TLS 1.3.', uploaded_at: daysAgoIso(3) }
  ],
  risks: [
    { id: 1, name: 'Unauthorized PHI Access', description: 'Risk of malicious actor accessing protected health details due to weak tokens.', probability: 4, impact: 5, risk_score: 20, owner_id: 3, mitigation: 'Enforcing 2FA and JWT token expiration.', status: 'Active' },
    { id: 2, name: 'GDPR Fines for Late Erasure', description: 'Regulatory fine if customer erasure request takes longer than 30 days.', probability: 3, impact: 4, risk_score: 12, owner_id: 2, mitigation: 'Implementing automated queues.', status: 'Active' },
    { id: 3, name: 'Unencrypted DB Backups', description: 'Exposed database backups in public-facing buckets.', probability: 2, impact: 5, risk_score: 10, owner_id: 3, mitigation: 'Automatic bucket scanning policies.', status: 'Mitigated' }
  ],
  audits: [
    { id: 1, name: 'ISO 27001 Pre-Assessment Audit', regulation_id: 1, auditor_id: 5, start_date: '2026-07-01', end_date: '2026-07-15', status: 'Completed' },
    { id: 2, name: 'GDPR Privacy Compliance Review', regulation_id: 2, auditor_id: 5, start_date: '2026-08-10', end_date: '2026-08-20', status: 'In Progress' }
  ],
  findings: [
    { id: 1, audit_id: 1, description: 'Three offboarded employee emails were still active in G-Suite.', severity: 'Major', corrective_action: 'Deactivate accounts and automate offboarding scripts.', due_date: '2026-08-20', status: 'Open' },
    { id: 2, audit_id: 1, description: 'Developer machine backups saved locally without encryption keys.', severity: 'Minor', corrective_action: 'Update developer machine compliance profiles.', due_date: '2026-09-01', status: 'In Progress' }
  ],
  notifications: [
    { id: 1, user_id: 4, title: 'Task Assignment', message: 'You have been assigned task: Quarterly Access Audit Q3', type: 'task.created', is_read: 0, created_at: nowIso() },
    { id: 2, user_id: 3, title: 'Evidence Uploaded', message: 'Harish uploaded evidence for: Test Deletion Endpoint API', type: 'evidence.uploaded', is_read: 0, created_at: nowIso() },
    { id: 3, user_id: 4, title: 'Task Deadline Approaching', message: 'Task Configure Database Encryption is due in 3 days.', type: 'task.overdue', is_read: 0, created_at: nowIso() }
  ],
  activity_logs: [
    { id: 1, user_id: 1, action: 'Login', entity: 'User', entity_id: 1, timestamp: nowIso(), ip_address: '192.168.1.5' },
    { id: 2, user_id: 4, action: 'Upload', entity: 'Evidence', entity_id: 1, timestamp: nowIso(), ip_address: '192.168.1.10' },
    { id: 3, user_id: 3, action: 'Approve', entity: 'Evidence', entity_id: 1, timestamp: nowIso(), ip_address: '192.168.1.12' },
    { id: 4, user_id: 2, action: 'Create', entity: 'Regulation', entity_id: 3, timestamp: nowIso(), ip_address: '192.168.1.8' }
  ]
};

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000
});
let db;
let readyPromise;

const clean = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
};

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim();

const toIdIfNeeded = (value) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && String(value).trim() !== '' ? numberValue : value;
};

const getCollection = (name) => db.collection(name);

const redactMongoUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

async function initializeDatabase() {
  const usersCount = await getCollection('users').countDocuments();
  if (usersCount > 0) {
    console.log(`MongoDB database "${DB_NAME}" already initialized.`);
    return;
  }

  console.log(`MongoDB database "${DB_NAME}" is empty. Seeding initial mock data...`);
  for (const collectionName of collections) {
    const docs = seedData[collectionName] || [];
    if (docs.length > 0) {
      await getCollection(collectionName).insertMany(docs);
    }
  }

  await db.collection('counters').insertMany(
    collections.map((collectionName) => ({
      _id: collectionName,
      seq: Math.max(0, ...(seedData[collectionName] || []).map((doc) => doc.id || 0))
    }))
  );

  await getCollection('users').createIndex({ email: 1 }, { unique: true });
  console.log('MongoDB seeded successfully with initial mock data.');
}

export async function connectDb() {
  if (!readyPromise) {
    readyPromise = client.connect()
      .then(async () => {
        db = client.db(DB_NAME);
        console.log(`Connected to MongoDB at ${redactMongoUri(MONGODB_URI)}, database: ${DB_NAME}`);
        await initializeDatabase();
        return db;
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        readyPromise = null;
        throw err;
      });
  }
  return readyPromise;
}

const nextId = async (collectionName) => {
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return counter.seq;
};

const matchesLike = (value, term) => String(value || '').toLowerCase().includes(String(term).replaceAll('%', '').toLowerCase());

const enrichRows = async (table, rows) => {
  const [users, regulations, requirements, tasks] = await Promise.all([
    getCollection('users').find().toArray(),
    getCollection('regulations').find().toArray(),
    getCollection('requirements').find().toArray(),
    getCollection('tasks').find().toArray()
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const regulationById = new Map(regulations.map((regulation) => [regulation.id, regulation]));
  const requirementById = new Map(requirements.map((requirement) => [requirement.id, requirement]));
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  return rows.map((row) => {
    const result = { ...row };
    if (table === 'requirements') {
      result.regulation_name = regulationById.get(row.regulation_id)?.name || null;
      result.owner_name = userById.get(row.owner_id)?.name || null;
    }
    if (table === 'controls') {
      result.requirement_title = requirementById.get(row.requirement_id)?.title || null;
      result.owner_name = userById.get(row.owner_id)?.name || null;
    }
    if (table === 'tasks') {
      result.requirement_title = requirementById.get(row.requirement_id)?.title || null;
      result.assigned_to_name = userById.get(row.assigned_to)?.name || null;
    }
    if (table === 'evidence') {
      const task = taskById.get(row.task_id);
      result.task_title = task?.title || null;
      result.task_owner_id = task?.assigned_to || null;
      result.requirement_id = task?.requirement_id || null;
      result.uploaded_by_name = userById.get(row.uploaded_by)?.name || null;
      result.reviewed_by_name = userById.get(row.reviewed_by)?.name || null;
    }
    if (table === 'risks') {
      result.owner_name = userById.get(row.owner_id)?.name || null;
    }
    if (table === 'audits') {
      result.regulation_name = regulationById.get(row.regulation_id)?.name || null;
      result.auditor_name = userById.get(row.auditor_id)?.name || null;
    }
    if (table === 'activity_logs') {
      const user = userById.get(row.user_id);
      result.user_name = user?.name || null;
      result.user_email = user?.email || null;
    }
    return clean(result);
  });
};

const getTableFromSelect = (sql) => {
  const normalized = normalizeSql(sql).toLowerCase();
  const direct = normalized.match(/from ([a-z_]+)/);
  if (direct && collections.includes(direct[1])) return direct[1];
  if (normalized.includes('from requirements req') || normalized.includes('from requirements r')) return 'requirements';
  if (normalized.includes('from regulations')) return 'regulations';
  if (normalized.includes('from controls c')) return 'controls';
  if (normalized.includes('from tasks t')) return 'tasks';
  if (normalized.includes('from evidence e')) return 'evidence';
  if (normalized.includes('from risks r')) return 'risks';
  if (normalized.includes('from audits a')) return 'audits';
  if (normalized.includes('from activity_logs l')) return 'activity_logs';
  return null;
};

const applyCommonFilters = (rows, sql, params) => {
  const normalized = normalizeSql(sql);
  let paramIndex = 0;
  let filtered = rows;

  const likeGroups = normalized.matchAll(/\(([^()]*LIKE \?[^()]*)\)/gi);
  for (const group of likeGroups) {
    const fields = [...group[1].matchAll(/(?:\w+\.)?(\w+) LIKE \?/gi)].map((match) => match[1]);
    const terms = fields.map(() => params[paramIndex++]);
    filtered = filtered.filter((row) => fields.some((field, index) => matchesLike(row[field], terms[index])));
  }

  const equals = [...normalized.matchAll(/(?:WHERE|AND) (?:\w+\.)?(\w+) = \?/gi)];
  for (const [, field] of equals) {
    const expected = toIdIfNeeded(params[paramIndex++]);
    filtered = filtered.filter((row) => row[field] === expected);
  }

  if (normalized.includes('status = "Active"')) filtered = filtered.filter((row) => row.status === 'Active');
  if (normalized.includes('status = "Completed"')) filtered = filtered.filter((row) => row.status === 'Completed');
  if (normalized.includes('status = "Overdue"')) filtered = filtered.filter((row) => row.status === 'Overdue' || (row.status !== 'Completed' && row.due_date < new Date().toISOString().slice(0, 10)));
  if (normalized.includes('status = "In Progress"')) filtered = filtered.filter((row) => row.status === 'In Progress');
  if (normalized.includes('status = "To Do"')) filtered = filtered.filter((row) => row.status === 'To Do');
  if (normalized.includes('status != "Compliant"')) filtered = filtered.filter((row) => row.status !== 'Compliant');
  if (normalized.includes("status != 'Completed'")) filtered = filtered.filter((row) => row.status !== 'Completed');
  if (normalized.includes('due_date < date("now")')) filtered = filtered.filter((row) => row.due_date < new Date().toISOString().slice(0, 10));

  return filtered;
};

const countRows = (rows, sql) => {
  const normalized = normalizeSql(sql);
  if (normalized.includes("SUM(CASE WHEN status = 'Compliant' THEN 1 ELSE 0 END) AS compliant")) {
    return {
      total: rows.length,
      compliant: rows.filter((row) => row.status === 'Compliant').length
    };
  }
  return { count: rows.length };
};

const groupRows = (rows, field) => {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = row[field] || null;
    const current = grouped.get(key) || { [field]: key, count: 0, total: 0, compliant: 0 };
    current.count += 1;
    current.total += 1;
    if (row.status === 'Compliant') current.compliant += 1;
    grouped.set(key, current);
  });
  return [...grouped.values()];
};

const projectSelectedFields = (rows, sql) => {
  if (/JOIN/i.test(sql) || /COUNT\(/i.test(sql) || /GROUP BY/i.test(sql) || /SELECT \*/i.test(sql) || /SELECT \w+\.\*/i.test(sql)) {
    return rows;
  }

  const selectMatch = sql.match(/^SELECT (.+?) FROM /i);
  if (!selectMatch) return rows;

  const fields = selectMatch[1]
    .split(',')
    .map((field) => field.trim().replace(/^\w+\./, '').replace(/\s+AS\s+\w+$/i, ''))
    .filter(Boolean);

  return rows.map((row) => {
    const projected = {};
    fields.forEach((field) => {
      projected[field] = row[field];
    });
    return projected;
  });
};

export const query = async (sql, params = []) => {
  await connectDb();
  const normalized = normalizeSql(sql);
  const table = getTableFromSelect(normalized);
  if (!table) {
    throw new Error(`Unsupported MongoDB adapter query: ${normalized}`);
  }

  let rows = (await getCollection(table).find().toArray()).map(clean);
  rows = applyCommonFilters(rows, normalized, params);

  if (/GROUP BY status/i.test(normalized)) return groupRows(rows, 'status').map(({ status, count }) => ({ status, count }));
  if (/GROUP BY department/i.test(normalized)) return groupRows(rows, 'department').map(({ department, total, compliant }) => ({ department, total, compliant }));
  if (/COUNT\(id\)/i.test(normalized)) return [countRows(rows, normalized)];

  rows = await enrichRows(table, rows);
  rows = projectSelectedFields(rows, normalized);

  if (/ORDER BY (?:\w+\.)?timestamp DESC/i.test(normalized)) rows.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  if (/ORDER BY (?:\w+\.)?created_at DESC/i.test(normalized)) rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const limitMatch = normalized.match(/LIMIT (\d+)/i);
  if (limitMatch) rows = rows.slice(0, Number(limitMatch[1]));

  return rows;
};

export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const insertDefaults = (table, doc) => {
  const defaults = {
    users: { created_at: nowIso(), updated_at: nowIso() },
    regulations: { status: 'Active', created_at: nowIso() },
    requirements: { priority: 'Medium', status: 'Not Started' },
    controls: { frequency: 'Continuous', effectiveness: 'Not Tested', status: 'Active' },
    tasks: { priority: 'Medium', status: 'To Do', created_at: nowIso() },
    evidence: { status: 'Pending Review', uploaded_at: nowIso() },
    risks: { probability: 3, impact: 3, status: 'Active' },
    audits: { status: 'Planned' },
    findings: { severity: 'Minor', status: 'Open' },
    notifications: { is_read: 0, created_at: nowIso() },
    activity_logs: { timestamp: nowIso(), ip_address: '127.0.0.1' }
  };
  return { ...(defaults[table] || {}), ...doc };
};

export const run = async (sql, params = []) => {
  await connectDb();
  const normalized = normalizeSql(sql);

  const insertMatch = normalized.match(/^INSERT INTO ([a-z_]+) \(([^)]+)\) VALUES \(([^)]+)\)$/i);
  if (insertMatch) {
    const [, table, fieldsRaw] = insertMatch;
    const fields = fieldsRaw.split(',').map((field) => field.trim());
    const id = await nextId(table);
    const doc = { id };
    fields.forEach((field, index) => {
      doc[field] = toIdIfNeeded(params[index]);
    });
    await getCollection(table).insertOne(insertDefaults(table, doc));
    return { id, changes: 1 };
  }

  const updateMatch = normalized.match(/^UPDATE ([a-z_]+) SET (.+) WHERE (.+)$/i);
  if (updateMatch) {
    const [, table, setRaw, whereRaw] = updateMatch;
    const setFields = setRaw.split(',').map((assignment) => assignment.trim().match(/^(\w+) = \?$/i)?.[1]).filter(Boolean);
    const updateDoc = {};
    setFields.forEach((field, index) => {
      updateDoc[field] = toIdIfNeeded(params[index]);
    });

    const filter = {};
    let paramIndex = setFields.length;
    for (const match of whereRaw.matchAll(/(\w+) = \?/gi)) {
      filter[match[1]] = toIdIfNeeded(params[paramIndex++]);
    }

    const result = await getCollection(table).updateMany(filter, { $set: updateDoc });
    return { id: filter.id || null, changes: result.modifiedCount };
  }

  const deleteMatch = normalized.match(/^DELETE FROM ([a-z_]+) WHERE id = \?$/i);
  if (deleteMatch) {
    const [, table] = deleteMatch;
    const result = await getCollection(table).deleteOne({ id: toIdIfNeeded(params[0]) });
    return { id: toIdIfNeeded(params[0]), changes: result.deletedCount };
  }

  throw new Error(`Unsupported MongoDB adapter run statement: ${normalized}`);
};

connectDb().catch(() => {});

export default {
  client,
  connectDb,
  query,
  queryOne,
  run
};

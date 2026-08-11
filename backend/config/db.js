import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file path
const dbPath = path.resolve(__dirname, '../../database/complyone.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open Database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Run raw SQL scripts (supports multiple statements separated by ;)
const executeSqlScript = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, sql) => {
      if (err) {
        return reject(err);
      }
      db.exec(sql, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};

// Check and initialize schema/seeds
function initializeDatabase() {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, table) => {
    if (err) {
      console.error('Error checking database status:', err.message);
      return;
    }
    if (!table) {
      console.log('Database tables not found. Running schema initialization...');
      try {
        const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
        const seedPath = path.resolve(__dirname, '../../database/seed.sql');

        await executeSqlScript(schemaPath);
        console.log('Database schema created successfully.');

        await executeSqlScript(seedPath);
        console.log('Database seeded successfully with initial mock data.');
      } catch (scriptErr) {
        console.error('Error during schema/seed initialization:', scriptErr.message);
      }
    } else {
      console.log('Database already initialized.');
    }
  });
}

// Promisified database helpers for cleaner async/await usage
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Also export the raw database instance if needed
export default db;

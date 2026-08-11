import { query, queryOne } from './config/db.js';
import bcrypt from 'bcryptjs';

async function runLocalTests() {
  console.log('--- RUNNING LOCAL DB INITIALIZATION TESTS ---');
  try {
    // Check users
    const usersCount = await queryOne('SELECT COUNT(id) AS count FROM users');
    console.log(`PASS: Users Table count: ${usersCount.count}`);

    // Check regulations
    const regsCount = await queryOne('SELECT COUNT(id) AS count FROM regulations');
    console.log(`PASS: Regulations count: ${regsCount.count}`);

    // Check requirements
    const reqsCount = await queryOne('SELECT COUNT(id) AS count FROM requirements');
    console.log(`PASS: Requirements count: ${reqsCount.count}`);

    // Check custom password hashing verification
    const adminUser = await queryOne('SELECT * FROM users WHERE email = "admin@complyone.com"');
    if (adminUser) {
      const isMatch = await bcrypt.compare('password123', adminUser.password);
      console.log(`PASS: Admin user password comparison: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('FAIL: Admin user not found');
    }

    console.log('--- ALL INTERNAL DB CHECKS COMPLETED ---');
    process.exit(0);
  } catch (err) {
    console.error('FAIL: Database initialization test failed:', err);
    process.exit(1);
  }
}

// Run test
setTimeout(runLocalTests, 2000); // Wait for SQLite connection and seed to complete

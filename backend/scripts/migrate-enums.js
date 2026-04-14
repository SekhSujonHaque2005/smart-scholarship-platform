require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'ApplicationStatus'`);
    console.log('Current ApplicationStatus enums:', res.rows.map(r => r.enumlabel));
    
    console.log('Adding new statuses to ApplicationStatus enum...');
    // Type updates in PG enums need to be handled one by one
    try {
      await client.query(`ALTER TYPE "ApplicationStatus" ADD VALUE 'SHORTLISTED'`);
      console.log('Added SHORTLISTED');
    } catch (e) {
      console.log('SHORTLISTED already exists or failed:', e.message);
    }
    
    try {
      await client.query(`ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEWING'`);
      console.log('Added INTERVIEWING');
    } catch (e) {
      console.log('INTERVIEWING already exists or failed:', e.message);
    }
    
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
main();

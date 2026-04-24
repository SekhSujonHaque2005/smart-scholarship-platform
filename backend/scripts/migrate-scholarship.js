require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Adding Scholarship columns if missing...');
    await client.query(`ALTER TABLE "Scholarship" ADD COLUMN IF NOT EXISTS "requirementsJson" JSONB`);
    await client.query(`ALTER TABLE "Scholarship" ADD COLUMN IF NOT EXISTS "criteriaJson" JSONB`);
    await client.query(`ALTER TABLE "Scholarship" ADD COLUMN IF NOT EXISTS "category" TEXT`);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
main();

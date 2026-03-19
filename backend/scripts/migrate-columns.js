require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Adding Cloudinary fields to Document table...');
    await client.query(`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "publicId" TEXT`);
    await client.query(`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "fileName" TEXT`);
    await client.query(`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER`);
    // Make fileHash nullable (it was required before)
    await client.query(`ALTER TABLE "Document" ALTER COLUMN "fileHash" DROP NOT NULL`);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

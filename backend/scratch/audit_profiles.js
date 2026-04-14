const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function debugProfiles() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        provider: true
      }
    });

    console.log('--- USER PROFILE AUDIT ---');
    users.forEach(u => {
      const hasStudent = !!u.student;
      const hasProvider = !!u.provider;
      console.log(`User: ${u.email} | Role: ${u.role} | Student Profile: ${hasStudent} | Provider Profile: ${hasProvider}`);
      
      if (u.role === 'STUDENT' && !hasStudent) {
        console.error(`!!! CRITICAL: User ${u.email} is a STUDENT but has NO Student profile.`);
      }
      if (u.role === 'PROVIDER' && !hasProvider) {
        console.error(`!!! CRITICAL: User ${u.email} is a PROVIDER but has NO Provider profile.`);
      }
    });

  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

debugProfiles();

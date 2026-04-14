const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function repairAccount() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = 'sksujonhaque@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true }
    });

    if (!user) {
      console.error(`User ${email} not found.`);
      return;
    }

    if (user.role === 'STUDENT' && !user.student) {
      console.log(`Repairing user ${email}...`);
      await prisma.student.create({
        data: {
          userId: user.id,
          name: 'Sekh Sujon Haque', // Defaulting to email prefix or name if known
          fieldOfStudy: 'General',
          location: 'Auto-Recovered'
        }
      });
      console.log('--- REPAIR SUCCESSFUL ---');
    } else {
      console.log('Account does not need repair or is not a student.');
    }

  } catch (error) {
    console.error('Repair failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

repairAccount();

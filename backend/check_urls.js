const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: { isExternal: true },
      take: 5,
      select: { title: true, sourceUrl: true, externalId: true }
    });
    console.log('--- DB CHECK ---');
    console.log(JSON.stringify(scholarships, null, 2));
    console.log('--- END DB CHECK ---');
  } catch (err) {
    console.error('Check error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

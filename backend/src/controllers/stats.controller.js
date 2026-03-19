const prisma = require('../lib/prisma');

/**
 * GET /api/stats
 * Public endpoint — returns real platform statistics.
 */
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalStudents,
      activeScholarships,
      verifiedProviders,
      totalApplications,
      approvedApplications,
      totalAwardedResult,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.scholarship.count({ where: { status: 'ACTIVE' } }),
      prisma.provider.count({ where: { verificationStatus: 'APPROVED' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.scholarship.aggregate({
        _sum: { amount: true },
        where: {
          applications: { some: { status: 'APPROVED' } },
        },
      }),
    ]);

    const totalAwarded = totalAwardedResult._sum.amount || 0;

    res.json({
      totalStudents,
      activeScholarships,
      verifiedProviders,
      totalApplications,
      approvedApplications,
      totalAwarded,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch platform stats' });
  }
};

module.exports = { getPlatformStats };

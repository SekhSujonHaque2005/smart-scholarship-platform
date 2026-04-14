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

/**
 * GET /api/stats/provider
 * Private endpoint — returns real-time aggregated stats for the logged-in provider.
 */
const getProviderStats = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const providerId = provider.id;

    // Fetch core stats in parallel
    const [
      totalPrograms,
      activePrograms,
      allApplications
    ] = await Promise.all([
      prisma.scholarship.count({ where: { providerId } }),
      prisma.scholarship.count({ where: { providerId, status: 'ACTIVE' } }),
      prisma.application.findMany({
        where: { scholarship: { providerId } },
        select: { id: true, status: true, submittedAt: true, scholarship: { select: { amount: true } } }
      })
    ]);

    // Calculate total funds deployed (only for APPROVED)
    const totalFunds = allApplications
      .filter(a => a.status === 'APPROVED')
      .reduce((sum, a) => sum + (a.scholarship?.amount || 0), 0);

    // Calculate 7-day trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = allApplications.filter(a => {
        const subDate = new Date(a.submittedAt);
        return subDate >= date && subDate < nextDate;
      }).length;

      trend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: count
      });
    }

    // Status distribution (Funnel)
    const funnel = [
      { status: 'PENDING', count: allApplications.filter(a => a.status === 'PENDING').length },
      { status: 'UNDER_REVIEW', count: allApplications.filter(a => a.status === 'UNDER_REVIEW').length },
      { status: 'SHORTLISTED', count: allApplications.filter(a => a.status === 'SHORTLISTED').length },
      { status: 'INTERVIEWING', count: allApplications.filter(a => a.status === 'INTERVIEWING').length },
      { status: 'APPROVED', count: allApplications.filter(a => a.status === 'APPROVED').length },
      { status: 'REJECTED', count: allApplications.filter(a => a.status === 'REJECTED').length },
    ];

    res.json({
      totalPrograms,
      activePrograms,
      totalApplications: allApplications.length,
      totalFunds,
      trustScore: provider.trustScore || 0,
      trend,
      funnel
    });
  } catch (error) {
    console.error('Provider stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch provider stats' });
  }
};

module.exports = { getPlatformStats, getProviderStats };

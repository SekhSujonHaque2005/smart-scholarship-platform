const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');

// Get global platform stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalProviders, totalScholarships, totalApplications, totalFraudAlerts] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.provider.count(),
      prisma.scholarship.count(),
      prisma.application.count(),
      prisma.fraudFlag.count()
    ]);

    // Calculate total disbursed amount
    const disbursements = await prisma.transaction.aggregate({
      where: { type: 'DISBURSEMENT', status: 'COMPLETED' },
      _sum: { amount: true }
    });

    // Calculate applications per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const apps = await prisma.application.findMany({
      where: { submittedAt: { gte: sevenDaysAgo } },
      select: { submittedAt: true }
    });

    const appsByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      appsByDay[d.toISOString().split('T')[0]] = 0;
    }

    apps.forEach(app => {
      const dateStr = app.submittedAt.toISOString().split('T')[0];
      if (appsByDay[dateStr] !== undefined) {
        appsByDay[dateStr]++;
      }
    });

    const applicationsPerDay = Object.keys(appsByDay).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: appsByDay[date]
    }));

    res.json({
      totalUsers,
      totalStudents,
      totalProviders,
      totalScholarships,
      totalApplications,
      totalFraudAlerts,
      totalDisbursed: disbursements._sum.amount || 0,
      applicationsPerDay,
      systemHealth: 'HEALTHY'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};

// --- User Management ---

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        provider: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['STUDENT', 'PROVIDER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role }
      });

      if (role === 'STUDENT') {
        await tx.student.create({
          data: { userId: newUser.id, name }
        });
      } else if (role === 'PROVIDER') {
        await tx.provider.create({
          data: { userId: newUser.id, orgName: name }
        });
      }

      return newUser;
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });
    res.json({ message: `User ${isActive ? 'activated' : 'blocked'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// --- Scholarship Moderation ---

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Delete related records first or use Prisma cascade if configured
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// --- Provider Verification ---

const getPendingProviders = async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { isVerified: false },
      include: { user: true }
    });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending providers', error: error.message });
  }
};

const verifyProvider = async (req, res) => {
  const { providerId } = req.params;
  const { isVerified, remarks } = req.body;
  try {
    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: { isVerified },
      include: { user: true }
    });

    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: 'PROVIDER_VERIFICATION',
        title: isVerified ? 'Verification Successful' : 'Verification Rejected',
        message: isVerified 
          ? 'Congratulations! Your institution has been verified. You can now post scholarships.' 
          : `Verification was unsuccessful. Remarks: ${remarks || 'Please contact support.'}`
      }
    });

    res.json({ message: `Provider ${isVerified ? 'verified' : 'rejected'} successfully`, provider });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying provider', error: error.message });
  }
};

// --- Scholarship Moderation ---

const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await prisma.scholarship.findMany({
      include: { provider: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scholarships', error: error.message });
  }
};

const moderateScholarship = async (req, res) => {
  const { id: scholarshipId } = req.params;
  const { status, remarks } = req.body; // APPROVED, REJECTED
  try {
    const scholarship = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { 
        status: status === 'APPROVED' ? 'ACTIVE' : 'DRAFT'
      }
    });

    const provider = await prisma.provider.findUnique({
      where: { id: scholarship.providerId }
    });

    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: 'SCHOLARSHIP_MODERATION',
        title: `Scholarship ${status}`,
        message: status === 'APPROVED' 
          ? `Your scholarship "${scholarship.title}" has been approved!` 
          : `Scholarship "${scholarship.title}" needs revision. Remarks: ${remarks || 'No remarks provided.'}`
      }
    });

    res.json({ message: 'Scholarship status updated', scholarship });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, deadline } = req.body;

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: {
        title,
        description,
        amount: amount ? parseFloat(amount) : null,
        deadline: deadline ? new Date(deadline) : null,
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        entityType: 'SCHOLARSHIP',
        entityId: id,
        action: 'ADMIN_EDIT',
        actorId: req.user.userId,
        newVal: { title, amount }
      }
    });

    res.json({ message: 'Scholarship updated successfully', scholarship });
  } catch (error) {
    res.status(500).json({ message: 'Error updating scholarship', error: error.message });
  }
};

const deleteScholarship = async (req, res) => {
  const { id: scholarshipId } = req.params;
  try {
    await prisma.scholarship.delete({ where: { id: scholarshipId } });
    res.json({ message: 'Scholarship deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting scholarship', error: error.message });
  }
};

// --- AI & Fraud Monitoring ---

const getFraudAlerts = async (req, res) => {
  try {
    const alerts = await prisma.fraudFlag.findMany({
      include: {
        application: {
          include: {
            student: true,
            scholarship: true
          }
        }
      },
      orderBy: { flaggedAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fraud alerts', error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        provider: true,
        scholarship: true,
        application: {
          include: {
            student: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: true
      },
      orderBy: { timestamp: 'desc' },
      take: 100 
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

const triggerScraper = async (req, res) => {
  console.log('[Admin] Manually triggering scholarship scraper...');
  
  try {
    await prisma.auditLog.create({
      data: {
        entityType: 'SYSTEM',
        entityId: 'SCRAPER',
        action: 'TRIGGER_SYNC',
        actorId: req.user.userId,
        newVal: { message: 'External scraper manually triggered' }
      }
    });
  } catch (err) {
    console.error('Error creating audit log for scraper trigger:', err);
  }

  let scraperDir = require('path').join(__dirname, '..', '..', '..', 'scraper_service');
  if (!require('fs').existsSync(scraperDir)) {
    scraperDir = require('path').join(__dirname, '..', '..', 'scraper_service');
  }
  exec(`python main.py --live`, { cwd: scraperDir }, (error, stdout, stderr) => {

    if (error) {
      console.error('[Admin] Scraper error:', error.message);
    }
    console.log('[Admin] Scraper output:', stdout);
    if (stderr) console.error('[Admin] Scraper stderr:', stderr);
  });
  res.json({ message: 'Scraper triggered successfully. Check server logs.' });
};

module.exports = {
  getStats,
  getAllUsers,
  createUser,
  toggleUserStatus,
  deleteUser,
  getPendingProviders,
  verifyProvider,
  getAllScholarships,
  moderateScholarship,
  updateScholarship,
  deleteScholarship,
  getFraudAlerts,
  getTransactions,
  getAuditLogs,
  triggerScraper
};

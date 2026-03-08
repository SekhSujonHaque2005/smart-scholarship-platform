const prisma = require('../lib/prisma');

// GET ALL PROVIDERS (Public)
const getAllProviders = async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { verificationStatus: 'APPROVED' },
      select: {
        id: true,
        orgName: true,
        orgType: true,
        trustScore: true,
        approvedAt: true,
        _count: { select: { scholarships: true } }
      },
      orderBy: { trustScore: 'desc' }
    });

    res.status(200).json({ providers });

  } catch (error) {
    console.error('Get providers error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET PROVIDER PROFILE (Provider)
const getMyProfile = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true } },
        _count: { select: { scholarships: true, reviews: true } }
      }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.status(200).json(provider);

  } catch (error) {
    console.error('Get provider profile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE PROVIDER PROFILE (Provider)
const updateProfile = async (req, res) => {
  try {
    const { orgName, orgType } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const updated = await prisma.provider.update({
      where: { userId: req.user.userId },
      data: {
        ...(orgName && { orgName }),
        ...(orgType && { orgType })
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      provider: updated
    });

  } catch (error) {
    console.error('Update provider profile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// SUBMIT VERIFICATION REQUEST (Provider)
const submitVerification = async (req, res) => {
  try {
    const { orgName, orgType } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (provider.verificationStatus === 'APPROVED') {
      return res.status(400).json({ message: 'Already verified' });
    }

    const updated = await prisma.provider.update({
      where: { userId: req.user.userId },
      data: {
        verificationStatus: 'PENDING',
        ...(orgName && { orgName }),
        ...(orgType && { orgType })
      }
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        entityType: 'Provider',
        entityId: provider.id,
        action: 'VERIFICATION_REQUESTED',
        actorId: req.user.userId
      }
    });

    res.status(200).json({
      message: 'Verification request submitted successfully',
      provider: updated
    });

  } catch (error) {
    console.error('Submit verification error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET ALL PENDING VERIFICATIONS (Admin)
const getPendingVerifications = async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { email: true, createdAt: true } }
      },
      orderBy: { user: { createdAt: 'asc' } }
    });

    res.status(200).json({ providers });

  } catch (error) {
    console.error('Get pending verifications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// APPROVE OR REJECT PROVIDER (Admin)
const verifyProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }

    const provider = await prisma.provider.findUnique({ where: { id } });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: {
        verificationStatus: status,
        ...(status === 'APPROVED' && {
          approvedAt: new Date(),
          trustScore: 50
        })
      }
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        entityType: 'Provider',
        entityId: id,
        action: `VERIFICATION_${status}`,
        newVal: { remarks },
        actorId: req.user.userId
      }
    });

    res.status(200).json({
      message: `Provider ${status.toLowerCase()} successfully`,
      provider: updated
    });

  } catch (error) {
    console.error('Verify provider error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// CALCULATE TRUST SCORE (Internal helper)
const recalculateTrustScore = async (providerId) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId }
    });

    if (reviews.length === 0) return 50;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const trustScore = Math.round((avgRating / 5) * 100);

    await prisma.provider.update({
      where: { id: providerId },
      data: { trustScore }
    });

    return trustScore;
  } catch (error) {
    console.error('Recalculate trust score error:', error.message);
  }
};

// GET PROVIDER BY ID (Public)
const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        scholarships: {
          where: { status: 'ACTIVE' },
          select: { id: true, title: true, amount: true, deadline: true }
        },
        reviews: {
          select: { rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: { select: { scholarships: true, reviews: true } }
      }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json(provider);

  } catch (error) {
    console.error('Get provider by id error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllProviders,
  getMyProfile,
  updateProfile,
  submitVerification,
  getPendingVerifications,
  verifyProvider,
  recalculateTrustScore,
  getProviderById
};
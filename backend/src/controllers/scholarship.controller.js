const prisma = require('../lib/prisma');

// GET ALL SCHOLARSHIPS (Public - with search & filter)
const getAllScholarships = async (req, res) => {
  try {
    const { 
      search, 
      status = 'ACTIVE',
      minAmount, 
      maxAmount,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {
      status,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(minAmount && { amount: { gte: parseFloat(minAmount) } }),
      ...(maxAmount && { amount: { lte: parseFloat(maxAmount) } }),
    };

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          provider: { select: { orgName: true, trustScore: true } },
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.scholarship.count({ where })
    ]);

    res.status(200).json({
      scholarships,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET SINGLE SCHOLARSHIP
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        provider: {
          select: { orgName: true, orgType: true, trustScore: true }
        },
        _count: { select: { applications: true } }
      }
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.status(200).json(scholarship);

  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// CREATE SCHOLARSHIP (Provider only)
const createScholarship = async (req, res) => {
  try {
    const { title, description, amount, deadline, criteriaJson } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (provider.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ 
        message: 'Your account must be verified before posting scholarships' 
      });
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        providerId: provider.id,
        title,
        description,
        amount: amount ? parseFloat(amount) : null,
        deadline: deadline ? new Date(deadline) : null,
        criteriaJson,
        status: 'DRAFT'
      }
    });

    res.status(201).json({
      message: 'Scholarship created successfully',
      scholarship
    });

  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE SCHOLARSHIP (Provider only)
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, deadline, criteriaJson, status } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    const scholarship = await prisma.scholarship.findUnique({ where: { id } });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.providerId !== provider.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.scholarship.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(criteriaJson && { criteriaJson }),
        ...(status && { status })
      }
    });

    res.status(200).json({
      message: 'Scholarship updated successfully',
      scholarship: updated
    });

  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE SCHOLARSHIP (Provider only)
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    const scholarship = await prisma.scholarship.findUnique({ where: { id } });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.providerId !== provider.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.scholarship.delete({ where: { id } });

    res.status(200).json({ message: 'Scholarship deleted successfully' });

  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// APPROVE / REJECT SCHOLARSHIP (Admin only)
const updateScholarshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'CLOSED', 'DRAFT'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      message: `Scholarship ${status.toLowerCase()} successfully`,
      scholarship
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  updateScholarshipStatus
};
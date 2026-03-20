const prisma = require('../lib/prisma');
const { getMatchScores } = require('../services/ai.service');

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

    // 🤖 Get AI match scores if student is logged in
    let scholarshipsWithScores = scholarships;

    if (req.user?.userId) {
      try {
        const student = await prisma.student.findUnique({
          where: { userId: req.user.userId }
        });

        if (student && (student.cgpa || student.fieldOfStudy || student.location)) {
          const { getMatchScores } = require('../services/ai.service');
          const matchScores = await getMatchScores(student, scholarships);
          const scoresArray = Array.isArray(matchScores) ? matchScores : [];

          scholarshipsWithScores = scholarships.map(s => {
            const match = scoresArray.find(m => m.scholarshipId === s.id);
            return {
              ...s,
              matchScore: match?.matchScore || null,
              matchReasons: match?.reasons || []
            };
          });

          // Sort by match score if available
          scholarshipsWithScores.sort((a, b) =>
            (b.matchScore || 0) - (a.matchScore || 0)
          );
        }
      } catch (error) {
        console.error('AI match error:', error.message);
      }
    }

    res.status(200).json({
      scholarships: scholarshipsWithScores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get scholarships error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// BULK UPSERT SCHOLARSHIPS (Admin/System only)
const bulkUpsertScholarships = async (req, res) => {
  try {
    const { scholarships } = req.body;

    if (!Array.isArray(scholarships)) {
      return res.status(400).json({ message: 'Scholarships array is required' });
    }

    // Ensure we have a System Provider for external scholarships
    let systemProvider = await prisma.provider.findFirst({
      where: { orgName: 'Government & External Agencies' }
    });

    if (!systemProvider) {
      // Find any admin to link it to
      let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      
      if (!admin) {
        // Create a default system admin if none exist
        admin = await prisma.user.create({
          data: {
            email: 'admin@scholarhub.com',
            role: 'ADMIN',
            password: 'system_generated_admin_pass', // In prod, this should be a secure hash
            isActive: true,
            preferences: {}
          }
        });
        console.log('Created default system admin:', admin.email);
      }

      systemProvider = await prisma.provider.create({
        data: {
          userId: admin.id,
          orgName: 'Government & External Agencies',
          trustScore: 100,
          verificationStatus: 'APPROVED'
        }
      });
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const s of scholarships) {
      try {
        if (!s.title || !s.externalId) {
          results.skipped++;
          continue;
        }

        const data = {
          title: s.title,
          description: s.description,
          amount: s.amount ? parseFloat(s.amount) : null,
          deadline: s.deadline ? new Date(s.deadline) : null,
          category: s.category || 'General',
          isExternal: true,
          sourceUrl: s.sourceUrl,
          providerId: systemProvider.id,
          status: 'ACTIVE'
        };

        const upserted = await prisma.scholarship.upsert({
          where: { externalId: s.externalId },
          update: data,
          create: {
            ...data,
            externalId: s.externalId
          }
        });

        // Use a heuristic to detect if it was created or updated (not perfect with prisma upsert without select)
        // For now just track total success
        results.updated++; 
      } catch (err) {
        results.errors.push({ id: s.externalId, error: err.message });
      }
    }

    // Trigger notifications if new scholarships were added/updated
    if (results.updated > 0) {
      const { notifyExternalScholarships } = require('../services/notification.service');
      notifyExternalScholarships(scholarships.slice(0, 10)).catch(err => console.error('Notification error:', err));
    }

    res.status(200).json({
      message: 'Bulk upsert complete',
      results
    });

  } catch (error) {
    console.error('Bulk upsert error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  updateScholarshipStatus,
  bulkUpsertScholarships
};
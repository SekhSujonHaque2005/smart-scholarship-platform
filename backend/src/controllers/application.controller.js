const prisma = require('../lib/prisma');
const { notifyApplicationSubmitted, notifyApplicationStatus } = require('../services/notification.service');
const { checkFraud } = require('../services/ai.service');

// SUBMIT APPLICATION (Student only)
const submitApplication = async (req, res) => {
  try {
    const { scholarshipId, formData } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({ message: 'Scholarship ID is required' });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check scholarship exists and is active
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId }
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Scholarship is not accepting applications' });
    }

    // Check deadline
    if (scholarship.deadline && new Date() > scholarship.deadline) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check duplicate application
    const existing = await prisma.application.findUnique({
      where: {
        studentId_scholarshipId: {
          studentId: student.id,
          scholarshipId
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this scholarship' });
    }

    // 🤖 AI FRAUD CHECK
    const fraudResult = await checkFraud({
      applicationId: `temp-${Date.now()}`,
      studentId: student.id,
      scholarshipId,
      studentGender: student.gender,
      criteria: scholarship.criteriaJson,
      formData: {
        ...formData,
        name: student.name,
        cgpa: student.cgpa,
        annualIncome: formData?.annualIncome
      }
    });

    // Block if high risk
    if (fraudResult.isSuspicious && fraudResult.riskScore >= 70) {
      return res.status(403).json({
        message: 'Application flagged by fraud detection system',
        riskScore: fraudResult.riskScore,
        reasons: fraudResult.reasons
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        scholarshipId,
        formData,
        status: 'PENDING',
        // Store fraud score for admin review
        ...(fraudResult.riskScore > 0 && {
          remarks: `AI Risk Score: ${fraudResult.riskScore}`
        })
      },
      include: {
        scholarship: { select: { title: true, amount: true } }
      }
    });

    // Create fraud flag if suspicious but not blocked
    if (fraudResult.isSuspicious) {
      await prisma.fraudFlag.create({
        data: {
          applicationId: application.id,
          riskScore: fraudResult.riskScore,
          reasons: fraudResult.reasons,
          flaggedAt: new Date()
        }
      }).catch(() => {}); // Don't fail if fraudFlag table has issues
    }

    // Fire unawaited notification to avoid blocking the response
    notifyApplicationSubmitted(student.userId, application.scholarship.title).catch(console.error);

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      aiCheck: {
        riskScore: fraudResult.riskScore,
        clean: !fraudResult.isSuspicious
      }
    });

  } catch (error) {
    console.error('Submit application error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET MY APPLICATIONS (Student)
const getMyApplications = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    if (!student) {
      // Return empty applications instead of 404 for resilience
      return res.status(200).json({ applications: [] });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        scholarship: {
          select: {
            title: true,
            amount: true,
            deadline: true,
            provider: { select: { orgName: true, trustScore: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json({ applications });

  } catch (error) {
    console.error('Get my applications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET APPLICATIONS FOR A SCHOLARSHIP (Provider)
const getScholarshipApplications = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const { status } = req.query;

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Verify scholarship belongs to provider
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId }
    });

    if (!scholarship || scholarship.providerId !== provider.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await prisma.application.findMany({
      where: {
        scholarshipId,
        ...(status && { status })
      },
      include: {
        student: {
          select: {
            name: true,
            cgpa: true,
            incomeLevel: true,
            fieldOfStudy: true,
            location: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json({ applications });

  } catch (error) {
    console.error('Get scholarship applications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET SINGLE APPLICATION
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: { select: { name: true, cgpa: true, fieldOfStudy: true } },
        scholarship: { select: { title: true, amount: true, deadline: true } },
        documents: true
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);

  } catch (error) {
    console.error('Get application error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// REVIEW APPLICATION (Provider - approve or reject)
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId }
    });

    const application = await prisma.application.findUnique({
      where: { id },
      include: { scholarship: true, student: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.scholarship.providerId !== provider.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        remarks,
        reviewedAt: new Date()
      }
    });

    // Fire unawaited notification for Status Change
    notifyApplicationStatus(application.student.userId, application.scholarship.title, status, remarks).catch(console.error);

    res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: updated
    });

  } catch (error) {
    console.error('Review application error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET ALL APPLICATIONS (Admin)
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = status ? { status } : {};

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: { select: { name: true } },
          scholarship: { select: { title: true } }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.application.count({ where })
    ]);

    res.status(200).json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getScholarshipApplications,
  getApplicationById,
  reviewApplication,
  getAllApplications
};
const prisma = require('../lib/prisma');
const { recalculateTrustScore } = require('./provider.controller');

// CREATE REVIEW (Student only)
const createReview = async (req, res) => {
  try {
    const { providerId, rating, comment } = req.body;

    if (!providerId || !rating) {
      return res.status(400).json({ message: 'Provider ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Check student has an approved application with this provider
    const approvedApplication = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: 'APPROVED',
        scholarship: { providerId }
      }
    });

    if (!approvedApplication) {
      return res.status(403).json({
        message: 'You can only review providers after receiving an approved scholarship'
      });
    }

    // Check duplicate review
    const existing = await prisma.review.findFirst({
      where: { studentId: student.id, providerId }
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this provider' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        studentId: student.id,
        providerId,
        rating: parseInt(rating),
        comment
      }
    });

    // Recalculate provider trust score
    await recalculateTrustScore(providerId);

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET REVIEWS FOR A PROVIDER (Public)
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          providerId,
          isModerated: false
        },
        include: {
          student: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.review.count({
        where: { providerId, isModerated: false }
      })
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get provider reviews error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET MY REVIEWS (Student)
const getMyReviews = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { studentId: student.id },
      include: {
        provider: { select: { orgName: true, trustScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ reviews });

  } catch (error) {
    console.error('Get my reviews error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE REVIEW (Student - own review only)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.studentId !== student.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment && { comment })
      }
    });

    // Recalculate trust score
    await recalculateTrustScore(review.providerId);

    res.status(200).json({
      message: 'Review updated successfully',
      review: updated
    });

  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE REVIEW (Student - own review only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.studentId !== student.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate trust score
    await recalculateTrustScore(review.providerId);

    res.status(200).json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// MODERATE REVIEW (Admin)
const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isModerated } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isModerated }
    });

    res.status(200).json({
      message: `Review ${isModerated ? 'moderated' : 'unmoderated'} successfully`,
      review
    });

  } catch (error) {
    console.error('Moderate review error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET ALL REVIEWS (Admin)
const getAllReviews = async (req, res) => {
  try {
    const { isModerated, page = 1, limit = 10 } = req.query;

    const where = isModerated !== undefined
      ? { isModerated: isModerated === 'true' }
      : {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          student: { select: { name: true } },
          provider: { select: { orgName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  moderateReview,
  getAllReviews
};
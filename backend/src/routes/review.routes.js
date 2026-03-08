const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  moderateReview,
  getAllReviews
} = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/provider/:providerId', getProviderReviews);

// Student routes
router.post('/', authenticate, authorize('STUDENT'), createReview);
router.get('/my', authenticate, authorize('STUDENT'), getMyReviews);
router.put('/:id', authenticate, authorize('STUDENT'), updateReview);
router.delete('/:id', authenticate, authorize('STUDENT'), deleteReview);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllReviews);
router.patch('/:id/moderate', authenticate, authorize('ADMIN'), moderateReview);

module.exports = router;
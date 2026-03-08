const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getScholarshipApplications,
  getApplicationById,
  reviewApplication,
  getAllApplications
} = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Student routes
router.post('/', authenticate, authorize('STUDENT'), submitApplication);
router.get('/my', authenticate, authorize('STUDENT'), getMyApplications);

// Provider routes
router.get('/scholarship/:scholarshipId', authenticate, authorize('PROVIDER'), getScholarshipApplications);
router.patch('/:id/review', authenticate, authorize('PROVIDER'), reviewApplication);

// Shared route
router.get('/:id', authenticate, getApplicationById);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllApplications);

module.exports = router;
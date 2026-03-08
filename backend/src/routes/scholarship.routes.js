const express = require('express');
const router = express.Router();
const {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  updateScholarshipStatus
} = require('../controllers/scholarship.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);

// Provider routes
router.post('/', authenticate, authorize('PROVIDER'), createScholarship);
router.put('/:id', authenticate, authorize('PROVIDER'), updateScholarship);
router.delete('/:id', authenticate, authorize('PROVIDER'), deleteScholarship);

// Admin routes
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateScholarshipStatus);

module.exports = router;
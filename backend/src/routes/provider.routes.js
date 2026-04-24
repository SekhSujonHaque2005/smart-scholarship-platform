const express = require('express');
const router = express.Router();
const {
  getAllProviders,
  getMyProfile,
  updateProfile,
  submitVerification,
  getPendingVerifications,
  verifyProvider,
  getProviderById
} = require('../controllers/provider.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllProviders);
router.get('/:id', getProviderById);

// Provider routes
router.get('/me/profile', authenticate, authorize('PROVIDER'), getMyProfile);
router.put('/me/profile', authenticate, authorize('PROVIDER'), updateProfile);
router.post('/me/verify', authenticate, authorize('PROVIDER'), submitVerification);

// Admin routes
router.get('/admin/pending', authenticate, authorize('ADMIN'), getPendingVerifications);
router.patch('/:id/verify', authenticate, authorize('ADMIN'), verifyProvider);

module.exports = router;
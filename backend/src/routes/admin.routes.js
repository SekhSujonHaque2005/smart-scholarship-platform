const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes here require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Platform Stats
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:userId/status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Provider Verification
router.get('/providers/pending', adminController.getPendingProviders);
router.patch('/providers/:providerId/verify', adminController.verifyProvider);

// Scholarship Moderation
router.get('/scholarships', adminController.getAllScholarships);
router.patch('/scholarships/:id/moderate', adminController.moderateScholarship);
router.put('/scholarships/:id', adminController.updateScholarship);
router.delete('/scholarships/:id', adminController.deleteScholarship);

// AI & Fraud
router.get('/fraud', adminController.getFraudAlerts);

// System Logs & Finance & Triggers
router.get('/transactions', adminController.getTransactions);
router.get('/logs', adminController.getAuditLogs);
router.post('/trigger-scraper', adminController.triggerScraper);

module.exports = router;

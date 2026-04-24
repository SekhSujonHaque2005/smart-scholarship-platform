const express = require('express');
const router = express.Router();
const { getPlatformStats, getProviderStats } = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public route — no auth required
router.get('/', getPlatformStats);

// Private route — restricted to authenticated providers
router.get('/provider', authenticate, authorize('PROVIDER'), getProviderStats);

module.exports = router;

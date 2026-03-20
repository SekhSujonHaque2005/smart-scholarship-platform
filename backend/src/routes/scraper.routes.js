const express = require('express');
const router = express.Router();
const { syncScholarships, getScraperStatus } = require('../controllers/scraper.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Scraper sync — accepts x-scraper-key or admin JWT
router.post('/sync', authenticate, authorize('ADMIN'), syncScholarships);

// Scraper health — public (for monitoring dashboards)
router.get('/status', getScraperStatus);

module.exports = router;

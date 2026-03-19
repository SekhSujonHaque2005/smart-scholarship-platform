const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/stats.controller');

// Public route — no auth required
router.get('/', getPlatformStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletter.controller');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to the scholarship alerts newsletter
// @access  Public
router.post('/subscribe', subscribeNewsletter);

module.exports = router;

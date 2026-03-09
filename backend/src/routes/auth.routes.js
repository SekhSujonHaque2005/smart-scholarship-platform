const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe, googleAuth } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/google', googleAuth);

module.exports = router;
const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe, googleAuth, forgotPassword, resetPassword, updateProfile, updatePassword, updatePreferences } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/me/profile', authenticate, updateProfile);
router.put('/me/password', authenticate, updatePassword);
router.put('/me/preferences', authenticate, updatePreferences);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
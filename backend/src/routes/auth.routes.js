const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe, googleAuth, forgotPassword, resetPassword, updateProfile, updatePassword, updatePreferences, verify2FA, toggle2FA } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const rateLimit = require('express-rate-limit');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, updatePasswordSchema, updatePreferencesSchema, verify2FASchema, toggle2FASchema } = require('../schemas/auth.schema');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/me/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/me/password', authenticate, validate(updatePasswordSchema), updatePassword);
router.put('/me/preferences', authenticate, validate(updatePreferencesSchema), updatePreferences);
router.post('/verify-2fa', validate(verify2FASchema), verify2FA);
router.put('/me/2fa', authenticate, validate(toggle2FASchema), toggle2FA);
router.post('/google', googleAuth);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

module.exports = router;
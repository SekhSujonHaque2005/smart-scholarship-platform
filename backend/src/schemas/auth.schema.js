const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'PROVIDER'], {
    errorMap: () => ({ message: 'Role must be either STUDENT or PROVIDER' })
  }),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  cgpa: z.union([z.number(), z.string().transform(v => parseFloat(v))]).optional(),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  incomeLevel: z.string().optional(),
  profilePicture: z.string().url().optional().nullable().or(z.string().length(0))
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

const updatePreferencesSchema = z.record(z.any());

const verify2FASchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  tempToken: z.string().min(1, 'Temporary token is required')
});

const toggle2FASchema = z.object({
  enable: z.boolean()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updatePasswordSchema,
  updatePreferencesSchema,
  verify2FASchema,
  toggle2FASchema
};

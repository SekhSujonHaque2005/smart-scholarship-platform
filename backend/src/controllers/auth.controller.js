const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { sendEmail } = require('../services/notification.service');

// Generate tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// REGISTER
const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Validation
    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['STUDENT', 'PROVIDER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role }
      });

      if (role === 'STUDENT') {
        await tx.student.create({
          data: { userId: newUser.id, name }
        });
      } else if (role === 'PROVIDER') {
        await tx.provider.create({
          data: { userId: newUser.id, orgName: name }
        });
      }

      return newUser;
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: name }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { student: true, provider: true }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2FA Check
    if (user.is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 10);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorOTP: hashedOTP,
          twoFactorExpires: otpExpires
        }
      });

      // Send OTP Email
      await sendEmail(
        user.email,
        '🛡️ Your 2FA Verification Code - ScholarHub',
        `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">Two-Factor Authentication</h2>
          <p>Hello,</p>
          <p>Your verification code is below. This code will expire in 10 minutes.</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you didn't attempt to log in, please secure your account immediately.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">ScholarHub — Secure Education Access</p>
        </div>
        `
      );

      // Issue temporary token for 2FA step
      const tempToken = jwt.sign(
        { userId: user.id, is2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        message: '2FA required',
        requires2FA: true,
        tempToken,
        email: user.email
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.role === 'STUDENT' ? user.student?.name : user.provider?.orgName 
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.role
    );

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });

  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        student: true,
        provider: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileStrength = 0;
    let missingFields = [];

    if (user.role === 'STUDENT' && user.student) {
      const s = user.student;
      profileStrength += 10; // Basic account

      if (s.cgpa) profileStrength += 10; else missingFields.push('CGPA');
      if (s.fieldOfStudy) profileStrength += 10; else missingFields.push('Field of Study');
      if (s.location) profileStrength += 10; else missingFields.push('Location');
      if (s.incomeLevel) profileStrength += 10; else missingFields.push('Income Level');
      if (user.profilePicture) profileStrength += 10; else missingFields.push('Profile Picture');

      // Check documents in vault
      const docs = await prisma.document.findMany({
        where: { studentId: s.id, appId: null }
      });

      const hasDoc = (type) => docs.some(d => d.docType.toUpperCase() === type.toUpperCase());

      if (hasDoc('TRANSCRIPT')) profileStrength += 10; else missingFields.push('Academic Transcript');
      if (hasDoc('ID_PROOF') || hasDoc('ID')) profileStrength += 10; else missingFields.push('Identity Proof');
      if (hasDoc('RESUME')) profileStrength += 10; else missingFields.push('Professional Resume');
      if (hasDoc('LOR')) profileStrength += 10; else missingFields.push('Letter of Recommendation');
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      profilePicture: user.profilePicture,
      profile: user.student || user.provider,
      profileStrength,
      missingFields
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GOOGLE AUTH
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user
      user = await prisma.$transaction(async (tx) => {
        // We use a dummy password fallback in case the schema strictly requires password
        const randomHash = await bcrypt.hash(Math.random().toString(36), 10);
        const newUser = await tx.user.create({
          data: {
            email,
            role: 'STUDENT',
            password: randomHash
          }
        });

        await tx.student.create({
          data: {
            userId: newUser.id,
            name: name || email.split('@')[0]
          }
        });

        return newUser;
      });
    }

    // 2FA Check for Google Auth
    if (user.is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 10);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorOTP: hashedOTP,
          twoFactorExpires: otpExpires
        }
      });

      await sendEmail(
        user.email,
        '🛡️ Your 2FA Verification Code - ScholarHub',
        `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">Two-Factor Authentication (Google Login)</h2>
          <p>Hello,</p>
          <p>You just logged in via Google. Since you have 2FA enabled, please use the code below to complete your login.</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you didn't attempt to log in, please secure your account immediately.</p>
        </div>
        `
      );

      const tempToken = jwt.sign(
        { userId: user.id, is2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        message: '2FA required',
        requires2FA: true,
        tempToken,
        email: user.email
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(200).json({
      message: 'Google auth successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 for security to prevent email enumeration
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      '🔐 Password Reset Request - ScholarHub',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset for your ScholarHub account.</p>
        <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">ScholarHub — Your shortcut to educational success.</p>
      </div>
      `
    );

    res.status(200).json({ message: 'If an account exists, a reset link has been sent' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, cgpa, fieldOfStudy, location, incomeLevel, profilePicture } = req.body;

    // 1. Update Student Profile if fields are provided
    if (req.user.role === 'STUDENT') {
      const studentUpdateData = {};
      if (name !== undefined) studentUpdateData.name = name;
      if (cgpa !== undefined) studentUpdateData.cgpa = cgpa ? parseFloat(cgpa) : null;
      if (fieldOfStudy !== undefined) studentUpdateData.fieldOfStudy = fieldOfStudy;
      if (location !== undefined) studentUpdateData.location = location;
      if (incomeLevel !== undefined) studentUpdateData.incomeLevel = incomeLevel;

      if (Object.keys(studentUpdateData).length > 0) {
        await prisma.student.update({
          where: { userId: req.user.userId },
          data: studentUpdateData
        });
      }
    }

    // 2. Update User Level fields (e.g. Profile Picture)
    if (profilePicture !== undefined) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { profilePicture }
      });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid current password' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// UPDATE PREFERENCES
const updatePreferences = async (req, res) => {
  try {
    const preferences = req.body;

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { preferences }
    });

    res.status(200).json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// VERIFY 2FA
const verify2FA = async (req, res) => {
  try {
    const { email, otp, tempToken } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.is2FA) {
      return res.status(401).json({ message: 'Invalid 2FA session' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { student: true, provider: true }
    });
    if (!user || user.id !== decoded.userId) {
      return res.status(401).json({ message: 'Invalid 2FA session' });
    }

    // Check OTP
    if (!user.twoFactorOTP || !user.twoFactorExpires || user.twoFactorExpires < new Date()) {
      return res.status(401).json({ message: 'OTP expired or not found' });
    }

    const isOTPValid = await bcrypt.compare(otp, user.twoFactorOTP);
    if (!isOTPValid) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    // Clear OTP and issue tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorOTP: null,
        twoFactorExpires: null
      }
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(200).json({
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.role === 'STUDENT' ? user.student?.name : user.provider?.orgName 
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(401).json({ message: 'Invalid or expired session' });
  }
};

// TOGGLE 2FA
const toggle2FA = async (req, res) => {
  try {
    const { enable } = req.body;

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { is2FAEnabled: enable }
    });

    res.status(200).json({
      message: `2FA ${enable ? 'enabled' : 'disabled'} successfully`,
      is2FAEnabled: enable
    });
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({ message: 'Failed to update 2FA settings' });
  }
};

module.exports = { register, login, refreshToken, getMe, googleAuth, forgotPassword, resetPassword, updateProfile, updatePassword, updatePreferences, verify2FA, toggle2FA };
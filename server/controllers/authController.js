const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'swasthyasetu_secure_jwt_secret_key_2026_rural_health', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const rawIdentifier = req.body.email || req.body.username || req.body.identifier;
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password',
      });
    }

    const identifier = rawIdentifier.trim().toLowerCase();

    // 1. Attempt database authentication if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({
          $or: [
            { email: identifier },
            { username: identifier },
          ],
        });

        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const token = generateToken(user._id);
            return res.status(200).json({
              success: true,
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                patientId: user.patientId,
                phone: user.phone,
                language: user.language,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn('[Auth] MongoDB query skipped/failed, checking demo store:', dbErr.message);
      }
    }

    // 2. Demo fallback authentication (handles disconnected state or instant demo login)
    const demoUser = mockStore.authenticateUser(identifier, password);
    if (demoUser) {
      const token = generateToken(demoUser.id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          username: demoUser.username,
          role: demoUser.role,
          patientId: demoUser.patientId,
          phone: demoUser.phone,
          language: demoUser.language,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username/email or password credentials',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (user) {
          return res.status(200).json({
            success: true,
            user,
          });
        }
      } catch (err) {
        // Fallback to req.user
      }
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & language preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, language } = req.body;

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          if (name) user.name = name;
          if (phone !== undefined) user.phone = phone;
          if (language) user.language = language;
          await user.save();

          return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              language: user.language,
            },
          });
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    // In-memory update
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (language) req.user.language = language;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          const isMatch = await user.matchPassword(currentPassword);
          if (!isMatch) {
            return res.status(400).json({
              success: false,
              message: 'Current password is incorrect',
            });
          }

          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(newPassword, salt);
          await user.save();

          return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
          });
        }
      } catch (err) {
        // Fallback
      }
    }

    // Demo password check
    if (currentPassword !== 'Demo@123') {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'swasthyasetu_secure_jwt_secret_key_2026_rural_health'
      );

      // 1. If MongoDB is connected, attempt to fetch user from DB
      if (mongoose.connection.readyState === 1) {
        try {
          req.user = await User.findById(decoded.id).select('-passwordHash');
        } catch (dbErr) {
          req.user = null;
        }
      }

      // 2. Fallback to mockStore (for in-memory demo mode or demo accounts)
      if (!req.user) {
        const mockUser = mockStore.findUserById(decoded.id);
        if (mockUser) {
          req.user = {
            _id: mockUser.id || mockUser._id,
            id: mockUser.id || mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            username: mockUser.username,
            role: mockUser.role,
            patientId: mockUser.patientId,
            phone: mockUser.phone,
            language: mockUser.language,
          };
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists or authorization failed',
        });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }
};

module.exports = { protect };

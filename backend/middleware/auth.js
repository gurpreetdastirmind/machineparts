// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { findUserById } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || '8fQ@2Lm#9Xv!Kp7$Rt4&Nz6Wy';

// Regular authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Store both userId and role from token
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'user';
    req.tokenType = decoded.type || 'user';
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Admin authentication middleware - FIXED with token validation
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ✅ CRITICAL: Check if token has admin role
    if (decoded.role !== 'admin' && decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        error: 'Invalid token type'
      });
    }
    
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'admin';
    
    // Additional verification - check database
    const user = await findUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { auth, adminAuth };
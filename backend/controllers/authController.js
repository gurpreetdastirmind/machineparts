// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, comparePassword, hashPassword } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Generate token with role embedded
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,  // Include role in token
      type: role === 'admin' ? 'admin' : 'user' // Add type for easier identification
    }, 
    JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await hashPassword(password);
    const { db } = require('../config/database');
    
    db.run(`INSERT INTO users (firstName, lastName, email, phone, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, hashedPassword, 'user', new Date().toISOString()],
      function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: { user: { id: this.lastID, firstName, lastName, email, phone, role: 'user' } }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// Login user - FIXED with bcrypt and proper role
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password using bcrypt
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Ensure role is properly set
    const userRole = user.role || 'user';
    
    // Generate token with role
    const token = generateToken(user.id, userRole);

    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: userRole
    };

    console.log('✅ Login successful for:', user.email, 'Role:', userRole);
    console.log('🔑 Token generated with role:', userRole);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role || 'user'
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // In a real app, send email with reset link
    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // In a real app, verify token and update password
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
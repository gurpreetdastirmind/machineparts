// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const { db,findUserByEmail, findUserById, comparePassword, hashPassword } = require('../config/database');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
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
    res.status(500).json({ success: false, messag0e: 'Login failed', error: error.message });
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

    // 1. Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 2. Set expiry time (e.g., 1 hour from now)
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds

    // 3. Save token to database
    // NOTE: You need to add 'resetToken' and 'resetTokenExpiry' columns to your 'users' table first!
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
        [resetToken, resetTokenExpiry, email],
        (err) => err ? reject(err) : resolve()
      );
    });

    // 4. Create the reset link
    // Make sure FRONTEND_URL is in your .env file
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    // 5. Configure Nodemailer (Using the same setup as your Contact form)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
    });

    // 6. Setup Email Data
    const mailOptions = {
      from: `"Machine Parts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h3>Password Reset</h3>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // 7. Send the email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};

// ✅ UPDATED: Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Find user by valid token and check expiry
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?',
        [token, Date.now()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // 2. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update user's password and clear the reset token
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
        [hashedPassword, user.id],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

// ✅ NEW: Change password (authenticated user)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Fetch the user
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    console.log(`✅ Password changed for user ${userId} (${user.email})`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

// ✅ NEW: Update profile (authenticated user)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name and email are required',
      });
    }

    // Check if email is taken by another user
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use by another account',
      });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?`,
        [firstName, lastName || '', email, phone || '', userId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Return updated user
    const updatedUser = await findUserById(userId);

    console.log(`✅ Profile updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role || 'user',
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};


// Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
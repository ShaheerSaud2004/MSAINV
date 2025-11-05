const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { handleValidationErrors } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');
const fs = require('fs').promises;
const path = require('path');

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set. Please configure it in Railway environment variables.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Log login activity
const logLoginActivity = async (activityData) => {
  try {
    const loginActivityDir = path.join(__dirname, '../storage/data');
    const loginActivityFile = path.join(loginActivityDir, 'loginActivity.json');
    let activities = [];
    
    // Ensure directory exists
    await fs.mkdir(loginActivityDir, { recursive: true });
    
    try {
      const data = await fs.readFile(loginActivityFile, 'utf8');
      activities = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      activities = [];
    }
    
    // Add new activity
    activities.unshift(activityData);
    
    // Keep only last 500 activities
    if (activities.length > 500) {
      activities = activities.slice(0, 500);
    }
    
    await fs.writeFile(loginActivityFile, JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error('Error logging login activity:', error);
  }
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    const storageService = getStorageService();

    // Check if user already exists
    const existingUser = await storageService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      department: department || '',
      phone: phone || '',
      role: 'user',
      status: 'active',
      permissions: {
        canCheckout: true,
        canReturn: true,
        canApprove: false,
        canManageItems: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canBulkImport: false
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        language: 'en',
        theme: 'light'
      },
      profile: {
        avatar: '',
        bio: ''
      },
      lastLogin: new Date()
    };

    const user = await storageService.createUser(userData);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // Generate token
    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const storageService = getStorageService();

    // Find user by email
    const user = await storageService.findUserByEmail(email);
    
    if (!user) {
      console.error('Login failed: User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password field exists
    if (!user.password) {
      console.error('Login failed: User has no password field:', user.id);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.error('Login failed: Password mismatch for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is not active. Please contact an administrator.'
      });
    }

    // Update last login
    await storageService.updateUser(user._id || user.id, {
      lastLogin: new Date()
    });

    // Log login activity
    await logLoginActivity({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // Generate token
    const token = generateToken(user._id || user.id);

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
    console.error('Error stack:', error.stack);
    
    // Check if JWT_SECRET is missing
    if (error.message && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET is not set. Please contact administrator.',
        error: 'JWT_SECRET_MISSING'
      });
    }
    
    // Check if it's a database/connection error
    if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
      return res.status(500).json({
        success: false,
        message: 'Database tables not set up. Please run the Supabase migration SQL.',
        error: 'DATABASE_NOT_INITIALIZED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const userResponse = { ...req.user };
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, department, phone, preferences, profile } = req.body;
    const storageService = getStorageService();

    const updates = {};
    if (name) updates.name = name;
    if (department) updates.department = department;
    if (phone) updates.phone = phone;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };
    if (profile) updates.profile = { ...req.user.profile, ...profile };

    const updatedUser = await storageService.updateUser(req.user._id || req.user.id, updates);

    const userResponse = { ...updatedUser };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const storageService = getStorageService();

    // Get user with password
    const user = await storageService.findUserById(req.user._id || req.user.id);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await storageService.updateUser(user._id || user.id, {
      password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/auth/login-activity
// @desc    Get login activity (Admin/Manager only)
// @access  Private
router.get('/login-activity', protect, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or manager role required.'
      });
    }

    const loginActivityFile = path.join(__dirname, '../storage/data/loginActivity.json');
    let activities = [];
    
    try {
      const data = await fs.readFile(loginActivityFile, 'utf8');
      activities = JSON.parse(data);
    } catch (error) {
      activities = [];
    }

    // Get pagination parameters
    const { limit = 50, page = 1 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(activities.length / limit),
        totalItems: activities.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get login activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving login activity',
      error: error.message
    });
  }
});

module.exports = router;


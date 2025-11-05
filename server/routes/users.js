const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, checkPermission, authorize } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');
const bcrypt = require('bcryptjs');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin/manager or self)
router.get('/', protect, async (req, res) => {
  try {
    const { role = '', status = '' } = req.query;
    const storageService = getStorageService();
    
    // Only admins and managers can see all users
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      // Regular users can only see themselves
      const currentUserId = req.user._id || req.user.id;
      const user = await storageService.findUserById(currentUserId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return res.json({
          success: true,
          data: [userWithoutPassword]
        });
      }
      return res.json({
        success: true,
        data: []
      });
    }
    
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    let users = await storageService.findAllUsers(query);
    
    // Remove passwords from response
    users = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (admin/manager or self)
router.get('/:id', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const user = await storageService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permission
    const currentUserId = req.user._id || req.user.id;
    if (req.user.role === 'user' && req.params.id !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user'
      });
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (admin only)
router.post('/', protect, checkPermission('canManageUsers'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    const storageService = getStorageService();

    // Check if user exists
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

    // Set permissions based on role
    let permissions = {};
    if (role === 'admin') {
      permissions = {
        canCheckout: true,
        canReturn: true,
        canApprove: true,
        canManageItems: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canBulkImport: true
      };
    } else if (role === 'manager') {
      permissions = {
        canCheckout: true,
        canReturn: true,
        canApprove: true,
        canManageItems: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canBulkImport: true
      };
    } else {
      permissions = {
        canCheckout: true,
        canReturn: true,
        canApprove: false,
        canManageItems: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canBulkImport: false
      };
    }

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      department: department || '',
      phone: phone || '',
      status: 'active',
      permissions,
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
      }
    };

    const user = await storageService.createUser(userData);

    // Remove password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin only)
router.put('/:id', protect, checkPermission('canManageUsers'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const user = await storageService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, role, department, phone, status, permissions } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (phone !== undefined) updates.phone = phone;
    if (status) updates.status = status;
    if (permissions) updates.permissions = { ...user.permissions, ...permissions };

    // Update permissions if role is changed
    if (role && role !== user.role) {
      if (role === 'admin') {
        updates.permissions = {
          canCheckout: true,
          canReturn: true,
          canApprove: true,
          canManageItems: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canBulkImport: true
        };
      } else if (role === 'manager') {
        updates.permissions = {
          canCheckout: true,
          canReturn: true,
          canApprove: true,
          canManageItems: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canBulkImport: true
        };
      }
    }

    const updatedUser = await storageService.updateUser(req.params.id, updates);

    // Remove password
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin only)
router.delete('/:id', protect, checkPermission('canManageUsers'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const user = await storageService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active transactions
    const activeTransactions = await storageService.findAllTransactions({
      user: req.params.id,
      status: 'active'
    });

    if (activeTransactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active transactions. Please return all items first.'
      });
    }

    // Don't allow deleting self
    const currentUserId = req.user._id || req.user.id;
    if (req.params.id === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await storageService.deleteUser(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id/reset-password
// @desc    Reset user password
// @access  Private (admin only)
router.put('/:id/reset-password', protect, checkPermission('canManageUsers'), [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { newPassword } = req.body;
    const storageService = getStorageService();

    const user = await storageService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await storageService.updateUser(req.params.id, {
      password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
});

module.exports = router;


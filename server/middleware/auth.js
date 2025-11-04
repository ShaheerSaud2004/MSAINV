const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getStorageService } = require('../services/storageService');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables');
        return res.status(500).json({ 
          success: false, 
          message: 'Server configuration error: JWT_SECRET is not set' 
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const storageService = getStorageService();
      req.user = await storageService.findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (req.user.status !== 'active') {
        return res.status(401).json({ 
          success: false, 
          message: 'User account is not active' 
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};

// Check for specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};

// Check for specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({ 
        success: false, 
        message: `You don't have permission to ${permission}` 
      });
    }

    next();
  };
};

module.exports = { protect, authorize, checkPermission };


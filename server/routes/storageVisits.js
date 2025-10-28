const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, checkPermission } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../storage/uploads/storage-visits');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'storage-visit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// @route   POST /api/storage-visits/:transactionId/upload-photo
// @desc    Upload storage visit photo for a transaction
// @access  Private
router.post('/:transactionId/upload-photo', protect, upload.array('photos', 5), async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { visitType, location, notes, caption } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    // Find the transaction
    const transaction = await storageService.findTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user owns this transaction or is admin/manager
    const transactionUserId = transaction.user._id || transaction.user.id || transaction.user;
    const isOwner = transactionUserId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload photos for this transaction'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    // Create photo objects
    const photos = req.files.map((file, index) => ({
      url: `/storage/uploads/storage-visits/${file.filename}`,
      caption: Array.isArray(caption) ? caption[index] : caption || `Storage visit photo`,
      uploadDate: new Date()
    }));

    // Create storage visit record
    const storageVisit = {
      visitDate: new Date(),
      visitType: visitType || 'pickup',
      userId: userId,
      photos: photos,
      location: location || transaction.item?.location || 'Unknown',
      notes: notes || ''
    };

    // Add to transaction
    const storageVisits = transaction.storageVisits || [];
    storageVisits.push(storageVisit);

    await storageService.updateTransaction(transactionId, {
      storageVisits: storageVisits,
      storagePhotoUploaded: true
    });

    res.json({
      success: true,
      message: 'Storage visit photos uploaded successfully',
      data: {
        storageVisit,
        photosUploaded: photos.length
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading storage visit photos',
      error: error.message
    });
  }
});

// @route   GET /api/storage-visits/:transactionId
// @desc    Get storage visits for a transaction
// @access  Private
router.get('/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const storageService = getStorageService();

    const transaction = await storageService.findTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        storageVisits: transaction.storageVisits || [],
        requiresStoragePhoto: transaction.requiresStoragePhoto,
        storagePhotoUploaded: transaction.storagePhotoUploaded
      }
    });
  } catch (error) {
    console.error('Get storage visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving storage visits',
      error: error.message
    });
  }
});

// @route   GET /api/storage-visits
// @desc    Get all storage visits (Admin/Manager only)
// @access  Private (Admin/Manager)
router.get('/', protect, checkPermission('canViewAnalytics'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const { startDate, endDate, userId, visitType } = req.query;

    // Get all transactions with storage visits
    const query = {
      storageVisits: { $exists: true, $ne: [] }
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (userId) {
      query.user = userId;
    }

    const transactions = await storageService.getAllTransactions(query);
    
    // Extract and flatten storage visits
    const allVisits = [];
    transactions.forEach(transaction => {
      if (transaction.storageVisits && transaction.storageVisits.length > 0) {
        transaction.storageVisits.forEach(visit => {
          if (!visitType || visit.visitType === visitType) {
            allVisits.push({
              ...visit,
              transaction: {
                id: transaction._id || transaction.id,
                transactionNumber: transaction.transactionNumber,
                item: transaction.item,
                user: transaction.user
              }
            });
          }
        });
      }
    });

    res.json({
      success: true,
      count: allVisits.length,
      data: allVisits
    });
  } catch (error) {
    console.error('Get all storage visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving storage visits',
      error: error.message
    });
  }
});

// @route   PUT /api/storage-visits/:transactionId/:visitId/verify
// @desc    Verify a storage visit (Admin/Manager only)
// @access  Private (Admin/Manager)
router.put('/:transactionId/:visitId/verify', protect, checkPermission('canApprove'), async (req, res) => {
  try {
    const { transactionId, visitId } = req.params;
    const { notes } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const transaction = await storageService.findTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Find and update the storage visit
    const storageVisits = transaction.storageVisits || [];
    const visitIndex = storageVisits.findIndex(v => 
      (v._id || v.id).toString() === visitId
    );

    if (visitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Storage visit not found'
      });
    }

    storageVisits[visitIndex].verifiedBy = userId;
    storageVisits[visitIndex].verifiedDate = new Date();
    if (notes) storageVisits[visitIndex].notes = notes;

    await storageService.updateTransaction(transactionId, {
      storageVisits: storageVisits
    });

    res.json({
      success: true,
      message: 'Storage visit verified successfully',
      data: storageVisits[visitIndex]
    });
  } catch (error) {
    console.error('Verify storage visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying storage visit',
      error: error.message
    });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, checkPermission } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');

// @route   GET /api/items
// @desc    Get all items with filtering, search, and pagination
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      status = '', 
      isCheckoutable = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const storageService = getStorageService();
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isCheckoutable) query.isCheckoutable = isCheckoutable === 'true';
    if (search) query.search = search;

    let items = await storageService.findAllItems(query);

    // Sort items
    items.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(items.length / limit),
        totalItems: items.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving items',
      error: error.message
    });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const item = await storageService.findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving item',
      error: error.message
    });
  }
});

// @route   POST /api/items
// @desc    Create new item
// @access  Private (requires canManageItems permission)
router.post('/', protect, checkPermission('canManageItems'), [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('totalQuantity').isInt({ min: 0 }).withMessage('Total quantity must be a positive number'),
  handleValidationErrors
], async (req, res) => {
  try {
    const storageService = getStorageService();

    const itemData = {
      ...req.body,
      team: '', // Items are shared globally across all teams
      availableQuantity: req.body.totalQuantity,
      createdBy: req.user._id || req.user.id,
      lastModifiedBy: req.user._id || req.user.id
    };

    const item = await storageService.createItem(itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (requires canManageItems permission)
router.put('/:id', protect, checkPermission('canManageItems'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const item = await storageService.findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const updates = {
      ...req.body,
      lastModifiedBy: req.user._id || req.user.id
    };

    // Don't allow direct modification of availableQuantity through this endpoint
    delete updates.availableQuantity;

    const updatedItem = await storageService.updateItem(req.params.id, updates);

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (requires canManageItems permission)
router.delete('/:id', protect, checkPermission('canManageItems'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const item = await storageService.findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item has active transactions
    const activeTransactions = await storageService.findAllTransactions({
      item: req.params.id,
      status: 'active'
    });

    if (activeTransactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item with active transactions'
      });
    }

    await storageService.deleteItem(req.params.id);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
});

// @route   GET /api/items/categories/list
// @desc    Get list of all categories
// @access  Private
router.get('/categories/list', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const items = await storageService.findAllItems({});
    
    const categories = [...new Set(items.map(item => item.category))].filter(Boolean);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
});

// @route   POST /api/items/:id/adjust-quantity
// @desc    Adjust item quantity (for inventory adjustments)
// @access  Private (requires canManageItems permission)
router.post('/:id/adjust-quantity', protect, checkPermission('canManageItems'), [
  body('adjustment').isInt().withMessage('Adjustment must be an integer'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const storageService = getStorageService();
    
    const item = await storageService.findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const newTotalQuantity = item.totalQuantity + adjustment;
    const newAvailableQuantity = item.availableQuantity + adjustment;

    if (newTotalQuantity < 0 || newAvailableQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment would result in negative quantity'
      });
    }

    // Update item quantities
    const updatedItem = await storageService.updateItem(req.params.id, {
      totalQuantity: newTotalQuantity,
      availableQuantity: newAvailableQuantity
    });

    // Create adjustment transaction for audit trail
    await storageService.createTransaction({
      type: 'adjustment',
      status: 'active',
      item: req.params.id,
      user: req.user._id || req.user.id,
      quantity: Math.abs(adjustment),
      checkoutDate: new Date(),
      expectedReturnDate: new Date(),
      purpose: reason,
      notes: `Quantity ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} units`,
      checkedOutBy: req.user._id || req.user.id
    });

    res.json({
      success: true,
      message: 'Quantity adjusted successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Adjust quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adjusting quantity',
      error: error.message
    });
  }
});

module.exports = router;


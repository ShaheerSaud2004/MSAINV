const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, checkPermission } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');
const { createNotification, notifyManagers } = require('../services/notificationService');

// @route   GET /api/transactions
// @desc    Get all transactions with filtering and pagination
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      type = '',
      userId = '',
      itemId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const storageService = getStorageService();
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.user = userId;
    if (itemId) query.item = itemId;

    // Non-admin users can only see their own transactions
    if (req.user.role === 'user') {
      query.user = req.user._id || req.user.id;
    }

    let transactions = await storageService.findAllTransactions(query);

    // Populate item and user details for JSON storage
    if (process.env.STORAGE_MODE === 'json') {
      transactions = await Promise.all(transactions.map(async (t) => {
        const item = await storageService.findItemById(t.item);
        const user = await storageService.findUserById(t.user);
        return {
          ...t,
          item: item || t.item,
          user: user ? { _id: user._id || user.id, name: user.name, email: user.email } : t.user
        };
      }));
    }

    // Sort transactions
    transactions.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'checkoutDate') {
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
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(transactions.length / limit),
        totalItems: transactions.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transactions',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    let transaction = await storageService.findTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission to view this transaction
    const transactionUserId = transaction.user._id || transaction.user.id || transaction.user;
    const currentUserId = req.user._id || req.user.id;
    
    if (req.user.role === 'user' && transactionUserId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this transaction'
      });
    }

    // Populate item and user for JSON storage
    if (process.env.STORAGE_MODE === 'json') {
      const item = await storageService.findItemById(transaction.item);
      const user = await storageService.findUserById(transaction.user);
      transaction = {
        ...transaction,
        item: item || transaction.item,
        user: user ? { _id: user._id || user.id, name: user.name, email: user.email } : transaction.user
      };
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transaction',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/checkout
// @desc    Checkout an item
// @access  Private
async function approveTransactionInternal(transactionId, approver) {
  const storageService = getStorageService();
  const userId = approver._id || approver.id;

  const transaction = await storageService.findTransactionById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'pending') {
    throw new Error('Only pending transactions can be approved');
  }

  const itemId = transaction.item?._id || transaction.item?.id || transaction.item_id || transaction.item;
  const item = await storageService.findItemById(itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  if (item.availableQuantity < transaction.quantity) {
    throw new Error(`Only ${item.availableQuantity} units available. Cannot approve.`);
  }

  const updateResult = await storageService.updateTransaction(transactionId, {
    status: 'active',
    approvedBy: userId,
    approvedDate: new Date()
  });

  if (!updateResult || updateResult.status !== 'active') {
    throw new Error('Failed to update transaction status');
  }

  const itemUpdateResult = await storageService.updateItem(itemId, {
    availableQuantity: item.availableQuantity - transaction.quantity
  });

  if (!itemUpdateResult) {
    await storageService.updateTransaction(transactionId, { status: 'pending' });
    throw new Error('Failed to update item quantities');
  }

  // Notify user (non-critical)
  try {
    const transactionUserId =
      transaction.user?._id || transaction.user?.id || transaction.user_id || transaction.user;

    await createNotification({
      recipient: transactionUserId,
      type: 'approval_approved',
      title: 'Checkout Approved - Photos Required!',
      message: `Your checkout request has been approved by ${approver.name || 'an admin'}. IMPORTANT: You MUST upload storage visit photos before closing this transaction.`,
      priority: 'high',
      channels: {
        email: true,
        sms: false,
        push: true,
        inApp: true
      },
      relatedTransaction: transactionId,
      relatedItem: itemId,
      actionUrl: `/transactions/${transactionId}`,
      actionText: 'Upload Photos Now'
    });
  } catch (notifError) {
    console.error('Notification error (non-critical):', notifError);
  }

  const updatedTransaction = await storageService.findTransactionById(transactionId);

  if (!updatedTransaction) {
    throw new Error('Failed to retrieve updated transaction');
  }

  return updatedTransaction;
}

router.post('/checkout', protect, checkPermission('canCheckout'), [
  body('item').notEmpty().withMessage('Item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('expectedReturnDate').isISO8601().withMessage('Valid return date is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { item, quantity, purpose, expectedReturnDate, destination, notes } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    // Find item
    const itemDoc = await storageService.findItemById(item);

    if (!itemDoc) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check availability
    // Consider reservations: sum of pending transactions for this item reduces availability
    const allTx = await storageService.findAllTransactions({ item });
    const reservedPending = allTx
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    const effectiveAvailable = Math.max(0, (itemDoc.availableQuantity || 0) - reservedPending);

    if (effectiveAvailable < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${effectiveAvailable} unit(s) available after pending reservations`
      });
    }

    // Check if item is checkoutable
    if (!itemDoc.isCheckoutable || itemDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for checkout'
      });
    }

    // ALL checkouts now require approval for safety and tracking
    const needsApproval = true; // Changed: Always require approval
    
    // Create transaction
    const transactionData = {
      type: 'checkout',
      status: 'pending', // Always pending until approved
      item: item,
      user: userId,
      quantity: quantity,
      checkoutDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      purpose: purpose,
      destination: destination || {},
      checkoutCondition: itemDoc.condition,
      notes: notes || '',
      approvalRequired: true, // Always true now
      checkedOutBy: userId
    };

    const transaction = await storageService.createTransaction(transactionData);

    // Approval is always required now, so skip the immediate checkout logic
    if (false) { // Disabled - all checkouts need approval
      await storageService.updateItem(item, {
        availableQuantity: itemDoc.availableQuantity - quantity
      });
      
      // Notify user of successful checkout (don't fail checkout if notification fails)
      try {
        await createNotification({
          recipient: userId,
          type: 'checkout_confirmed',
          title: 'Checkout Successful',
          message: `You have successfully checked out ${quantity} unit(s) of ${itemDoc.name}`,
          priority: 'medium',
          channels: {
            email: true,
            sms: false,
            push: false,
            inApp: true
          },
          relatedTransaction: transaction._id || transaction.id,
          relatedItem: item,
          actionUrl: `/transactions/${transaction._id || transaction.id}`,
          actionText: 'View Transaction'
        });
      } catch (notifError) {
        console.error('Notification error (non-critical):', notifError);
      }

      return res.status(201).json({
        success: true,
        message: 'Item checked out successfully',
        data: transaction
      });
    }

    // If approval needed, send notifications to managers (don't fail checkout if notification fails)
    try {
      await notifyManagers({
        type: 'approval_request',
        title: 'Checkout Approval Required',
        message: `${req.user.name} requested to checkout ${quantity} unit(s) of ${itemDoc.name}`,
        priority: 'high',
        relatedTransaction: transaction._id || transaction.id,
        relatedItem: item,
        actionUrl: `/admin`,
        actionText: 'Review in Admin Panel'
      });
    } catch (notifError) {
      console.error('Manager notification error (non-critical):', notifError);
    }

    // Notify user that approval is required
    try {
      await createNotification({
        recipient: userId,
        type: 'approval_request',
        title: 'Checkout Pending Approval',
        message: `Your checkout request for ${itemDoc.name} is pending admin approval`,
        priority: 'medium',
        channels: {
          email: true,
          sms: false,
          push: false,
          inApp: true
        },
        relatedTransaction: transaction._id || transaction.id,
        relatedItem: item,
        actionUrl: `/transactions/${transaction._id || transaction.id}`,
        actionText: 'View Request'
      });
    } catch (notifError) {
      console.error('User notification error (non-critical):', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Checkout request submitted for admin approval',
      data: transaction
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing checkout',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/checkout/bulk
// @desc    Checkout multiple items in one request
// @access  Private
router.post('/checkout/bulk', protect, checkPermission('canCheckout'), [
  body('items').isArray({ min: 1 }).withMessage('Select at least one item'),
  body('items.*.item').notEmpty().withMessage('Item ID is required for each selection'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('expectedReturnDate').isISO8601().withMessage('Valid return date is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { items: checkoutItems, purpose, expectedReturnDate, destination, requester } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    // Validate each requested item first
    const validationErrors = [];
    const itemPayloads = [];
    const uniqueIds = new Set();

    for (const entry of checkoutItems) {
      const itemId = entry.item;
      const quantity = parseInt(entry.quantity, 10);

      if (uniqueIds.has(itemId)) {
        validationErrors.push(`Duplicate selection detected for item ${itemId}. Please adjust quantities instead of selecting twice.`);
        continue;
      }
      uniqueIds.add(itemId);

      const itemDoc = await storageService.findItemById(itemId);

      if (!itemDoc) {
        validationErrors.push(`Item ${itemId} not found.`);
        continue;
      }

      if (!itemDoc.isCheckoutable || itemDoc.status !== 'active') {
        validationErrors.push(`${itemDoc.name} is not available for checkout.`);
        continue;
      }

      // Consider pending reservations
      const allTx = await storageService.findAllTransactions({ item: itemId });
      const reservedPending = allTx
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + (t.quantity || 0), 0);
      const effectiveAvailable = Math.max(0, (itemDoc.availableQuantity || 0) - reservedPending);

      if (effectiveAvailable < quantity) {
        validationErrors.push(`${itemDoc.name} only has ${effectiveAvailable} unit(s) available after pending reservations.`);
        continue;
      }

      itemPayloads.push({ doc: itemDoc, quantity });
    }

    if (itemPayloads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Unable to submit checkout request',
        errors: validationErrors.length ? validationErrors : ['No valid items provided']
      });
    }

    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: 'Some items could not be processed',
        errors: validationErrors
      });
    }

    const transactions = [];

    for (const payload of itemPayloads) {
      const { doc: itemDoc, quantity } = payload;
      const requesterLines = [
        'Bulk checkout request',
        `Checked out by: ${requester?.fullName || req.user.name || 'N/A'}`,
        `Team: ${requester?.team || 'N/A'}`,
        `Phone: ${requester?.phoneNumber || 'N/A'}`,
        `Email: ${requester?.email || req.user.email || 'N/A'}`,
        `Item: ${itemDoc.name}`,
        `Quantity: ${quantity}`,
        requester?.notes ? `Additional notes: ${requester.notes}` : ''
      ].filter(Boolean).join('\n');

      const transactionData = {
        type: 'checkout',
        status: 'pending',
        item: itemDoc._id || itemDoc.id,
        user: userId,
        quantity,
        checkoutDate: new Date(),
        expectedReturnDate: new Date(expectedReturnDate),
        purpose,
        destination: destination || {},
        checkoutCondition: itemDoc.condition,
        notes: requesterLines,
        approvalRequired: true,
        checkedOutBy: userId
      };

      const transaction = await storageService.createTransaction(transactionData);
      transactions.push(transaction);
    }

    // Notify managers once for the bulk request
    try {
      const descriptionList = itemPayloads
        .map(({ doc, quantity }) => `${quantity} × ${doc.name}`)
        .join(', ');

      await notifyManagers({
        type: 'approval_request',
        title: 'Bulk Checkout Approval Required',
        message: `${req.user.name} requested multiple items: ${descriptionList}`,
        priority: 'high',
        relatedTransaction: transactions[0]?._id || transactions[0]?.id,
        actionUrl: '/admin',
        actionText: 'Review in Admin Panel'
      });
    } catch (notifError) {
      console.error('Manager notification error (non-critical):', notifError);
    }

    // Notify user once
    try {
      await createNotification({
        recipient: userId,
        type: 'approval_request',
        title: 'Bulk Checkout Pending Approval',
        message: `Your bulk checkout request for ${transactions.length} item(s) is pending admin approval`,
        priority: 'medium',
        channels: {
          email: true,
          sms: false,
          push: false,
          inApp: true
        },
        relatedTransaction: transactions[0]?._id || transactions[0]?.id,
        actionUrl: '/transactions',
        actionText: 'View Requests'
      });
    } catch (notifError) {
      console.error('User notification error (non-critical):', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Bulk checkout request submitted for admin approval',
      data: transactions
    });
  } catch (error) {
    console.error('Bulk checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk checkout',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/:id/return
// @desc    Return an item
// @access  Private
router.post('/:id/return', protect, checkPermission('canReturn'), [
  body('returnCondition').optional().isIn(['new', 'good', 'fair', 'poor', 'damaged']),
  handleValidationErrors
], async (req, res) => {
  try {
    const { returnCondition, returnNotes } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const transaction = await storageService.findTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission
    const transactionUserId = transaction.user._id || transaction.user.id || transaction.user;
    if (req.user.role === 'user' && transactionUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to return this transaction'
      });
    }

    // Check if transaction is active or overdue
    if (transaction.status !== 'active' && transaction.status !== 'overdue') {
      return res.status(400).json({
        success: false,
        message: 'Only active or overdue transactions can be returned'
      });
    }

    const now = new Date();
    const expectedReturn = new Date(transaction.expectedReturnDate);
    const isOverdue = now > expectedReturn;

    const updates = {
      status: 'returned',
      actualReturnDate: now,
      returnCondition: returnCondition || 'good',
      returnNotes: returnNotes || '',
      returnedBy: userId
    };

    // Apply penalty if overdue
    if (isOverdue) {
      updates.isOverdue = true;
      const daysOverdue = Math.ceil((now - expectedReturn) / (1000 * 60 * 60 * 24));
      const penaltyAmount = daysOverdue * 5; // $5 per day

      updates.penalties = transaction.penalties || [];
      updates.penalties.push({
        type: 'late_fee',
        amount: penaltyAmount,
        currency: 'USD',
        reason: `Item returned ${daysOverdue} day(s) late`,
        issuedDate: now,
        issuedBy: userId,
        isPaid: false
      });
    }

    let updatedTransaction;
    try {
      updatedTransaction = await storageService.updateTransaction(req.params.id, updates);
    } catch (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update transaction in database: ' + updateError.message
      });
    }

    if (!updatedTransaction) {
      console.error('Transaction update returned null');
      return res.status(500).json({
        success: false,
        message: 'Failed to update transaction in database'
      });
    }

    // Check status - ensure it was updated correctly
    const updatedStatus = updatedTransaction.status;
    if (updatedStatus !== 'returned') {
      console.error('Transaction status mismatch:', {
        expected: 'returned',
        actual: updatedStatus,
        transactionId: req.params.id,
        transaction: updatedTransaction
      });
      return res.status(500).json({
        success: false,
        message: `Transaction update incomplete. Status is '${updatedStatus}' instead of 'returned'`
      });
    }

    // Update item available quantity (don't fail return if this fails)
    const itemId = transaction.item._id || transaction.item.id || transaction.item;
    try {
      const item = await storageService.findItemById(itemId);
      
      if (item) {
        const currentAvailable = Number(
          item.availableQuantity ??
          item.available_quantity ??
          0
        );
        const quantityReturned = Number(transaction.quantity ?? 0);

        await storageService.updateItem(itemId, {
          availableQuantity: currentAvailable + quantityReturned
        });
      }
    } catch (itemUpdateError) {
      console.error('Item quantity update error (non-critical):', itemUpdateError);
      // Don't fail the return if item update fails - transaction is already marked as returned
    }

    // Send return confirmation (don't fail if notification fails)
    try {
      await createNotification({
        recipient: transactionUserId,
        type: 'return_confirmed',
        title: 'Return Confirmed',
        message: `You have successfully returned ${transaction.quantity} unit(s). Thanks for sharing the storage photo in WhatsApp!`,
        priority: isOverdue ? 'high' : 'medium',
        channels: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        relatedTransaction: req.params.id,
        relatedItem: itemId,
        actionUrl: `/transactions/${req.params.id}`,
        actionText: 'View Transaction'
      });
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
      // Don't fail the return if notification fails
    }

    // Return the updated transaction we already have
    res.json({
      success: true,
      message: 'Item returned successfully' + (isOverdue ? ' (overdue penalty applied)' : ''),
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing return',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/:id/approve
// @desc    Approve a pending transaction
// @access  Private (requires canApprove permission)
router.post('/:id/approve', protect, checkPermission('canApprove'), async (req, res) => {
  try {
    const result = await approveTransactionInternal(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: result
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(
      error.message === 'Transaction not found' ? 404 :
      error.message.includes('pending') || error.message.includes('units available') ? 400 : 500
    ).json({
      success: false,
      message: error.message || 'Error approving transaction'
    });
  }
});

// Bulk approve
router.post('/approve/bulk', protect, checkPermission('canApprove'), [
  body('ids').isArray({ min: 1 }).withMessage('Provide at least one transaction id'),
  handleValidationErrors
], async (req, res) => {
  const { ids } = req.body;
  const uniqueIds = [...new Set(ids)];
  const results = [];
  const errors = [];

  for (const id of uniqueIds) {
    try {
      const approved = await approveTransactionInternal(id, req.user);
      results.push(approved);
    } catch (error) {
      errors.push({ id, message: error.message });
    }
  }

  res.json({
    success: errors.length === 0,
    message: errors.length
      ? `Approved ${results.length} request(s), ${errors.length} failed`
      : `Approved ${results.length} request(s)`,
    data: {
      approved: results,
      errors
    }
  });
});

// @route   POST /api/transactions/:id/reject
// @desc    Reject a pending transaction
// @access  Private (requires canApprove permission)
router.post('/:id/reject', protect, checkPermission('canApprove'), [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { reason } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const transaction = await storageService.findTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be rejected'
      });
    }

    // Update transaction
    await storageService.updateTransaction(req.params.id, {
      status: 'rejected',
      rejectedBy: userId,
      rejectedDate: new Date(),
      rejectionReason: reason
    });

    // Notify user
    const transactionUserId = transaction.user._id || transaction.user.id || transaction.user;
    const itemId = transaction.item._id || transaction.item.id || transaction.item;
    
    try {
      await createNotification({
        recipient: transactionUserId,
        type: 'approval_rejected',
        title: 'Checkout Rejected',
        message: `Your checkout request has been rejected. Reason: ${reason}`,
        priority: 'high',
        channels: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        relatedTransaction: req.params.id,
        relatedItem: itemId,
        actionUrl: `/transactions/${req.params.id}`,
        actionText: 'View Transaction'
      });
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
      // Do not fail rejection if notification fails
    }

    res.json({
      success: true,
      message: 'Transaction rejected successfully',
      data: await storageService.findTransactionById(req.params.id)
    });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting transaction',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/:id/extend
// @desc    Request extension for return date
// @access  Private
router.post('/:id/extend', protect, [
  body('newReturnDate').isISO8601().withMessage('Valid new return date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { newReturnDate, reason } = req.body;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const transaction = await storageService.findTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check permission
    const transactionUserId = transaction.user._id || transaction.user.id || transaction.user;
    if (req.user.role === 'user' && transactionUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to extend this transaction'
      });
    }

    if (transaction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active transactions can be extended'
      });
    }

    // Add extension request
    const extensions = transaction.extensions || [];
    extensions.push({
      requestedBy: userId,
      requestedDate: new Date(),
      newReturnDate: new Date(newReturnDate),
      reason: reason,
      status: 'pending'
    });

    await storageService.updateTransaction(req.params.id, { extensions });

    // Notify managers
    const itemId = transaction.item._id || transaction.item.id || transaction.item;
    await notifyManagers({
      type: 'extension_request',
      title: 'Extension Request',
      message: `${req.user.name} requested an extension for transaction ${transaction.transactionNumber}`,
      priority: 'medium',
      relatedTransaction: req.params.id,
      relatedItem: itemId,
      actionUrl: `/transactions/${req.params.id}`,
      actionText: 'Review Request'
    });

    res.json({
      success: true,
      message: 'Extension request submitted successfully',
      data: await storageService.findTransactionById(req.params.id)
    });
  } catch (error) {
    console.error('Extend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting extension',
      error: error.message
    });
  }
});

module.exports = router;


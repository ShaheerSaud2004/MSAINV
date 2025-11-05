const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');
const { createNotification } = require('../services/notificationService');

// @route   GET /api/qr/generate/:itemId
// @desc    Generate QR code for an item
// @access  Private
router.get('/generate/:itemId', protect, async (req, res) => {
  try {
    const { itemId } = req.params;
    const storageService = getStorageService();

    const item = await storageService.findItemById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Create QR code data
    const qrData = {
      id: item._id || item.id,
      name: item.name,
      sku: item.sku || '',
      qrCode: item.qrCode,
      type: 'item'
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION || 'M',
      width: parseInt(process.env.QR_CODE_SIZE) || 300,
      margin: 2
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        qrData: qrData,
        item: {
          id: item._id || item.id,
          name: item.name,
          sku: item.sku,
          qrCode: item.qrCode
        }
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
});

// @route   POST /api/qr/scan
// @desc    Process QR code scan
// @access  Private
router.post('/scan', protect, async (req, res) => {
  try {
    const { qrData, action, quantity, purpose, expectedReturnDate, destination, notes } = req.body;
    const storageService = getStorageService();

    // Parse QR data if it's a string
    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    // Validate QR code type
    if (parsedData.type !== 'item') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type'
      });
    }

    // Find item by QR code
    const item = await storageService.findItemByQRCode(parsedData.qrCode);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Handle different actions
    switch (action) {
      case 'checkout':
        return await handleCheckout(req, res, item, {
          quantity: quantity || 1,
          purpose,
          expectedReturnDate,
          destination,
          notes
        });
      
      case 'return':
        return await handleReturn(req, res, item, {
          quantity: quantity || 1,
          notes
        });
      
      case 'reserve':
        return await handleReserve(req, res, item, {
          quantity: quantity || 1,
          purpose,
          expectedReturnDate,
          notes
        });
      
      case 'view':
        return res.json({
          success: true,
          data: {
            item: item,
            message: 'Item information retrieved successfully'
          }
        });
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: checkout, return, reserve, or view'
        });
    }
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing QR code',
      error: error.message
    });
  }
});

// Helper function: Handle checkout via QR scan
async function handleCheckout(req, res, item, checkoutData) {
  const storageService = getStorageService();
  const userId = req.user._id || req.user.id;

  // Check if item is available
  if (item.availableQuantity < checkoutData.quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${item.availableQuantity} units available`
    });
  }

  // Check if item is checkoutable
  if (!item.isCheckoutable || item.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Item is not available for checkout'
    });
  }

  // Check user permissions
  if (!req.user.permissions.canCheckout) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to checkout items'
    });
  }

  // Validate required fields
  if (!checkoutData.purpose || !checkoutData.expectedReturnDate) {
    return res.status(400).json({
      success: false,
      message: 'Purpose and expected return date are required'
    });
  }

  // Create transaction
  const transactionData = {
    type: 'checkout',
    status: item.requiresApproval ? 'pending' : 'active',
    item: item._id || item.id,
    user: userId,
    quantity: checkoutData.quantity,
    checkoutDate: new Date(),
    expectedReturnDate: new Date(checkoutData.expectedReturnDate),
    purpose: checkoutData.purpose,
    destination: checkoutData.destination || {},
    checkoutCondition: item.condition,
    notes: checkoutData.notes || '',
    approvalRequired: item.requiresApproval,
    checkedOutBy: userId,
    scannedViaQR: true,
    qrScanData: {
      scanTime: new Date(),
      deviceInfo: req.headers['user-agent'] || ''
    }
  };

  const transaction = await storageService.createTransaction(transactionData);

  // If no approval required, update item quantities
  if (!item.requiresApproval) {
    await storageService.updateItem(item._id || item.id, {
      availableQuantity: item.availableQuantity - checkoutData.quantity
    });

    // Send confirmation notification
    await createNotification({
      recipient: userId,
      type: 'checkout_confirmation',
      title: 'Checkout Confirmed',
      message: `You have successfully checked out ${checkoutData.quantity} unit(s) of ${item.name}`,
      priority: 'medium',
      relatedTransaction: transaction._id || transaction.id,
      relatedItem: item._id || item.id,
      actionUrl: `/transactions/${transaction._id || transaction.id}`,
      actionText: 'View Transaction'
    });
  } else {
    // Send approval request notification to managers
    await createNotification({
      recipient: userId,
      type: 'approval_request',
      title: 'Approval Required',
      message: `Your checkout request for ${item.name} is pending approval`,
      priority: 'high',
      relatedTransaction: transaction._id || transaction.id,
      relatedItem: item._id || item.id,
      actionUrl: `/transactions/${transaction._id || transaction.id}`,
      actionText: 'View Request'
    });
  }

  res.status(201).json({
    success: true,
    message: item.requiresApproval 
      ? 'Checkout request submitted for approval' 
      : 'Item checked out successfully',
    data: {
      transaction,
      item: await storageService.findItemById(item._id || item.id)
    }
  });
}

// Helper function: Handle return via QR scan
async function handleReturn(req, res, item, returnData) {
  const storageService = getStorageService();
  const userId = req.user._id || req.user.id;

  // Find active transaction for this user and item
  const transactions = await storageService.findAllTransactions({
    user: userId,
    item: item._id || item.id,
    status: 'active'
  });

  const activeTransaction = transactions.find(t => 
    (t.user === userId || t.user._id === userId) && 
    (t.item === item._id || t.item === item.id || t.item._id === item._id) &&
    t.status === 'active'
  );

  if (!activeTransaction) {
    return res.status(404).json({
      success: false,
      message: 'No active checkout found for this item'
    });
  }

  // Check if return quantity is valid
  if (returnData.quantity > activeTransaction.quantity) {
    return res.status(400).json({
      success: false,
      message: 'Return quantity exceeds checked out quantity'
    });
  }

  // Update transaction
  const transactionUpdates = {
    status: 'returned',
    actualReturnDate: new Date(),
    returnCondition: 'good',
    returnNotes: returnData.notes || 'Returned via QR scan',
    returnedBy: userId
  };

  // Check if overdue
  const now = new Date();
  const expectedReturn = new Date(activeTransaction.expectedReturnDate);
  const isOverdue = now > expectedReturn;

  if (isOverdue) {
    transactionUpdates.isOverdue = true;
    
    // Calculate overdue days and apply penalty
    const daysOverdue = Math.ceil((now - expectedReturn) / (1000 * 60 * 60 * 24));
    const penaltyAmount = daysOverdue * 5; // $5 per day

    transactionUpdates.penalties = activeTransaction.penalties || [];
    transactionUpdates.penalties.push({
      type: 'late_fee',
      amount: penaltyAmount,
      currency: 'USD',
      reason: `Item returned ${daysOverdue} day(s) late`,
      issuedDate: new Date(),
      issuedBy: userId,
      isPaid: false
    });
  }

  await storageService.updateTransaction(activeTransaction._id || activeTransaction.id, transactionUpdates);

  // Update item available quantity
  await storageService.updateItem(item._id || item.id, {
    availableQuantity: item.availableQuantity + returnData.quantity
  });

  // Send return confirmation notification
  await createNotification({
    recipient: userId,
    type: 'checkout_confirmation',
    title: 'Return Confirmed',
    message: `You have successfully returned ${returnData.quantity} unit(s) of ${item.name}`,
    priority: isOverdue ? 'high' : 'medium',
    relatedTransaction: activeTransaction._id || activeTransaction.id,
    relatedItem: item._id || item.id,
    actionUrl: `/transactions/${activeTransaction._id || activeTransaction.id}`,
    actionText: 'View Transaction'
  });

  res.json({
    success: true,
    message: 'Item returned successfully' + (isOverdue ? ' (overdue penalty applied)' : ''),
    data: {
      transaction: await storageService.findTransactionById(activeTransaction._id || activeTransaction.id),
      item: await storageService.findItemById(item._id || item.id),
      wasOverdue: isOverdue
    }
  });
}

// Helper function: Handle reserve via QR scan
async function handleReserve(req, res, item, reserveData) {
  const storageService = getStorageService();
  const userId = req.user._id || req.user.id;

  // Check if item is available
  if (item.availableQuantity < reserveData.quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${item.availableQuantity} units available for reservation`
    });
  }

  // Validate required fields
  if (!reserveData.purpose || !reserveData.expectedReturnDate) {
    return res.status(400).json({
      success: false,
      message: 'Purpose and expected return date are required'
    });
  }

  // Create reservation transaction
  const transactionData = {
    type: 'reserve',
    status: 'pending',
    item: item._id || item.id,
    user: userId,
    quantity: reserveData.quantity,
    checkoutDate: new Date(reserveData.expectedReturnDate),
    expectedReturnDate: new Date(reserveData.expectedReturnDate),
    purpose: reserveData.purpose,
    notes: reserveData.notes || 'Reserved via QR scan',
    checkedOutBy: userId,
    scannedViaQR: true,
    qrScanData: {
      scanTime: new Date(),
      deviceInfo: req.headers['user-agent'] || ''
    }
  };

  const transaction = await storageService.createTransaction(transactionData);

  // Temporarily reduce available quantity
  await storageService.updateItem(item._id || item.id, {
    availableQuantity: item.availableQuantity - reserveData.quantity
  });

  // Send reservation confirmation
  await createNotification({
    recipient: userId,
    type: 'checkout_confirmation',
    title: 'Reservation Confirmed',
    message: `You have successfully reserved ${reserveData.quantity} unit(s) of ${item.name}`,
    priority: 'medium',
    relatedTransaction: transaction._id || transaction.id,
    relatedItem: item._id || item.id,
    actionUrl: `/transactions/${transaction._id || transaction.id}`,
    actionText: 'View Reservation'
  });

  res.status(201).json({
    success: true,
    message: 'Item reserved successfully',
    data: {
      transaction,
      item: await storageService.findItemById(item._id || item.id)
    }
  });
}

// @route   GET /api/qr/item/:qrCode
// @desc    Get item details by QR code
// @access  Public (for quick lookup)
router.get('/item/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    const storageService = getStorageService();

    const item = await storageService.findItemByQRCode(qrCode);
    
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
    console.error('Get item by QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving item',
      error: error.message
    });
  }
});

// @route   GET /api/qr/barcode/:barcode
// @desc    Get item details by barcode
// @access  Public (for quick lookup)
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const storageService = getStorageService();

    const item = await storageService.findItemByBarcode(barcode);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found with this barcode'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving item',
      error: error.message
    });
  }
});

module.exports = router;


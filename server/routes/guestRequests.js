const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, checkPermission } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');

// Basic rate limiter for guest submissions
const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

// @route   POST /api/guest-requests
// @desc    Submit a guest checkout request (no auth required)
// @access  Public
router.post('/', guestLimiter, [
  body('team').trim().notEmpty().withMessage('Team is required'),
  body('name').trim().notEmpty().withMessage('Your name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('itemPhoto').trim().notEmpty().withMessage('Photo of the item is required'),
  body('departurePhoto').trim().notEmpty().withMessage('Departure photo is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const storageService = getStorageService();
    const { team, itemId, itemName, name, email, purpose, notes, itemPhoto, departurePhoto } = req.body;

    const request = await storageService.createGuestRequest({
      team,
      item: itemId || null,
      itemName: itemName || '',
      requester: { name, email },
      purpose,
      notes: notes || '',
      photos: {
        itemPhoto,
        departurePhoto
      }
    });

    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Guest request error:', error);
    return res.status(500).json({ success: false, message: 'Error submitting request' });
  }
});

// @route   GET /api/guest-requests
// @desc    List guest requests for current team (admin/manager)
// @access  Private
router.get('/', protect, checkPermission('canApprove'), async (req, res) => {
  try {
    const storageService = getStorageService();
    // Admins/managers see all guest requests; team-specific filtering can be done client-side
    const allRequests = await storageService.findGuestRequestsByTeam('');
    const requests = req.user.team ? 
      allRequests.filter(r => (r.team || '') === (req.user.team || '')) : 
      allRequests; // Admin sees all
    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('List guest requests error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving requests' });
  }
});

// @route   POST /api/guest-requests/:id/approve
// @desc    Approve a guest request (convert into pending transaction)
// @access  Private
router.post('/:id/approve', protect, checkPermission('canApprove'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const { id } = req.params;
    const requests = await storageService.findGuestRequestsByTeam(req.user.team || '');
    const request = requests.find(r => (r._id === id || r.id === id));
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await storageService.updateGuestRequest(id, { status: 'approved', reviewedBy: req.user._id || req.user.id, reviewedAt: new Date().toISOString() });

    return res.json({ success: true, message: 'Guest request approved' });
  } catch (error) {
    console.error('Approve guest request error:', error);
    return res.status(500).json({ success: false, message: 'Error approving request' });
  }
});

// @route   POST /api/guest-requests/:id/reject
// @desc    Reject a guest request
// @access  Private
router.post('/:id/reject', protect, checkPermission('canApprove'), [
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const storageService = getStorageService();
    const { id } = req.params;
    const { reason } = req.body;
    const requests = await storageService.findGuestRequestsByTeam(req.user.team || '');
    const request = requests.find(r => (r._id === id || r.id === id));
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await storageService.updateGuestRequest(id, { status: 'rejected', rejectionReason: reason, reviewedBy: req.user._id || req.user.id, reviewedAt: new Date().toISOString() });
    return res.json({ success: true, message: 'Guest request rejected' });
  } catch (error) {
    console.error('Reject guest request error:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting request' });
  }
});

module.exports = router;



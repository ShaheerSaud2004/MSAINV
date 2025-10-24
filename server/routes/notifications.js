const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead = '' } = req.query;
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    let notifications = await storageService.findNotificationsByUser(userId);

    // Filter by read status if specified
    if (isRead !== '') {
      notifications = notifications.filter(n => n.isRead === (isRead === 'true'));
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    // Get unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: paginatedNotifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.length / limit),
        totalItems: notifications.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const notifications = await storageService.findNotificationsByUser(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: { count: unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving unread count',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const notification = await storageService.findNotificationsByUser(userId);
    const targetNotification = notification.find(n => (n._id || n.id) === req.params.id);

    if (!targetNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const updatedNotification = await storageService.updateNotification(req.params.id, {
      isRead: true,
      readAt: new Date(),
      status: 'read'
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const notifications = await storageService.findNotificationsByUser(userId);
    const unreadNotifications = notifications.filter(n => !n.isRead);

    await Promise.all(
      unreadNotifications.map(notification =>
        storageService.updateNotification(notification._id || notification.id, {
          isRead: true,
          readAt: new Date(),
          status: 'read'
        })
      )
    );

    res.json({
      success: true,
      message: `${unreadNotifications.length} notification(s) marked as read`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const storageService = getStorageService();
    const userId = req.user._id || req.user.id;

    const notifications = await storageService.findNotificationsByUser(userId);
    const targetNotification = notifications.find(n => (n._id || n.id) === req.params.id);

    if (!targetNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // For JSON storage, we need to delete from the collection
    if (process.env.STORAGE_MODE === 'json') {
      const allNotifications = await storageService.readCollection('notifications');
      const filtered = allNotifications.filter(n => (n._id || n.id) !== req.params.id);
      await storageService.writeCollection('notifications', filtered);
    } else {
      // For MongoDB, we'd use a delete method (would need to add to storage service)
      const Notification = require('../models/Notification');
      await Notification.findByIdAndDelete(req.params.id);
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

module.exports = router;


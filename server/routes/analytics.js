const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getStorageService } = require('../services/storageService');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const storageService = getStorageService();

    // Get all data
    const items = await storageService.findAllItems({});
    const transactions = await storageService.findAllTransactions({});
    const users = await storageService.findAllUsers({});

    // Calculate metrics
    const totalItems = items.length;
    const activeItems = items.filter(i => i.status === 'active').length;
    const totalValue = items.reduce((sum, item) => sum + (item.cost?.currentValue || 0), 0);

    const activeCheckouts = transactions.filter(t => t.status === 'active').length;
    const overdueCheckouts = transactions.filter(t => t.status === 'overdue').length;
    const pendingApprovals = transactions.filter(t => t.status === 'pending').length;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    // Recent activity (last 10 transactions)
    let recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Populate recent transactions for JSON storage
    let populatedRecentTransactions = recentTransactions;
    if (process.env.STORAGE_MODE === 'json') {
      populatedRecentTransactions = await Promise.all(
        recentTransactions.map(async (t) => {
          const item = await storageService.findItemById(t.item);
          const user = await storageService.findUserById(t.user);
          return {
            ...t,
            item: item || t.item,
            user: user ? { _id: user._id || user.id, name: user.name, email: user.email } : t.user
          };
        })
      );
    } else {
      // For MongoDB, convert mongoose documents to plain objects
      populatedRecentTransactions = recentTransactions.map(t => {
        if (t.toObject) {
          return t.toObject();
        }
        return t;
      });
    }

    // Top items (most checked out)
    const itemCheckoutCounts = {};
    transactions.forEach(t => {
      const itemId = t.item._id || t.item.id || t.item;
      if (!itemCheckoutCounts[itemId]) {
        itemCheckoutCounts[itemId] = 0;
      }
      itemCheckoutCounts[itemId]++;
    });

    const topItemIds = Object.entries(itemCheckoutCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    const topItems = await Promise.all(
      topItemIds.map(async ({ id, count }) => {
        const item = await storageService.findItemById(id);
        if (!item) return null;
        
        // Convert mongoose document to plain object if needed
        const itemObj = item.toObject ? item.toObject() : item;
        return { ...itemObj, checkoutCount: count };
      })
    );

    // Category distribution
    const categoryDistribution = {};
    items.forEach(item => {
      // Convert to plain object if needed
      const itemObj = item.toObject ? item.toObject() : item;
      const category = itemObj.category || 'Uncategorized';
      if (!categoryDistribution[category]) {
        categoryDistribution[category] = 0;
      }
      categoryDistribution[category]++;
    });

    // Transaction trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCheckouts = transactions.filter(t => 
      new Date(t.createdAt) >= thirtyDaysAgo
    );

    const dailyCheckouts = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCheckouts[dateStr] = 0;
    }

    recentCheckouts.forEach(t => {
      const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
      if (dailyCheckouts[dateStr] !== undefined) {
        dailyCheckouts[dateStr]++;
      }
    });

    const transactionTrends = Object.entries(dailyCheckouts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          activeItems,
          totalValue,
          activeCheckouts,
          overdueCheckouts,
          pendingApprovals,
          totalUsers,
          activeUsers
        },
        recentActivity: populatedRecentTransactions,
        topItems: topItems.filter(Boolean),
        categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({
          name,
          value
        })),
        transactionTrends
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/item-utilization
// @desc    Get item utilization rates
// @access  Private (requires canViewAnalytics)
router.get('/item-utilization', protect, checkPermission('canViewAnalytics'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const items = await storageService.findAllItems({});
    const transactions = await storageService.findAllTransactions({});

    const itemUtilization = items.map(item => {
      const itemId = item._id || item.id;
      const itemTransactions = transactions.filter(t => {
        const tItemId = t.item._id || t.item.id || t.item;
        return tItemId === itemId;
      });

      const totalCheckouts = itemTransactions.length;
      const currentlyCheckedOut = itemTransactions.filter(t => t.status === 'active').length;
      const utilizationRate = item.totalQuantity > 0 
        ? ((item.totalQuantity - item.availableQuantity) / item.totalQuantity) * 100 
        : 0;

      return {
        item: {
          id: itemId,
          name: item.name,
          category: item.category,
          totalQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity
        },
        totalCheckouts,
        currentlyCheckedOut,
        utilizationRate: utilizationRate.toFixed(2)
      };
    });

    // Sort by utilization rate
    itemUtilization.sort((a, b) => parseFloat(b.utilizationRate) - parseFloat(a.utilizationRate));

    res.json({
      success: true,
      data: itemUtilization
    });
  } catch (error) {
    console.error('Get utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving utilization data',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user-activity
// @desc    Get user activity report
// @access  Private (requires canViewAnalytics)
router.get('/user-activity', protect, checkPermission('canViewAnalytics'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const users = await storageService.findAllUsers({});
    const transactions = await storageService.findAllTransactions({});

    const userActivity = users.map(user => {
      const userId = user._id || user.id;
      const userTransactions = transactions.filter(t => {
        const tUserId = t.user._id || t.user.id || t.user;
        return tUserId === userId;
      });

      const totalCheckouts = userTransactions.length;
      const activeCheckouts = userTransactions.filter(t => t.status === 'active').length;
      const overdueCheckouts = userTransactions.filter(t => t.status === 'overdue').length;
      const completedCheckouts = userTransactions.filter(t => t.status === 'returned').length;

      return {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        totalCheckouts,
        activeCheckouts,
        overdueCheckouts,
        completedCheckouts
      };
    });

    // Sort by total checkouts
    userActivity.sort((a, b) => b.totalCheckouts - a.totalCheckouts);

    res.json({
      success: true,
      data: userActivity
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user activity',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/overdue-patterns
// @desc    Get overdue patterns and statistics
// @access  Private (requires canViewAnalytics)
router.get('/overdue-patterns', protect, checkPermission('canViewAnalytics'), async (req, res) => {
  try {
    const storageService = getStorageService();
    const transactions = await storageService.findAllTransactions({});

    const overdueTransactions = transactions.filter(t => t.isOverdue || t.status === 'overdue');

    // Calculate overdue statistics
    const totalOverdue = overdueTransactions.length;
    const averageDaysOverdue = overdueTransactions.reduce((sum, t) => {
      if (t.actualReturnDate) {
        const expected = new Date(t.expectedReturnDate);
        const actual = new Date(t.actualReturnDate);
        const days = Math.ceil((actual - expected) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0) / (totalOverdue || 1);

    // Overdue by user
    const overdueByUser = {};
    for (const transaction of overdueTransactions) {
      const userId = transaction.user._id || transaction.user.id || transaction.user;
      if (!overdueByUser[userId]) {
        const user = await storageService.findUserById(userId);
        overdueByUser[userId] = {
          user: user ? { id: userId, name: user.name, email: user.email } : { id: userId },
          count: 0
        };
      }
      overdueByUser[userId].count++;
    }

    // Overdue by item
    const overdueByItem = {};
    for (const transaction of overdueTransactions) {
      const itemId = transaction.item._id || transaction.item.id || transaction.item;
      if (!overdueByItem[itemId]) {
        const item = await storageService.findItemById(itemId);
        overdueByItem[itemId] = {
          item: item ? { id: itemId, name: item.name, category: item.category } : { id: itemId },
          count: 0
        };
      }
      overdueByItem[itemId].count++;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalOverdue,
          averageDaysOverdue: averageDaysOverdue.toFixed(2)
        },
        overdueByUser: Object.values(overdueByUser).sort((a, b) => b.count - a.count),
        overdueByItem: Object.values(overdueByItem).sort((a, b) => b.count - a.count)
      }
    });
  } catch (error) {
    console.error('Get overdue patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving overdue patterns',
      error: error.message
    });
  }
});

module.exports = router;


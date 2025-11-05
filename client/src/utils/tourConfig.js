// Tour configurations for different user roles

export const getTourSteps = (userRole) => {
  const baseSteps = {
    user: [
      {
        title: 'Welcome to MSA Inventory! 👋',
        content: 'This is your dashboard - your home base for managing inventory. Here you can see your active checkouts, overdue items, and quick actions.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: 'Look around to see your dashboard overview'
      },
      {
        title: 'Browse Items 📦',
        content: 'Click on "Items" in the sidebar to browse all available inventory. You can search, filter by category, and see item details.',
        targetPage: '/dashboard',
        targetSelector: 'a[href="/items"]',
        action: 'Click "Items" in the sidebar to see all available items'
      },
      {
        title: 'Checkout Items',
        content: 'When you find an item you need, you can request to checkout. Your request will need approval from your team manager.',
        targetPage: '/items',
        targetSelector: null,
        action: 'Click on any item card to view details and request checkout'
      },
      {
        title: 'View Your Transactions',
        content: 'Track all your checkouts and returns in the Transactions section. See pending approvals, active checkouts, and return history.',
        targetPage: '/items',
        targetSelector: 'a[href="/transactions"]',
        action: 'Click "Transactions" in the sidebar to see your checkout history'
      },
      {
        title: 'Upload Photos (Required!) 📸',
        content: 'After your checkout is approved, you MUST upload photos of your storage visit before closing the transaction. This is required for safety and accountability.',
        targetPage: '/transactions',
        targetSelector: null,
        action: 'When viewing a transaction, look for the "Upload Photos" button - this is REQUIRED!'
      },
      {
        title: 'Scan QR Codes 📱',
        content: 'Use the QR Scanner to quickly check out items by scanning their QR codes or barcodes. This makes checkout faster!',
        targetPage: '/transactions',
        targetSelector: 'a[href="/qr-scanner"]',
        action: 'Click "QR Scanner" in the sidebar to scan items'
      },
      {
        title: 'View Notifications 🔔',
        content: 'Check your notifications to see approval updates, reminders, and important messages about your transactions. Click the bell icon in the top bar.',
        targetPage: '/qr-scanner',
        targetSelector: 'a[href="/notifications"]',
        action: 'Click "Notifications" in the sidebar or the bell icon in the top bar'
      },
      {
        title: 'You\'re All Set! 🎉',
        content: 'You now know the basics! Remember: Always upload photos after approval, and check your notifications for updates.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: null
      }
    ],
    manager: [
      {
        title: 'Welcome, Manager! 👋',
        content: 'As a manager, you have access to approve checkout requests, view analytics, and manage your team\'s inventory.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: 'Your dashboard shows overview of all inventory and transactions'
      },
      {
        title: 'Approve Requests ✅',
        content: 'Check the Admin Panel or Transactions page to see pending checkout requests. You can approve or reject requests from your team members.',
        targetPage: '/dashboard',
        targetSelector: 'a[href="/admin"]',
        action: 'Go to Admin Panel to review pending requests'
      },
      {
        title: 'Manage Items 📦',
        content: 'As a manager, you can add, edit, and manage inventory items. You can also set categories and organize items for your team.',
        targetPage: '/admin',
        targetSelector: 'a[href="/items"]',
        action: 'Navigate to Items to manage inventory'
      },
      {
        title: 'View Analytics 📊',
        content: 'Check the Analytics section to see utilization rates, user activity, and overdue patterns. This helps you make informed decisions.',
        targetPage: '/items',
        targetSelector: 'a[href="/analytics"]',
        action: 'Review analytics to understand usage patterns'
      },
      {
        title: 'Manage Users 👥',
        content: 'View and manage team members in the Users section. You can see their activity and help them with their inventory needs.',
        targetPage: '/analytics',
        targetSelector: 'a[href="/users"]',
        action: 'Check the Users page to see your team'
      },
      {
        title: 'Photo Verification 📸',
        content: 'Always remind your team to upload photos after approval! Photos are required before closing transactions.',
        targetPage: '/users',
        targetSelector: 'a[href="/transactions"]',
        action: 'Verify that team members upload photos'
      },
      {
        title: 'You\'re Ready! 🎉',
        content: 'You can now effectively manage your team\'s inventory. Remember to approve requests promptly and verify photos are uploaded.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: null
      }
    ],
    admin: [
      {
        title: 'Welcome, Administrator! 👋',
        content: 'As an admin, you have full access to manage inventory, users, transactions, and system settings.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: 'Your dashboard provides a complete overview of the system'
      },
      {
        title: 'Admin Panel 🛠️',
        content: 'The Admin Panel is your command center. Here you can approve/reject requests, view all transactions, manage users, and more.',
        targetPage: '/dashboard',
        targetSelector: 'a[href="/admin"]',
        action: 'Access the Admin Panel for full control'
      },
      {
        title: 'Manage Inventory 📦',
        content: 'Add, edit, and organize all inventory items. Set categories, locations, and manage item details for your entire organization.',
        targetPage: '/admin',
        targetSelector: 'a[href="/items"]',
        action: 'Manage all items in the Items section'
      },
      {
        title: 'User Management 👥',
        content: 'Add users, assign roles, reset passwords, and manage permissions. Control who can access what features.',
        targetPage: '/items',
        targetSelector: 'a[href="/users"]',
        action: 'Manage users and their permissions'
      },
      {
        title: 'Analytics & Reports 📊',
        content: 'View comprehensive analytics including item utilization, user activity, overdue patterns, and system-wide statistics.',
        targetPage: '/users',
        targetSelector: 'a[href="/analytics"]',
        action: 'Review detailed analytics and reports'
      },
      {
        title: 'Transaction Management 🔄',
        content: 'Monitor all transactions, approve requests, and ensure proper documentation. Verify that photos are uploaded before closing.',
        targetPage: '/analytics',
        targetSelector: 'a[href="/transactions"]',
        action: 'Monitor and manage all transactions'
      },
      {
        title: 'QR Code Management 📱',
        content: 'Generate QR codes for items, print labels, and manage the scanning system. This helps with quick checkout.',
        targetPage: '/transactions',
        targetSelector: 'a[href="/qr-scanner"], a[href="/print-qr"]',
        action: 'Generate and manage QR codes'
      },
      {
        title: 'System Settings ⚙️',
        content: 'Configure system settings, manage notifications, and customize the inventory system for your organization.',
        targetPage: '/transactions',
        targetSelector: 'a[href="/settings"]',
        action: 'Access settings to configure the system'
      },
      {
        title: 'You\'re All Set! 🎉',
        content: 'You have full administrative access. Remember to ensure team members upload photos after approval and monitor system activity regularly.',
        targetPage: '/dashboard',
        targetSelector: null,
        action: null
      }
    ]
  };

  return baseSteps[userRole] || baseSteps.user;
};

export const hasCompletedTour = (userRole) => {
  const key = `tour_completed_${userRole}`;
  return localStorage.getItem(key) === 'true';
};

export const markTourCompleted = (userRole) => {
  const key = `tour_completed_${userRole}`;
  localStorage.setItem(key, 'true');
};

export const resetTour = (userRole) => {
  const key = `tour_completed_${userRole}`;
  localStorage.removeItem(key);
};


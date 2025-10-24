const { getStorageService } = require('./storageService');
const nodemailer = require('nodemailer');

// Email transporter configuration
let emailTransporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Create notification
async function createNotification(data) {
  try {
    const storageService = getStorageService();
    
    const notificationData = {
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      channels: data.channels || {
        email: false,
        sms: false,
        push: false,
        inApp: true
      },
      status: 'pending',
      isRead: false,
      relatedTransaction: data.relatedTransaction || null,
      relatedItem: data.relatedItem || null,
      actionUrl: data.actionUrl || '',
      actionText: data.actionText || '',
      metadata: data.metadata || {},
      scheduledFor: data.scheduledFor || null,
      deliveryStatus: {
        email: { sent: false, error: '' },
        sms: { sent: false, error: '' },
        push: { sent: false, error: '' }
      }
    };

    const notification = await storageService.createNotification(notificationData);

    // Send notifications based on channels
    if (data.channels?.email) {
      await sendEmailNotification(notification, data.recipient);
    }

    // Update notification status
    await storageService.updateNotification(notification._id || notification.id, {
      status: 'sent',
      sentAt: new Date()
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Send email notification
async function sendEmailNotification(notification, userId) {
  if (!emailTransporter) {
    console.log('Email transporter not configured');
    return;
  }

  try {
    const storageService = getStorageService();
    const user = await storageService.findUserById(userId);

    if (!user || !user.email) {
      console.log('User email not found');
      return;
    }

    // Check user preferences
    if (!user.preferences?.emailNotifications) {
      console.log('User has disabled email notifications');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `
            <a href="${process.env.CLIENT_URL}${notification.actionUrl}" 
               style="display: inline-block; background-color: #2563eb; color: white; 
                      padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
              ${notification.actionText || 'View Details'}
            </a>
          ` : ''}
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is an automated message from MSA Inventory Management System.
          </p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    // Update delivery status
    await storageService.updateNotification(notification._id || notification.id, {
      'deliveryStatus.email.sent': true,
      'deliveryStatus.email.sentAt': new Date()
    });

    console.log(`Email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Update delivery status with error
    const storageService = getStorageService();
    await storageService.updateNotification(notification._id || notification.id, {
      'deliveryStatus.email.sent': false,
      'deliveryStatus.email.error': error.message
    });
  }
}

// Send notification to multiple users (e.g., all managers)
async function notifyManagers(data) {
  try {
    const storageService = getStorageService();
    const managers = await storageService.findAllUsers({ role: 'manager' });
    const admins = await storageService.findAllUsers({ role: 'admin' });
    
    const recipients = [...managers, ...admins];

    const notifications = await Promise.all(
      recipients.map(user => createNotification({
        ...data,
        recipient: user._id || user.id
      }))
    );

    return notifications;
  } catch (error) {
    console.error('Error notifying managers:', error);
    throw error;
  }
}

// Send overdue notifications
async function sendOverdueNotifications() {
  try {
    const storageService = getStorageService();
    const now = new Date();

    // Find all active transactions past their return date
    const transactions = await storageService.findAllTransactions({ status: 'active' });
    
    const overdueTransactions = transactions.filter(t => {
      const returnDate = new Date(t.expectedReturnDate);
      return returnDate < now && !t.isOverdue;
    });

    for (const transaction of overdueTransactions) {
      // Update transaction status
      await storageService.updateTransaction(transaction._id || transaction.id, {
        status: 'overdue',
        isOverdue: true,
        overdueNotificationSent: true
      });

      // Notify user
      await createNotification({
        recipient: transaction.user,
        type: 'overdue_alert',
        title: 'Item Overdue',
        message: `Your checked out item is overdue. Please return it as soon as possible.`,
        priority: 'urgent',
        channels: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        relatedTransaction: transaction._id || transaction.id,
        relatedItem: transaction.item,
        actionUrl: `/transactions/${transaction._id || transaction.id}`,
        actionText: 'View Transaction'
      });

      // Notify managers
      await notifyManagers({
        type: 'overdue_alert',
        title: 'Item Overdue Alert',
        message: `Transaction ${transaction.transactionNumber} is overdue.`,
        priority: 'high',
        relatedTransaction: transaction._id || transaction.id,
        relatedItem: transaction.item,
        actionUrl: `/transactions/${transaction._id || transaction.id}`,
        actionText: 'Review Transaction'
      });
    }

    return overdueTransactions.length;
  } catch (error) {
    console.error('Error sending overdue notifications:', error);
    throw error;
  }
}

// Send due soon reminders
async function sendDueSoonReminders() {
  try {
    const storageService = getStorageService();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find transactions due within 24 hours
    const transactions = await storageService.findAllTransactions({ status: 'active' });
    
    const dueSoonTransactions = transactions.filter(t => {
      const returnDate = new Date(t.expectedReturnDate);
      return returnDate >= today && returnDate <= tomorrow;
    });

    for (const transaction of dueSoonTransactions) {
      await createNotification({
        recipient: transaction.user,
        type: 'return_reminder',
        title: 'Item Due Tomorrow',
        message: `Reminder: Your checked out item is due for return tomorrow.`,
        priority: 'medium',
        channels: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        relatedTransaction: transaction._id || transaction.id,
        relatedItem: transaction.item,
        actionUrl: `/transactions/${transaction._id || transaction.id}`,
        actionText: 'View Transaction'
      });
    }

    return dueSoonTransactions.length;
  } catch (error) {
    console.error('Error sending due soon reminders:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  notifyManagers,
  sendOverdueNotifications,
  sendDueSoonReminders
};


const mongoose = require('mongoose');

const extensionSchema = new mongoose.Schema({
  requestedDate: {
    type: Date,
    default: Date.now
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  newReturnDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
});

const penaltySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['late_fee', 'damage_fee', 'lost_item', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  reason: {
    type: String,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['checkout', 'return', 'reserve', 'cancel', 'maintenance', 'adjustment'],
    required: true,
    default: 'checkout'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'overdue', 'returned', 'cancelled', 'approved', 'rejected'],
    default: 'pending'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  checkoutDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    building: { type: String, default: '' },
    room: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  checkoutCondition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  returnCondition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor', 'damaged'],
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  returnNotes: {
    type: String,
    default: ''
  },
  approvalRequired: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  extensions: [extensionSchema],
  penalties: [penaltySchema],
  isOverdue: {
    type: Boolean,
    default: false
  },
  overdueNotificationSent: {
    type: Boolean,
    default: false
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  lastReminderDate: {
    type: Date,
    default: null
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  scannedViaQR: {
    type: Boolean,
    default: false
  },
  qrScanData: {
    scanTime: { type: Date },
    deviceInfo: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ item: 1, status: 1 });
transactionSchema.index({ status: 1, expectedReturnDate: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ checkoutDate: 1 });
transactionSchema.index({ expectedReturnDate: 1 });

// Generate transaction number before saving
transactionSchema.pre('save', async function(next) {
  if (!this.transactionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionNumber = `TXN-${year}${month}${day}-${random}`;
  }
  next();
});

// Method to check if overdue
transactionSchema.methods.checkOverdue = function() {
  if (this.status === 'active' && this.expectedReturnDate < new Date()) {
    return true;
  }
  return false;
};

// Method to calculate days overdue
transactionSchema.methods.getDaysOverdue = function() {
  if (this.status === 'active' && this.expectedReturnDate < new Date()) {
    const diffTime = Math.abs(new Date() - this.expectedReturnDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
};

// Method to extend return date
transactionSchema.methods.addExtension = function(userId, newReturnDate, reason) {
  this.extensions.push({
    requestedBy: userId,
    newReturnDate: newReturnDate,
    reason: reason,
    status: 'pending'
  });
  return this.extensions[this.extensions.length - 1];
};

// Method to add penalty
transactionSchema.methods.addPenalty = function(type, amount, reason, issuedBy) {
  this.penalties.push({
    type: type,
    amount: amount,
    reason: reason,
    issuedBy: issuedBy,
    isPaid: false
  });
  return this.penalties[this.penalties.length - 1];
};

module.exports = mongoose.model('Transaction', transactionSchema);


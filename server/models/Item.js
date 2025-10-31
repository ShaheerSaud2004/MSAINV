const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  team: {
    type: String,
    trim: true,
    default: ''
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  qrCode: {
    type: String,
    unique: true,
    default: function() {
      return `ITEM_${this._id}`;
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subCategory: {
    type: String,
    trim: true,
    default: ''
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    default: 'piece'
  },
  location: {
    building: { type: String, default: '' },
    room: { type: String, default: '' },
    shelf: { type: String, default: '' },
    bin: { type: String, default: '' }
  },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor', 'damaged', 'needs_maintenance'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired', 'lost'],
    default: 'active'
  },
  cost: {
    purchasePrice: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  supplier: {
    name: { type: String, default: '' },
    contact: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  images: [{
    url: { type: String },
    caption: { type: String, default: '' }
  }],
  isCheckoutable: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  maxCheckoutDuration: {
    type: Number,
    default: 7
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  maintenance: {
    lastMaintenanceDate: { type: Date, default: null },
    nextMaintenanceDate: { type: Date, default: null },
    maintenanceInterval: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  warrantyExpiry: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ sku: 1 });
itemSchema.index({ barcode: 1 });
itemSchema.index({ qrCode: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ isCheckoutable: 1 });
itemSchema.index({ team: 1 });

// Virtual for checked out quantity
itemSchema.virtual('checkedOutQuantity').get(function() {
  return this.totalQuantity - this.availableQuantity;
});

// Method to check availability
itemSchema.methods.isAvailable = function(quantity = 1) {
  return this.availableQuantity >= quantity && 
         this.status === 'active' && 
         this.isCheckoutable;
};

// Method to checkout
itemSchema.methods.checkout = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.availableQuantity -= quantity;
    return true;
  }
  return false;
};

// Method to return
itemSchema.methods.returnItem = function(quantity) {
  this.availableQuantity = Math.min(
    this.availableQuantity + quantity, 
    this.totalQuantity
  );
  return true;
};

// Ensure availableQuantity doesn't exceed totalQuantity
itemSchema.pre('save', function(next) {
  if (this.availableQuantity > this.totalQuantity) {
    this.availableQuantity = this.totalQuantity;
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);


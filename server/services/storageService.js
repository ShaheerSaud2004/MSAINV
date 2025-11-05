const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// JSON File Storage Service
class JSONStorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../storage/data');
    this.collections = {
      users: 'users.json',
      items: 'items.json',
      transactions: 'transactions.json',
      notifications: 'notifications.json',
      guestRequests: 'guestRequests.json'
    };
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize empty collections if they don't exist
      for (const [key, filename] of Object.entries(this.collections)) {
        const filePath = path.join(this.dataDir, filename);
        try {
          await fs.access(filePath);
        } catch {
          await fs.writeFile(filePath, JSON.stringify([], null, 2));
        }
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async readCollection(collectionName) {
    const filePath = path.join(this.dataDir, this.collections[collectionName]);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collectionName}:`, error);
      return [];
    }
  }

  async writeCollection(collectionName, data) {
    const filePath = path.join(this.dataDir, this.collections[collectionName]);
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${collectionName}:`, error);
      return false;
    }
  }

  generateId() {
    return uuidv4();
  }

  // User methods
  async findUserById(id) {
    const users = await this.readCollection('users');
    return users.find(u => u._id === id || u.id === id);
  }

  async findUserByEmail(email) {
    const users = await this.readCollection('users');
    return users.find(u => u.email === email);
  }

  async createUser(userData) {
    const users = await this.readCollection('users');
    const newUser = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    await this.writeCollection('users', users);
    return newUser;
  }

  async updateUser(id, updates) {
    const users = await this.readCollection('users');
    const index = users.findIndex(u => u._id === id || u.id === id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection('users', users);
      return users[index];
    }
    return null;
  }

  async deleteUser(id) {
    const users = await this.readCollection('users');
    const filtered = users.filter(u => u._id !== id && u.id !== id);
    await this.writeCollection('users', filtered);
    return filtered.length < users.length;
  }

  async findAllUsers(query = {}) {
    const users = await this.readCollection('users');
    // Simple filtering by role or status if provided
    let filtered = users;
    if (query.role) {
      filtered = filtered.filter(u => u.role === query.role);
    }
    if (query.status) {
      filtered = filtered.filter(u => u.status === query.status);
    }
    return filtered;
  }

  // Item methods
  async findItemById(id) {
    const items = await this.readCollection('items');
    return items.find(i => i._id === id || i.id === id);
  }

  async findItemByQRCode(qrCode) {
    const items = await this.readCollection('items');
    return items.find(i => i.qrCode === qrCode);
  }

  async findItemByBarcode(barcode) {
    const items = await this.readCollection('items');
    return items.find(i => i.barcode === barcode);
  }

  async createItem(itemData) {
    const items = await this.readCollection('items');
    const newItem = {
      _id: this.generateId(),
      ...itemData,
      qrCode: itemData.qrCode || `ITEM_${this.generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await this.writeCollection('items', items);
    return newItem;
  }

  async updateItem(id, updates) {
    const items = await this.readCollection('items');
    const index = items.findIndex(i => i._id === id || i.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection('items', items);
      return items[index];
    }
    return null;
  }

  async deleteItem(id) {
    const items = await this.readCollection('items');
    const filtered = items.filter(i => i._id !== id && i.id !== id);
    await this.writeCollection('items', filtered);
    return filtered.length < items.length;
  }

  async findAllItems(query = {}) {
    const items = await this.readCollection('items');
    let filtered = items;
    
    if (query.team) {
      filtered = filtered.filter(i => (i.team || '') === query.team);
    }
    if (query.category) {
      filtered = filtered.filter(i => i.category === query.category);
    }
    if (query.status) {
      filtered = filtered.filter(i => i.status === query.status);
    }
    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(search) || 
        (i.description && i.description.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }

  // Transaction methods
  async findTransactionById(id) {
    const transactions = await this.readCollection('transactions');
    return transactions.find(t => t._id === id || t.id === id);
  }

  async createTransaction(transactionData) {
    const transactions = await this.readCollection('transactions');
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const newTransaction = {
      _id: this.generateId(),
      ...transactionData,
      transactionNumber: transactionData.transactionNumber || `TXN-${year}${month}${day}-${random}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    await this.writeCollection('transactions', transactions);
    return newTransaction;
  }

  async updateTransaction(id, updates) {
    const transactions = await this.readCollection('transactions');
    const index = transactions.findIndex(t => t._id === id || t.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection('transactions', transactions);
      return transactions[index];
    }
    return null;
  }

  async findAllTransactions(query = {}) {
    const transactions = await this.readCollection('transactions');
    let filtered = transactions;
    
    if (query.team) {
      filtered = filtered.filter(t => (t.team || '') === query.team);
    }
    if (query.user) {
      filtered = filtered.filter(t => t.user === query.user);
    }
    if (query.item) {
      filtered = filtered.filter(t => t.item === query.item);
    }
    if (query.status) {
      filtered = filtered.filter(t => t.status === query.status);
    }
    if (query.type) {
      filtered = filtered.filter(t => t.type === query.type);
    }
    
    return filtered;
  }

  // Notification methods
  async createNotification(notificationData) {
    const notifications = await this.readCollection('notifications');
    const newNotification = {
      _id: this.generateId(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    await this.writeCollection('notifications', notifications);
    return newNotification;
  }

  async findNotificationsByUser(userId) {
    const notifications = await this.readCollection('notifications');
    return notifications.filter(n => n.recipient === userId);
  }

  async updateNotification(id, updates) {
    const notifications = await this.readCollection('notifications');
    const index = notifications.findIndex(n => n._id === id || n.id === id);
    if (index !== -1) {
      notifications[index] = {
        ...notifications[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection('notifications', notifications);
      return notifications[index];
    }
    return null;
  }

  // Guest Request methods
  async createGuestRequest(requestData) {
    const guestRequests = await this.readCollection('guestRequests');
    const newRequest = {
      _id: this.generateId(),
      status: 'pending',
      ...requestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    guestRequests.push(newRequest);
    await this.writeCollection('guestRequests', guestRequests);
    return newRequest;
  }

  async findGuestRequestsByTeam(team) {
    const guestRequests = await this.readCollection('guestRequests');
    // If team is empty string, return all requests (for admin)
    if (team === '') {
      return guestRequests;
    }
    return guestRequests.filter(r => (r.team || '') === team);
  }

  async updateGuestRequest(id, updates) {
    const guestRequests = await this.readCollection('guestRequests');
    const index = guestRequests.findIndex(r => r._id === id || r.id === id);
    if (index !== -1) {
      guestRequests[index] = {
        ...guestRequests[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection('guestRequests', guestRequests);
      return guestRequests[index];
    }
    return null;
  }
}

// MongoDB Storage Service (wrapper for Mongoose models)
class MongoDBStorageService {
  async findUserById(id) {
    const User = require('../models/User');
    return await User.findById(id).select('+password');
  }

  async findUserByEmail(email) {
    const User = require('../models/User');
    return await User.findOne({ email }).select('+password');
  }

  async createUser(userData) {
    const User = require('../models/User');
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id, updates) {
    const User = require('../models/User');
    return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async deleteUser(id) {
    const User = require('../models/User');
    await User.findByIdAndDelete(id);
    return true;
  }

  async findAllUsers(query = {}) {
    const User = require('../models/User');
    return await User.find(query);
  }

  async findItemById(id) {
    const Item = require('../models/Item');
    return await Item.findById(id);
  }

  async findItemByQRCode(qrCode) {
    const Item = require('../models/Item');
    return await Item.findOne({ qrCode });
  }

  async findItemByBarcode(barcode) {
    const Item = require('../models/Item');
    return await Item.findOne({ barcode });
  }

  async createItem(itemData) {
    const Item = require('../models/Item');
    const item = new Item(itemData);
    return await item.save();
  }

  async updateItem(id, updates) {
    const Item = require('../models/Item');
    return await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async deleteItem(id) {
    const Item = require('../models/Item');
    await Item.findByIdAndDelete(id);
    return true;
  }

  async findAllItems(query = {}) {
    const Item = require('../models/Item');
    return await Item.find(query);
  }

  async findTransactionById(id) {
    const Transaction = require('../models/Transaction');
    return await Transaction.findById(id).populate('item').populate('user');
  }

  async createTransaction(transactionData) {
    const Transaction = require('../models/Transaction');
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  async updateTransaction(id, updates) {
    const Transaction = require('../models/Transaction');
    return await Transaction.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async findAllTransactions(query = {}) {
    const Transaction = require('../models/Transaction');
    return await Transaction.find(query).populate('item').populate('user');
  }

  async createNotification(notificationData) {
    const Notification = require('../models/Notification');
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findNotificationsByUser(userId) {
    const Notification = require('../models/Notification');
    return await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
  }

  async updateNotification(id, updates) {
    const Notification = require('../models/Notification');
    return await Notification.findByIdAndUpdate(id, updates, { new: true });
  }

  // Guest Request methods (Mongo placeholder if needed later)
  async createGuestRequest(requestData) {
    // For Mongo mode, persist to a simple JSON collection for now to keep parity
    const { JSONStorageService } = require('./storageService');
    if (!global.jsonCompatService) {
      global.jsonCompatService = new JSONStorageService();
    }
    return await global.jsonCompatService.createGuestRequest(requestData);
  }

  async findGuestRequestsByTeam(team) {
    const { JSONStorageService } = require('./storageService');
    if (!global.jsonCompatService) {
      global.jsonCompatService = new JSONStorageService();
    }
    return await global.jsonCompatService.findGuestRequestsByTeam(team);
  }

  async updateGuestRequest(id, updates) {
    const { JSONStorageService } = require('./storageService');
    if (!global.jsonCompatService) {
      global.jsonCompatService = new JSONStorageService();
    }
    return await global.jsonCompatService.updateGuestRequest(id, updates);
  }
}

// Factory function to get appropriate storage service
function getStorageService() {
  if (process.env.STORAGE_MODE === 'json') {
    if (!global.jsonStorageService) {
      global.jsonStorageService = new JSONStorageService();
    }
    return global.jsonStorageService;
  }
  
  return new MongoDBStorageService();
}

module.exports = { getStorageService, JSONStorageService, MongoDBStorageService };


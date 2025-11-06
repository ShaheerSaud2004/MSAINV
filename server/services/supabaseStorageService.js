const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase Storage Service
class SupabaseStorageService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  generateId() {
    return uuidv4();
  }

  // Helper to convert Supabase item to camelCase format
  normalizeItem(item) {
    if (!item) return null;
    return {
      ...item,
      // ID fields
      _id: item.id,
      id: item.id,
      // Convert snake_case to camelCase
      qrCode: item.qr_code || item.qrCode,
      subCategory: item.sub_category || item.subCategory,
      totalQuantity: item.total_quantity ?? item.totalQuantity ?? 0,
      availableQuantity: item.available_quantity ?? item.availableQuantity ?? 0,
      isCheckoutable: item.is_checkoutable ?? item.isCheckoutable ?? true,
      requiresApproval: item.requires_approval ?? item.requiresApproval ?? false,
      maxCheckoutDuration: item.max_checkout_duration || item.maxCheckoutDuration,
      purchaseDate: item.purchase_date || item.purchaseDate,
      warrantyExpiry: item.warranty_expiry || item.warrantyExpiry,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      createdBy: item.created_by || item.createdBy,
      lastModifiedBy: item.last_modified_by || item.lastModifiedBy
    };
  }

  // Helper to convert Supabase user to camelCase format and ensure permissions
  normalizeUser(user) {
    if (!user) return null;
    
    // Parse permissions if it's a string (JSONB from Supabase)
    let permissions = user.permissions;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        console.warn('Failed to parse permissions JSON:', e);
        permissions = {};
      }
    }
    
    // Ensure permissions object exists and has defaults based on role
    if (!permissions || typeof permissions !== 'object') {
      permissions = {};
    }
    
    // Set default permissions based on role if not already set
    if (user.role === 'admin') {
      permissions = {
        canViewItems: true,
        canCheckout: true,
        canReturn: true,
        canApprove: true,
        canApproveTransactions: true,
        canManageItems: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canBulkImport: true,
        ...permissions // Override with existing permissions
      };
    } else if (user.role === 'manager') {
      permissions = {
        canViewItems: true,
        canCheckout: true,
        canReturn: true,
        canApprove: true,
        canApproveTransactions: true,
        canManageItems: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canManageSettings: false,
        canBulkImport: true,
        ...permissions
      };
    } else {
      // Default user permissions
      permissions = {
        canViewItems: true,
        canCheckout: true,
        canReturn: true,
        canApprove: false,
        canApproveTransactions: false,
        canManageItems: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canBulkImport: false,
        ...permissions
      };
    }
    
    return {
      ...user,
      // ID fields
      _id: user.id,
      id: user.id,
      // Ensure permissions is an object
      permissions: permissions,
      // Convert snake_case to camelCase
      lastLogin: user.last_login || user.lastLogin,
      createdAt: user.created_at || user.createdAt,
      updatedAt: user.updated_at || user.updatedAt
    };
  }

  // User methods
  async findUserById(id) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error finding user by id:', error);
      return null;
    }
    
    return this.normalizeUser(data);
  }

  async findUserByEmail(email) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error) {
        // PGRST116 = not found (this is OK)
        if (error.code === 'PGRST116') {
          return null;
        }
        // Other errors (like table doesn't exist)
        console.error('Supabase error finding user by email:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
          throw new Error('Database tables do not exist. Please run the Supabase migration SQL first.');
        }
        return null;
      }
      
      return this.normalizeUser(data);
    } catch (error) {
      console.error('Exception in findUserByEmail:', error);
      throw error;
    }
  }

  async createUser(userData) {
    // Normalize user data for Supabase
    const newUser = {
      id: this.generateId(),
      name: userData.name,
      email: userData.email?.toLowerCase(),
      password: userData.password,
      role: userData.role || 'user',
      department: userData.department || '',
      team: userData.team || '',
      phone: userData.phone || '',
      status: userData.status || 'active',
      permissions: userData.permissions || {},
      preferences: userData.preferences || {},
      profile: userData.profile || {},
      last_login: userData.lastLogin ? (userData.lastLogin instanceof Date ? userData.lastLogin.toISOString() : userData.lastLogin) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await this.supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      console.error('User data:', JSON.stringify(newUser, null, 2));
      throw error;
    }
    
    // Return normalized user
    return this.normalizeUser(data);
  }

  async updateUser(id, updates) {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  }

  async deleteUser(id) {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  }

  async findAllUsers(query = {}) {
    let queryBuilder = this.supabase.from('users').select('*');
    
    if (query.role) {
      queryBuilder = queryBuilder.eq('role', query.role);
    }
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error finding users:', error);
      return [];
    }
    
    // Normalize all users
    return (data || []).map(user => this.normalizeUser(user));
  }

  // Item methods
  async findItemById(id) {
    const { data, error } = await this.supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding item by id:', error);
      return null;
    }
    
    return this.normalizeItem(data);
  }

  async findItemByQRCode(qrCode) {
    const { data, error } = await this.supabase
      .from('items')
      .select('*')
      .eq('qr_code', qrCode)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding item by QR code:', error);
      return null;
    }
    
    return this.normalizeItem(data);
  }

  async findItemByBarcode(barcode) {
    const { data, error } = await this.supabase
      .from('items')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding item by barcode:', error);
      return null;
    }
    
    return this.normalizeItem(data);
  }

  async createItem(itemData) {
    const newItem = {
      id: this.generateId(),
      ...itemData,
      qr_code: itemData.qrCode || itemData.qr_code || `ITEM_${this.generateId()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Remove camelCase fields and use snake_case for Supabase
    delete newItem.qrCode;
    
    const { data, error } = await this.supabase
      .from('items')
      .insert(newItem)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating item:', error);
      throw error;
    }
    
    // Convert back to camelCase for compatibility
    if (data) {
      data.qrCode = data.qr_code;
    }
    
    return data;
  }

  async updateItem(id, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Convert camelCase to snake_case
    if (updateData.qrCode) {
      updateData.qr_code = updateData.qrCode;
      delete updateData.qrCode;
    }
    
    const { data, error } = await this.supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating item:', error);
      return null;
    }
    
    // Convert back to camelCase
    if (data) {
      data.qrCode = data.qr_code;
    }
    
    return data;
  }

  async deleteItem(id) {
    const { error } = await this.supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting item:', error);
      return false;
    }
    
    return true;
  }

  async findAllItems(query = {}) {
    let queryBuilder = this.supabase.from('items').select('*');
    
    if (query.team) {
      queryBuilder = queryBuilder.eq('team', query.team);
    }
    if (query.category) {
      queryBuilder = queryBuilder.eq('category', query.category);
    }
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }
    if (query.search) {
      const search = query.search.toLowerCase();
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error finding items:', error);
      return [];
    }
    
    // Convert snake_case to camelCase for compatibility
    return (data || []).map(item => this.normalizeItem(item));
  }

  // Transaction methods
  async findTransactionById(id) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        items:item_id (*),
        users:user_id (*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error finding transaction by id:', error);
      return null;
    }
    
    return this.normalizeTransaction(data);
  }

  // Helper to convert transaction camelCase to snake_case
  normalizeTransactionForInsert(transactionData) {
    const normalized = { ...transactionData };
    
    // Convert all camelCase fields to snake_case
    if (normalized.user !== undefined) {
      normalized.user_id = normalized.user;
      delete normalized.user;
    }
    if (normalized.item !== undefined) {
      normalized.item_id = normalized.item;
      delete normalized.item;
    }
    if (normalized.transactionNumber !== undefined) {
      normalized.transaction_number = normalized.transactionNumber;
      delete normalized.transactionNumber;
    }
    if (normalized.checkoutDate !== undefined) {
      normalized.checkout_date = normalized.checkoutDate instanceof Date 
        ? normalized.checkoutDate.toISOString() 
        : normalized.checkoutDate;
      delete normalized.checkoutDate;
    }
    if (normalized.expectedReturnDate !== undefined) {
      normalized.expected_return_date = normalized.expectedReturnDate instanceof Date 
        ? normalized.expectedReturnDate.toISOString() 
        : normalized.expectedReturnDate;
      delete normalized.expectedReturnDate;
    }
    if (normalized.actualReturnDate !== undefined) {
      normalized.actual_return_date = normalized.actualReturnDate instanceof Date 
        ? normalized.actualReturnDate.toISOString() 
        : normalized.actualReturnDate;
      delete normalized.actualReturnDate;
    }
    if (normalized.returnDate !== undefined) {
      normalized.return_date = normalized.returnDate instanceof Date 
        ? normalized.returnDate.toISOString() 
        : normalized.returnDate;
      delete normalized.returnDate;
    }
    if (normalized.checkoutCondition !== undefined) {
      normalized.checkout_condition = normalized.checkoutCondition;
      delete normalized.checkoutCondition;
    }
    if (normalized.returnCondition !== undefined) {
      normalized.return_condition = normalized.returnCondition;
      delete normalized.returnCondition;
    }
    if (normalized.conditionOnReturn !== undefined) {
      normalized.condition_on_return = normalized.conditionOnReturn;
      delete normalized.conditionOnReturn;
    }
    if (normalized.approvalRequired !== undefined) {
      normalized.approval_required = normalized.approvalRequired;
      delete normalized.approvalRequired;
    }
    if (normalized.requiresStoragePhoto !== undefined) {
      normalized.requires_storage_photo = normalized.requiresStoragePhoto;
      delete normalized.requiresStoragePhoto;
    }
    if (normalized.storagePhotoUploaded !== undefined) {
      normalized.storage_photo_uploaded = normalized.storagePhotoUploaded;
      delete normalized.storagePhotoUploaded;
    }
    if (normalized.isOverdue !== undefined) {
      normalized.is_overdue = normalized.isOverdue;
      delete normalized.isOverdue;
    }
    if (normalized.checkedOutBy !== undefined) {
      normalized.checked_out_by = normalized.checkedOutBy;
      delete normalized.checkedOutBy;
    }
    if (normalized.returnedBy !== undefined) {
      normalized.returned_by = normalized.returnedBy;
      delete normalized.returnedBy;
    }
    if (normalized.approvedBy !== undefined) {
      normalized.approved_by = normalized.approvedBy;
      delete normalized.approvedBy;
    }
    if (normalized.rejectedBy !== undefined) {
      normalized.rejected_by = normalized.rejectedBy;
      delete normalized.rejectedBy;
    }
    if (normalized.scannedViaQR !== undefined) {
      normalized.scanned_via_qr = normalized.scannedViaQR;
      delete normalized.scannedViaQR;
    }
    if (normalized.qrScanData !== undefined) {
      normalized.qr_scan_data = normalized.qrScanData;
      delete normalized.qrScanData;
    }
    if (normalized.returnNotes !== undefined) {
      normalized.return_notes = normalized.returnNotes;
      delete normalized.returnNotes;
    }
    if (normalized.penaltyAmount !== undefined) {
      normalized.penalty_amount = normalized.penaltyAmount;
      delete normalized.penaltyAmount;
    }
    if (normalized.overdueNotificationSent !== undefined) {
      normalized.overdue_notification_sent = normalized.overdueNotificationSent;
      delete normalized.overdueNotificationSent;
    }
    if (normalized.remindersSent !== undefined) {
      normalized.reminders_sent = normalized.remindersSent;
      delete normalized.remindersSent;
    }
    if (normalized.lastReminderDate !== undefined) {
      normalized.last_reminder_date = normalized.lastReminderDate instanceof Date 
        ? normalized.lastReminderDate.toISOString() 
        : normalized.lastReminderDate;
      delete normalized.lastReminderDate;
    }
    if (normalized.rejectionReason !== undefined) {
      normalized.rejection_reason = normalized.rejectionReason;
      delete normalized.rejectionReason;
    }
    if (normalized.approvedDate !== undefined) {
      normalized.approved_date = normalized.approvedDate instanceof Date 
        ? normalized.approvedDate.toISOString() 
        : normalized.approvedDate;
      delete normalized.approvedDate;
    }
    if (normalized.rejectedDate !== undefined) {
      normalized.rejected_date = normalized.rejectedDate instanceof Date 
        ? normalized.rejectedDate.toISOString() 
        : normalized.rejectedDate;
      delete normalized.rejectedDate;
    }
    
    return normalized;
  }

  async createTransaction(transactionData) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Normalize all fields to snake_case
    const normalized = this.normalizeTransactionForInsert(transactionData);
    
    const newTransaction = {
      id: this.generateId(),
      ...normalized,
      user_id: normalized.user_id || transactionData.user || transactionData.user_id,
      item_id: normalized.item_id || transactionData.item || transactionData.item_id,
      transaction_number: normalized.transaction_number || transactionData.transactionNumber || `TXN-${year}${month}${day}-${random}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(newTransaction)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      console.error('Transaction data:', JSON.stringify(newTransaction, null, 2));
      throw error;
    }
    
    // Transform back to camelCase for response
    if (data) {
      return this.normalizeTransaction(data);
    }
    
    return data;
  }

  // Helper to convert transaction snake_case to camelCase
  normalizeTransaction(transaction) {
    if (!transaction) return null;
    
    return {
      ...transaction,
      _id: transaction.id,
      id: transaction.id,
      user: transaction.users || transaction.user_id || transaction.user,
      item: transaction.items || transaction.item_id || transaction.item,
      transactionNumber: transaction.transaction_number || transaction.transactionNumber,
      checkoutDate: transaction.checkout_date || transaction.checkoutDate,
      expectedReturnDate: transaction.expected_return_date || transaction.expectedReturnDate,
      actualReturnDate: transaction.actual_return_date || transaction.actualReturnDate,
      returnDate: transaction.return_date || transaction.returnDate,
      checkoutCondition: transaction.checkout_condition || transaction.checkoutCondition,
      returnCondition: transaction.return_condition || transaction.returnCondition,
      conditionOnReturn: transaction.condition_on_return || transaction.conditionOnReturn,
      approvalRequired: transaction.approval_required ?? transaction.approvalRequired ?? false,
      requiresStoragePhoto: transaction.requires_storage_photo ?? transaction.requiresStoragePhoto ?? false,
      storagePhotoUploaded: transaction.storage_photo_uploaded ?? transaction.storagePhotoUploaded ?? false,
      isOverdue: transaction.is_overdue ?? transaction.isOverdue ?? false,
      checkedOutBy: transaction.checked_out_by || transaction.checkedOutBy,
      returnedBy: transaction.returned_by || transaction.returnedBy,
      approvedBy: transaction.approved_by || transaction.approvedBy,
      rejectedBy: transaction.rejected_by || transaction.rejectedBy,
      scannedViaQR: transaction.scanned_via_qr ?? transaction.scannedViaQR ?? false,
      qrScanData: transaction.qr_scan_data || transaction.qrScanData,
      returnNotes: transaction.return_notes || transaction.returnNotes,
      penaltyAmount: transaction.penalty_amount || transaction.penaltyAmount,
      overdueNotificationSent: transaction.overdue_notification_sent ?? transaction.overdueNotificationSent ?? false,
      remindersSent: transaction.reminders_sent || transaction.remindersSent || 0,
      lastReminderDate: transaction.last_reminder_date || transaction.lastReminderDate,
      rejectionReason: transaction.rejection_reason || transaction.rejectionReason,
      approvedDate: transaction.approved_date || transaction.approvedDate,
      rejectedDate: transaction.rejected_date || transaction.rejectedDate,
      createdAt: transaction.created_at || transaction.createdAt,
      updatedAt: transaction.updated_at || transaction.updatedAt
    };
  }

  async updateTransaction(id, updates) {
    // Normalize updates to snake_case
    const normalized = this.normalizeTransactionForInsert(updates);
    
    const updateData = {
      ...normalized,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        items:item_id (*),
        users:user_id (*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      console.error('Update data:', JSON.stringify(updateData, null, 2));
      return null;
    }
    
    // Transform back to camelCase
    return this.normalizeTransaction(data);
  }

  async findAllTransactions(query = {}) {
    let queryBuilder = this.supabase
      .from('transactions')
      .select(`
        *,
        items:item_id (*),
        users:user_id (*)
      `);
    
    if (query.user) {
      queryBuilder = queryBuilder.eq('user_id', query.user);
    }
    if (query.item) {
      queryBuilder = queryBuilder.eq('item_id', query.item);
    }
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }
    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error finding transactions:', error);
      return [];
    }
    
    // Transform to match expected format
    return (data || []).map(t => this.normalizeTransaction(t));
  }

  // Notification methods
  async createNotification(notificationData) {
    const newNotification = {
      id: this.generateId(),
      ...notificationData,
      recipient_id: notificationData.recipient || notificationData.recipient_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    delete newNotification.recipient;
    
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    if (data) {
      data.recipient = data.recipient_id;
      data._id = data.id;
    }
    
    return data;
  }

  async findNotificationsByUser(userId) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error finding notifications:', error);
      return [];
    }
    
    return (data || []).map(n => ({
      ...n,
      recipient: n.recipient_id,
      _id: n.id
    }));
  }

  async updateNotification(id, updates) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating notification:', error);
      return null;
    }
    
    if (data) {
      data.recipient = data.recipient_id;
      data._id = data.id;
    }
    
    return data;
  }

  // Guest Request methods
  async createGuestRequest(requestData) {
    const newRequest = {
      id: this.generateId(),
      status: 'pending',
      ...requestData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await this.supabase
      .from('guest_requests')
      .insert(newRequest)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating guest request:', error);
      throw error;
    }
    
    return data;
  }

  async findGuestRequestsByTeam(team) {
    let queryBuilder = this.supabase.from('guest_requests').select('*');
    
    if (team !== '') {
      queryBuilder = queryBuilder.eq('team', team);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error finding guest requests:', error);
      return [];
    }
    
    return data || [];
  }

  async updateGuestRequest(id, updates) {
    const { data, error } = await this.supabase
      .from('guest_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating guest request:', error);
      return null;
    }
    
    return data;
  }
}

module.exports = SupabaseStorageService;


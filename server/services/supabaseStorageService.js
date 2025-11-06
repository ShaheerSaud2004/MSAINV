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
    
    return data || null;
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
      
      return data || null;
    } catch (error) {
      console.error('Exception in findUserByEmail:', error);
      throw error;
    }
  }

  async createUser(userData) {
    const newUser = {
      id: this.generateId(),
      ...userData,
      email: userData.email?.toLowerCase(),
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
      throw error;
    }
    
    return data;
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
    
    return data || [];
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
    
    if (data) {
      // Transform to match expected format
      data.item = data.items;
      data.user = data.users;
      data._id = data.id;
    }
    
    return data || null;
  }

  async createTransaction(transactionData) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const newTransaction = {
      id: this.generateId(),
      ...transactionData,
      user_id: transactionData.user || transactionData.user_id,
      item_id: transactionData.item || transactionData.item_id,
      transaction_number: transactionData.transactionNumber || `TXN-${year}${month}${day}-${random}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Remove camelCase fields
    delete newTransaction.user;
    delete newTransaction.item;
    delete newTransaction.transactionNumber;
    
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(newTransaction)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    
    // Transform back
    if (data) {
      data.user = data.user_id;
      data.item = data.item_id;
      data.transactionNumber = data.transaction_number;
      data._id = data.id;
    }
    
    return data;
  }

  async updateTransaction(id, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Convert camelCase to snake_case
    if (updateData.user) {
      updateData.user_id = updateData.user;
      delete updateData.user;
    }
    if (updateData.item) {
      updateData.item_id = updateData.item;
      delete updateData.item;
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
    
    // Transform back
    if (data) {
      data.user = data.user_id;
      data.item = data.item_id;
      data.transactionNumber = data.transaction_number;
      data._id = data.id;
    }
    
    return data;
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
    return (data || []).map(t => {
      const transformed = {
        ...t,
        item: t.items || null,
        user: t.users || null,
        transactionNumber: t.transaction_number,
        _id: t.id,
        // Ensure camelCase fields for compatibility
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        checkoutDate: t.checkout_date,
        expectedReturnDate: t.expected_return_date,
        actualReturnDate: t.actual_return_date,
        returnDate: t.return_date,
        isOverdue: t.is_overdue,
        requiresStoragePhoto: t.requires_storage_photo,
        storagePhotoUploaded: t.storage_photo_uploaded,
        approvalRequired: t.approval_required
      };
      // Remove null items/users to avoid issues
      if (!transformed.item) delete transformed.item;
      if (!transformed.user) delete transformed.user;
      return transformed;
    });
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


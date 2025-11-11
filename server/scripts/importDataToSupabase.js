/**
 * Import Data to Supabase
 * 
 * This script imports existing data from JSON files or MongoDB into Supabase
 * 
 * Usage: node server/scripts/importDataToSupabase.js
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const { v4: uuidv4 } = require('uuid');

// Helper to check if a string is a valid UUID
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper to convert camelCase to snake_case
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Convert object keys from camelCase to snake_case
function convertToSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertToSnakeCase);
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    
    // Handle special cases
    if (key === '_id' || key === 'id') {
      // Only use value if it's a valid UUID, otherwise generate new one
      if (value && isValidUUID(value)) {
        converted.id = value;
      } else if (value) {
        // Invalid UUID - generate new one (will be set by Supabase if not provided)
        converted.id = uuidv4();
      }
      // If no value, let Supabase generate it
    } else if (key === 'qrCode') {
      converted.qr_code = value;
    } else if (key === 'subCategory') {
      converted.sub_category = value;
    } else if (key === 'totalQuantity') {
      converted.total_quantity = value;
    } else if (key === 'availableQuantity') {
      converted.available_quantity = value;
    } else if (key === 'isCheckoutable') {
      converted.is_checkoutable = value;
    } else if (key === 'requiresApproval') {
      converted.requires_approval = value;
    } else if (key === 'transactionNumber') {
      converted.transaction_number = value;
    } else if (key === 'user' || key === 'userId') {
      const userId = value?._id || value?.id || value;
      converted.user_id = (userId && isValidUUID(userId)) ? userId : null;
    } else if (key === 'item' || key === 'itemId') {
      const itemId = value?._id || value?.id || value;
      converted.item_id = (itemId && isValidUUID(itemId)) ? itemId : null;
    } else if (key === 'recipient' || key === 'recipientId') {
      const recipientId = value?._id || value?.id || value;
      converted.recipient_id = (recipientId && isValidUUID(recipientId)) ? recipientId : null;
    } else if (key === 'relatedTransaction') {
      const txId = value?._id || value?.id || value;
      converted.related_transaction = (txId && isValidUUID(txId)) ? txId : null;
    } else if (key === 'relatedItem') {
      const itemId = value?._id || value?.id || value;
      converted.related_item = (itemId && isValidUUID(itemId)) ? itemId : null;
    } else if (key === 'expectedReturnDate') {
      converted.expected_return_date = value;
    } else if (key === 'actualReturnDate') {
      converted.actual_return_date = value;
    } else if (key === 'checkoutDate') {
      converted.checkout_date = value;
    } else if (key === 'returnDate') {
      converted.return_date = value;
    } else if (key === 'conditionOnReturn') {
      converted.condition_on_return = value;
    } else if (key === 'penaltyAmount') {
      converted.penalty_amount = value;
    } else if (key === 'isOverdue') {
      converted.is_overdue = value;
    } else if (key === 'requiresStoragePhoto') {
      converted.requires_storage_photo = value;
    } else if (key === 'storagePhotoUploaded') {
      converted.storage_photo_uploaded = value;
    } else if (key === 'isRead') {
      converted.is_read = value;
    } else if (key === 'actionUrl') {
      converted.action_url = value;
    } else if (key === 'actionText') {
      converted.action_text = value;
    } else if (key === 'createdAt') {
      converted.created_at = value;
    } else if (key === 'updatedAt') {
      converted.updated_at = value;
    } else if (key === 'requesterName') {
      converted.requester_name = value;
    } else if (key === 'requesterEmail') {
      converted.requester_email = value;
    } else if (key === 'requesterPhone') {
      converted.requester_phone = value;
    } else if (key === 'itemName') {
      converted.item_name = value;
    } else if (key === 'itemDescription') {
      converted.item_description = value;
    } else if (key === 'expectedDate') {
      converted.expected_date = value;
    } else if (key === 'lastLogin') {
      converted.last_login = value;
    } else if (key === 'createdBy') {
      const createdById = value?._id || value?.id || value;
      converted.created_by = (createdById && isValidUUID(createdById)) ? createdById : null;
    } else if (key === 'lastModifiedBy') {
      const lastModifiedById = value?._id || value?.id || value;
      converted.last_modified_by = (lastModifiedById && isValidUUID(lastModifiedById)) ? lastModifiedById : null;
    } else if (key === 'metadata') {
      converted.metadata = value;
    } else if (key === 'readAt' || key === 'read_at') {
      converted.read_at = value;
    } else if (key === 'photos') {
      converted.photos = value;
    } else if (key === 'approvedBy') {
      const approvedById = value?._id || value?.id || value;
      converted.approved_by = (approvedById && isValidUUID(approvedById)) ? approvedById : null;
    } else if (key === 'rejectedBy') {
      const rejectedById = value?._id || value?.id || value;
      converted.rejected_by = (rejectedById && isValidUUID(rejectedById)) ? rejectedById : null;
    } else if (key === 'checkedOutBy') {
      const checkedOutById = value?._id || value?.id || value;
      converted.checked_out_by = (checkedOutById && isValidUUID(checkedOutById)) ? checkedOutById : null;
    } else if (key === 'returnedBy') {
      const returnedById = value?._id || value?.id || value;
      converted.returned_by = (returnedById && isValidUUID(returnedById)) ? returnedById : null;
    } else {
      converted[snakeKey] = Array.isArray(value) || typeof value === 'object' 
        ? convertToSnakeCase(value) 
        : value;
    }
  }
  return converted;
}

async function importUsers() {
  console.log('📥 Importing users...');
  
  try {
    const filePath = path.join(__dirname, '../storage/data/users.json');
    const data = await fs.readFile(filePath, 'utf8');
    const users = JSON.parse(data);
    
    if (!users || users.length === 0) {
      console.log('   No users to import');
      return;
    }
    
    console.log(`   Found ${users.length} users`);
    
    // Check existing users
    const { data: existingUsers } = await supabase.from('users').select('email');
    const existingEmails = new Set((existingUsers || []).map(u => u.email));
    
    const usersToImport = users.filter(u => !existingEmails.has(u.email?.toLowerCase()));
    
    if (usersToImport.length === 0) {
      console.log('   All users already exist');
      return;
    }
    
    console.log(`   Importing ${usersToImport.length} new users...`);
    
    // Import in batches
    const batchSize = 10;
    for (let i = 0; i < usersToImport.length; i += batchSize) {
      const batch = usersToImport.slice(i, i + batchSize);
      const convertedBatch = batch.map(user => {
        const converted = convertToSnakeCase(user);
        // Ensure password is hashed (if not already)
        if (converted.password && !converted.password.startsWith('$2')) {
          // Password is not hashed, skip this user
          console.warn(`   Warning: User ${converted.email} has unhashed password, skipping...`);
          return null;
        }
        // If ID is invalid UUID, remove it to let Supabase generate
        if (converted.id && !isValidUUID(converted.id)) {
          delete converted.id;
        }
        return converted;
      }).filter(Boolean);
      
      if (convertedBatch.length > 0) {
        const { error } = await supabase.from('users').insert(convertedBatch);
        if (error) {
          console.error(`   Error importing batch:`, error);
        } else {
          console.log(`   Imported ${convertedBatch.length} users (${i + 1}-${Math.min(i + batchSize, usersToImport.length)})`);
        }
      }
    }
    
    console.log('✅ Users imported');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   No users.json file found (this is OK if starting fresh)');
    } else {
      console.error('   Error importing users:', error.message);
    }
  }
}

async function importItems() {
  console.log('📥 Importing items...');
  
  try {
    const filePath = path.join(__dirname, '../storage/data/items.json');
    const data = await fs.readFile(filePath, 'utf8');
    const items = JSON.parse(data);
    
    if (!items || items.length === 0) {
      console.log('   No items to import');
      return;
    }
    
    console.log(`   Found ${items.length} items`);
    
    // Check existing items
    const { data: existingItems } = await supabase.from('items').select('id');
    const existingIds = new Set((existingItems || []).map(i => i.id));
    
    const itemsToImport = items.filter(i => {
      const itemId = i._id || i.id;
      return !existingIds.has(itemId);
    });
    
    if (itemsToImport.length === 0) {
      console.log('   All items already exist');
      return;
    }
    
    console.log(`   Importing ${itemsToImport.length} new items...`);
    
    // Import in batches
    const batchSize = 20;
    for (let i = 0; i < itemsToImport.length; i += batchSize) {
      const batch = itemsToImport.slice(i, i + batchSize);
      const convertedBatch = batch.map(item => {
        const converted = convertToSnakeCase(item);
        // If ID is invalid UUID, remove it to let Supabase generate
        if (converted.id && !isValidUUID(converted.id)) {
          delete converted.id;
        }
        // Remove fields that don't exist in schema
        delete converted.createdBy;
        delete converted.lastModifiedBy;
        return converted;
      });
      
      const { error } = await supabase.from('items').insert(convertedBatch);
      if (error) {
        console.error(`   Error importing batch:`, error);
      } else {
        console.log(`   Imported ${convertedBatch.length} items (${i + 1}-${Math.min(i + batchSize, itemsToImport.length)})`);
      }
    }
    
    console.log('✅ Items imported');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   No items.json file found (this is OK if starting fresh)');
    } else {
      console.error('   Error importing items:', error.message);
    }
  }
}

async function importTransactions() {
  console.log('📥 Importing transactions...');
  
  try {
    const filePath = path.join(__dirname, '../storage/data/transactions.json');
    const data = await fs.readFile(filePath, 'utf8');
    const transactions = JSON.parse(data);
    
    if (!transactions || transactions.length === 0) {
      console.log('   No transactions to import');
      return;
    }
    
    console.log(`   Found ${transactions.length} transactions`);
    
    // Get existing transaction numbers
    const { data: existingTransactions } = await supabase.from('transactions').select('transaction_number');
    const existingNumbers = new Set((existingTransactions || []).map(t => t.transaction_number));
    
    const transactionsToImport = transactions.filter(t => {
      const txNum = t.transactionNumber || t.transaction_number;
      return txNum && !existingNumbers.has(txNum);
    });
    
    if (transactionsToImport.length === 0) {
      console.log('   All transactions already exist');
      return;
    }
    
    console.log(`   Importing ${transactionsToImport.length} new transactions...`);
    
    // Get all existing item IDs to validate foreign keys
    const { data: existingItems } = await supabase.from('items').select('id');
    const existingItemIds = new Set((existingItems || []).map(i => i.id));
    
    // Import in batches
    const batchSize = 20;
    for (let i = 0; i < transactionsToImport.length; i += batchSize) {
      const batch = transactionsToImport.slice(i, i + batchSize);
      const convertedBatch = batch.map(t => {
        const converted = convertToSnakeCase(t);
        // If ID is invalid UUID, remove it to let Supabase generate
        if (converted.id && !isValidUUID(converted.id)) {
          delete converted.id;
        }
        // If item_id doesn't exist in items table, set to null
        if (converted.item_id && !existingItemIds.has(converted.item_id)) {
          console.warn(`   Warning: Transaction ${converted.transaction_number} references non-existent item ${converted.item_id}, setting to null`);
          converted.item_id = null;
        }
        // If user_id doesn't exist, set to null
        if (converted.user_id && !isValidUUID(converted.user_id)) {
          converted.user_id = null;
        }
        return converted;
      });
      
      const { error } = await supabase.from('transactions').insert(convertedBatch);
      if (error) {
        console.error(`   Error importing batch:`, error);
        // Try to import individually to see which ones fail
        for (const tx of convertedBatch) {
          const { error: singleError } = await supabase.from('transactions').insert([tx]);
          if (singleError) {
            console.error(`   Failed to import transaction ${tx.transaction_number}:`, singleError.message);
          }
        }
      } else {
        console.log(`   Imported ${convertedBatch.length} transactions (${i + 1}-${Math.min(i + batchSize, transactionsToImport.length)})`);
      }
    }
    
    console.log('✅ Transactions imported');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   No transactions.json file found (this is OK if starting fresh)');
    } else {
      console.error('   Error importing transactions:', error.message);
    }
  }
}

async function importNotifications() {
  console.log('📥 Importing notifications...');
  
  try {
    const filePath = path.join(__dirname, '../storage/data/notifications.json');
    const data = await fs.readFile(filePath, 'utf8');
    const notifications = JSON.parse(data);
    
    if (!notifications || notifications.length === 0) {
      console.log('   No notifications to import');
      return;
    }
    
    console.log(`   Found ${notifications.length} notifications`);
    
    const convertedNotifications = notifications.map(n => {
      const converted = convertToSnakeCase(n);
      // If ID is invalid UUID, remove it to let Supabase generate
      if (converted.id && !isValidUUID(converted.id)) {
        delete converted.id;
      }
      return converted;
    });
    
    const { error } = await supabase.from('notifications').insert(convertedNotifications);
    if (error) {
      console.error('   Error importing notifications:', error);
    } else {
      console.log('✅ Notifications imported');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   No notifications.json file found (this is OK if starting fresh)');
    } else {
      console.error('   Error importing notifications:', error.message);
    }
  }
}

async function importGuestRequests() {
  console.log('📥 Importing guest requests...');
  
  try {
    const filePath = path.join(__dirname, '../storage/data/guestRequests.json');
    const data = await fs.readFile(filePath, 'utf8');
    const guestRequests = JSON.parse(data);
    
    if (!guestRequests || guestRequests.length === 0) {
      console.log('   No guest requests to import');
      return;
    }
    
    console.log(`   Found ${guestRequests.length} guest requests`);
    
    const convertedRequests = guestRequests.map(r => {
      const converted = convertToSnakeCase(r);
      // If ID is invalid UUID, remove it to let Supabase generate
      if (converted.id && !isValidUUID(converted.id)) {
        delete converted.id;
      }
      return converted;
    });
    
    const { error } = await supabase.from('guest_requests').insert(convertedRequests);
    if (error) {
      console.error('   Error importing guest requests:', error);
    } else {
      console.log('✅ Guest requests imported');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   No guestRequests.json file found (this is OK if starting fresh)');
    } else {
      console.error('   Error importing guest requests:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting data import to Supabase...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('─────────────────────────────────\n');
  
  // Check connection
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error && (error.message?.includes('relation') || error.message?.includes('does not exist'))) {
    console.error('❌ ERROR: Tables do not exist!');
    console.error('Please run the SQL migration first:');
    console.error('1. Go to Supabase Dashboard → SQL Editor');
    console.error('2. Run the SQL from: server/scripts/supabase-migration.sql');
    process.exit(1);
  }
  
  if (error) {
    console.error('❌ Error connecting to Supabase:', error);
    process.exit(1);
  }
  
  try {
    await importUsers();
    await importItems();
    await importTransactions();
    await importNotifications();
    await importGuestRequests();
    
    console.log('\n✅ Import complete!\n');
    console.log('You can now login at: https://msainv-stks.onrender.com/login');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();


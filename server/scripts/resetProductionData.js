const fs = require('fs').promises;
const path = require('path');

/**
 * Reset production data - clears transactions, notifications, and guest requests
 * while keeping users, items, and core system data
 */
async function resetProductionData() {
  try {
    console.log('🔄 Starting production data reset...\n');
    
    const storageMode = process.env.STORAGE_MODE || 'json';
    
    console.log(`📦 Storage mode: ${storageMode}\n`);

    // Clear transactions
    console.log('🗑️  Clearing transactions...');
    if (storageMode === 'json') {
      const transactionsPath = path.join(__dirname, '../storage/data/transactions.json');
      await fs.writeFile(transactionsPath, JSON.stringify([], null, 2));
      console.log('   ✓ Transactions cleared (JSON mode)');
    } else {
      console.log('   ⚠️  For Supabase/MongoDB, run: DELETE FROM transactions; in SQL editor');
    }

    // Clear notifications
    console.log('\n🗑️  Clearing notifications...');
    if (storageMode === 'json') {
      const notificationsPath = path.join(__dirname, '../storage/data/notifications.json');
      await fs.writeFile(notificationsPath, JSON.stringify([], null, 2));
      console.log('   ✓ Notifications cleared (JSON mode)');
    } else {
      console.log('   ⚠️  For Supabase/MongoDB, run: DELETE FROM notifications; in SQL editor');
    }

    // Clear guest requests
    console.log('\n🗑️  Clearing guest requests...');
    if (storageMode === 'json') {
      const guestRequestsPath = path.join(__dirname, '../storage/data/guestRequests.json');
      await fs.writeFile(guestRequestsPath, JSON.stringify([], null, 2));
      console.log('   ✓ Guest requests cleared (JSON mode)');
    } else {
      console.log('   ⚠️  For Supabase/MongoDB, run: DELETE FROM guest_requests; in SQL editor');
    }

    // Verify items and users are intact (JSON mode only)
    if (storageMode === 'json') {
      console.log('\n✅ Verifying core data...');
      const itemsPath = path.join(__dirname, '../storage/data/items.json');
      const usersPath = path.join(__dirname, '../storage/data/users.json');
      
      const itemsData = await fs.readFile(itemsPath, 'utf8');
      const usersData = await fs.readFile(usersPath, 'utf8');
      
      const items = JSON.parse(itemsData);
      const users = JSON.parse(usersData);
      
      console.log(`   ✓ Items: ${items.length} (preserved)`);
      console.log(`   ✓ Users: ${users.length} (preserved)`);
    } else {
      console.log('\n✅ Core data preserved (verify manually in database)');
    }

    console.log('\n✨ Production data reset complete!');
    console.log('\n📋 Summary:');
    console.log('   • Transactions: CLEARED');
    console.log('   • Notifications: CLEARED');
    console.log('   • Guest Requests: CLEARED');
    console.log('   • Items: PRESERVED');
    console.log('   • Users: PRESERVED');
    
    if (storageMode !== 'json') {
      console.log('\n⚠️  NOTE: For Supabase/MongoDB, you need to manually clear:');
      console.log('   - transactions table');
      console.log('   - notifications table');
      console.log('   - guest_requests table');
      console.log('\n   Run these SQL commands in Supabase SQL Editor:');
      console.log('   DELETE FROM transactions;');
      console.log('   DELETE FROM notifications;');
      console.log('   DELETE FROM guest_requests;');
    }

  } catch (error) {
    console.error('❌ Error resetting production data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetProductionData();
}

module.exports = resetProductionData;


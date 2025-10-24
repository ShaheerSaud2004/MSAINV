require('dotenv').config();
const { getStorageService } = require('../services/storageService');

async function removeBorrowedAndOffsite() {
  try {
    console.log('🔍 Finding borrowed and off-site items...\n');
    
    const storageService = getStorageService();
    const allItems = await storageService.findAllItems({});
    
    let removedCount = 0;
    const removedItems = [];

    for (const item of allItems) {
      const shouldRemove = 
        // Borrowed items
        (item.notes && item.notes.includes('BORROWED')) ||
        (item.location?.building === 'UMR') ||
        // Off-site items
        (item.location?.building && item.location.building.includes("Rehan's house")) ||
        (item.location?.building && item.location.building.includes('TRAP')) ||
        (item.name === 'Large Fire Pits') ||
        (item.name === 'Toaster');

      if (shouldRemove) {
        try {
          await storageService.deleteItem(item._id || item.id);
          removedCount++;
          removedItems.push({
            name: item.name,
            location: item.location?.building || 'Unknown',
            reason: item.notes?.includes('BORROWED') ? 'BORROWED' : 'OFF-SITE'
          });
          console.log(`❌ Removed: ${item.name} (${item.location?.building || 'N/A'}) - ${item.notes || 'OFF-SITE'}`);
        } catch (error) {
          console.error(`Failed to remove ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✨ Cleanup complete!`);
    console.log(`❌ Removed ${removedCount} borrowed/off-site items`);
    console.log(`✅ Remaining: ${allItems.length - removedCount} items\n`);

    if (removedItems.length > 0) {
      console.log('📋 Removed items summary:');
      console.log('-------------------------');
      removedItems.forEach(item => {
        console.log(`  - ${item.name} (${item.location}) [${item.reason}]`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeBorrowedAndOffsite().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


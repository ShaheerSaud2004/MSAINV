require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getStorageService } = require('../services/storageService');

async function importCSV() {
  try {
    console.log('🚀 Starting CSV import from Storage - Sheet1.csv\n');
    
    const csvPath = path.join(__dirname, '../../Storage - Sheet1.csv');
    const items = [];
    
    // Read and parse CSV
    const stream = fs.createReadStream(csvPath).pipe(csv());
    
    for await (const row of stream) {
      // Skip the first row (Example row)
      if (row['Item Name'] === 'Example') {
        continue;
      }
      
      // Parse quantity - handle "box", "walmart bag", etc.
      let quantity = parseInt(row['Quantity']) || 1;
      if (isNaN(quantity)) {
        quantity = 1;
      }
      
      // Parse location - could be Box #, Location, or custom
      const location = {
        box: row['Box #'] || row['Location'] || ''
      };
      
      // Parse category - uppercase
      const category = (row['Category'] || 'MISC').toUpperCase().trim();
      
      // Parse condition
      let condition = 'good';
      if (row['Condition']) {
        const cond = row['Condition'].toLowerCase().trim();
        if (['new', 'good', 'fair', 'poor', 'damaged', 'needs_maintenance'].includes(cond)) {
          condition = cond;
        }
      }
      
      // Get notes/description
      const notes = row['Notes'] || '';
      
      items.push({
        name: row['Item Name'],
        totalQuantity: quantity,
        location,
        category,
        condition,
        notes,
        availableQuantity: quantity,
        unit: 'piece',
        status: 'active',
        isCheckoutable: true,
        requiresApproval: false,
        description: notes
      });
    }
    
    console.log(`📦 Parsed ${items.length} items from CSV\n`);
    
    // Clear all existing items first
    console.log('🗑️  Clearing existing items...');
    const storageService = getStorageService();
    const allItems = await storageService.findAllItems();
    for (const item of allItems) {
      await storageService.deleteItem(item._id || item.id);
    }
    console.log(`✅ Cleared ${allItems.length} existing items\n`);
    
    // Import new items
    let successCount = 0;
    let errorCount = 0;
    
    console.log('📥 Importing new items...\n');
    for (const itemData of items) {
      try {
        const fullItemData = {
          ...itemData,
          sku: `MSA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
        };
        
        await storageService.createItem(fullItemData);
        successCount++;
        console.log(`✅ Added: ${itemData.name} (${itemData.totalQuantity} units)`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to add ${itemData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Successfully imported: ${successCount} items`);
    console.log(`❌ Failed: ${errorCount} items`);
    
  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
}

// Run the import
importCSV().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


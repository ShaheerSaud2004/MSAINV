require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const { getStorageService } = require('../services/storageService');

// Map Excel condition values to our enum values
function mapCondition(condition) {
  if (!condition) return 'good';
  
  const cond = condition.toString().toLowerCase().trim();
  const validConditions = ['new', 'good', 'fair', 'poor', 'damaged', 'needs_maintenance'];
  
  if (validConditions.includes(cond)) {
    return cond;
  }
  
  // Default mappings
  if (cond.includes('good') || cond === '') return 'good';
  if (cond.includes('new')) return 'new';
  if (cond.includes('fair')) return 'fair';
  if (cond.includes('poor')) return 'poor';
  if (cond.includes('damaged')) return 'damaged';
  if (cond.includes('maintenance')) return 'needs_maintenance';
  
  return 'good'; // default
}

// Parse quantity - handle "box", "walmart bag", numbers, etc.
function parseQuantity(quantityStr) {
  if (!quantityStr) return 1;
  
  const str = quantityStr.toString().toLowerCase().trim();
  
  // Try to extract number from strings like "18 (Box)", "50 (2 Boxs)", "Multiple (Box)"
  const numberMatch = str.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }
  
  // If it's just a number
  const num = parseInt(str);
  if (!isNaN(num)) {
    return num;
  }
  
  // Default to 1 for non-numeric values like "box", "bag", "Multiple"
  return 1;
}

// Parse date from various formats
function parseDate(dateStr) {
  if (!dateStr || dateStr === '' || dateStr.toString().toLowerCase().includes('blank')) {
    return null;
  }
  
  // Try to parse as date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

// Parse location structure
function parseLocation(locationStr, boxNumber) {
  const location = {
    building: '',
    room: '',
    shelf: '',
    bin: ''
  };
  
  if (locationStr) {
    // If location contains "Rutgers storage", set it as building
    if (locationStr.toString().includes('Rutgers storage')) {
      location.building = 'Rutgers storage';
      location.room = locationStr.toString().replace('Rutgers storage', '').trim() || '';
    } else {
      location.building = locationStr.toString().trim();
    }
  }
  
  // Box number goes in bin
  if (boxNumber) {
    location.bin = boxNumber.toString().trim();
  }
  
  return location;
}

async function importExcel() {
  try {
    console.log('🚀 Starting Excel import from Storage.xlsx\n');
    
    const excelPath = path.join(__dirname, '../../Storage.xlsx');
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ File not found: ${excelPath}`);
      console.log('💡 Make sure Storage.xlsx is in the root directory');
      process.exit(1);
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    console.log(`📊 Found ${rows.length} rows in Excel file\n`);
    
    const items = [];
    
    // Process each row
    for (const row of rows) {
      // Skip empty rows or example rows
      if (!row['Item Name'] || row['Item Name'].toString().trim() === '' || 
          row['Item Name'].toString().toLowerCase() === 'example') {
        continue;
      }
      
      const itemName = row['Item Name'].toString().trim();
      const quantity = parseQuantity(row['Quantity']);
      const boxNumber = row['Box #'] ? row['Box #'].toString().trim() : '';
      const locationStr = row['Location'] ? row['Location'].toString().trim() : '';
      const category = (row['Category'] || 'MISC').toString().trim();
      const condition = mapCondition(row['Condition']);
      const dateAdded = parseDate(row['Date Added']);
      const lastChecked = parseDate(row['Last Checked']);
      const notes = row['Notes'] ? row['Notes'].toString().trim() : '';
      const valueStr = row['Value ($)'] ? row['Value ($)'].toString().trim() : '';
      const imageLink = row['Image Link'] ? row['Image Link'].toString().trim() : '';
      
      // Parse value
      let value = 0;
      if (valueStr) {
        const valueMatch = valueStr.match(/(\d+\.?\d*)/);
        if (valueMatch) {
          value = parseFloat(valueMatch[1]);
        }
      }
      
      // Build location object
      const location = parseLocation(locationStr, boxNumber);
      
      // Build images array
      const images = [];
      if (imageLink && imageLink !== '' && !imageLink.toLowerCase().includes('link after')) {
        images.push({
          url: imageLink,
          caption: ''
        });
      }
      
      // Build item object
      const itemData = {
        name: itemName,
        totalQuantity: quantity,
        availableQuantity: quantity,
        unit: 'piece',
        location: location,
        category: category.toUpperCase(),
        condition: condition,
        status: 'active',
        isCheckoutable: true,
        requiresApproval: false,
        notes: notes,
        description: notes,
        cost: {
          purchasePrice: 0,
          currentValue: value,
          currency: 'USD'
        },
        images: images,
        purchaseDate: dateAdded,
        maintenance: {
          lastMaintenanceDate: lastChecked,
          nextMaintenanceDate: null,
          maintenanceInterval: 0,
          notes: ''
        },
        sku: `MSA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
      };
      
      items.push(itemData);
    }
    
    console.log(`📦 Parsed ${items.length} items from Excel\n`);
    
    // Clear all existing items first
    console.log('🗑️  Clearing existing items...');
    const storageService = getStorageService();
    const allItems = await storageService.findAllItems();
    
    let clearedCount = 0;
    for (const item of allItems) {
      try {
        await storageService.deleteItem(item._id || item.id);
        clearedCount++;
      } catch (error) {
        console.error(`⚠️  Failed to delete item ${item.name}:`, error.message);
      }
    }
    console.log(`✅ Cleared ${clearedCount} existing items\n`);
    
    // Import new items
    let successCount = 0;
    let errorCount = 0;
    
    console.log('📥 Importing new items...\n');
    for (const itemData of items) {
      try {
        // Generate unique SKU for each item
        itemData.sku = `MSA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
        
        await storageService.createItem(itemData);
        successCount++;
        console.log(`✅ Added: ${itemData.name} (Qty: ${itemData.totalQuantity}, Box: ${itemData.location.bin || 'N/A'}, Location: ${itemData.location.building || 'N/A'})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to add ${itemData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Successfully imported: ${successCount} items`);
    console.log(`❌ Failed: ${errorCount} items`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Total items: ${successCount}`);
    console.log(`   - Total value: $${items.reduce((sum, item) => sum + (item.cost.currentValue || 0), 0).toFixed(2)}`);
    
    // Count by category
    const categoryCount = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    
    console.log(`\n📁 Categories:`);
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} items`);
    });
    
  } catch (error) {
    console.error('❌ Import error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
importExcel().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


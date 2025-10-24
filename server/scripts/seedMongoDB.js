require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the real models
const User = require('../models/User');
const Item = require('../models/Item');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Demo Users Data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@msa.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0001',
    team: 'MSA Leadership',
    permissions: {
      canViewItems: true,
      canCheckout: true,
      canReturn: true,
      canManageItems: true,
      canManageUsers: true,
      canApproveTransactions: true,
      canViewAnalytics: true,
      canManageSettings: true
    }
  },
  {
    name: 'Manager User',
    email: 'manager@msa.com',
    password: 'manager123',
    role: 'manager',
    phone: '555-0002',
    team: 'MSA Operations',
    permissions: {
      canViewItems: true,
      canCheckout: true,
      canReturn: true,
      canManageItems: true,
      canManageUsers: false,
      canApproveTransactions: true,
      canViewAnalytics: true,
      canManageSettings: false
    }
  },
  {
    name: 'Regular User',
    email: 'user@msa.com',
    password: 'user123',
    role: 'user',
    phone: '555-0003',
    team: 'MSA Members',
    permissions: {
      canViewItems: true,
      canCheckout: true,
      canReturn: true,
      canManageItems: false,
      canManageUsers: false,
      canApproveTransactions: false,
      canViewAnalytics: false,
      canManageSettings: false
    }
  }
];

// Inventory Items Data
const inventoryItems = [
  // Box 1
  { name: 'Small Bulb Light', quantity: 1, location: 'Box 1', category: 'Lighting' },
  { name: 'Extension Cords', quantity: 2, location: 'Box 1', category: 'Electronics' },
  { name: 'Box Cutter', quantity: 5, location: 'Box 1', category: 'Tools' },
  
  // Box 2
  { name: 'Stage Lights', quantity: 2, location: 'Box 2', category: 'Lighting' },
  { name: 'I A W Lights', quantity: 2, location: 'Box 2', category: 'Lighting', description: '2 sets' },
  { name: '2 4 Lights', quantity: 1, location: 'Box 2', category: 'Lighting' },
  { name: '2 0 2 4 Lights', quantity: 1, location: 'Box 2', category: 'Lighting' },
  
  // Box 3
  { name: 'Fairy Lights', quantity: 1, location: 'Box 3', category: 'Lighting' },
  { name: 'Mini Traffic Lights', quantity: 2, location: 'Box 3', category: 'Decoration' },
  { name: 'Artist Paint Brushes', quantity: 1, location: 'Box 3', category: 'Art Supplies' },
  { name: 'Crayola Markers', quantity: 5, location: 'Box 3', category: 'Art Supplies' },
  { name: 'Calligraphy Pens', quantity: 1, location: 'Box 3', category: 'Art Supplies' },
  { name: 'Expo Markers', quantity: 2, location: 'Box 3', category: 'Office Supplies' },
  { name: 'Rope', quantity: 1, location: 'Box 3', category: 'Miscellaneous' },
  { name: 'Paint Pens', quantity: 1, location: 'Box 3', category: 'Art Supplies' },
  { name: 'Small Bulb Lights', quantity: 1, location: 'Box 3', category: 'Lighting', description: '1 box' },
  { name: 'Stage Light Remote', quantity: 12, location: 'Box 3', category: 'Lighting' },
  
  // White Bag
  { name: 'Stage Lights (Large)', quantity: 8, location: 'White Bag', category: 'Lighting' },
  { name: 'Lamp Post Light', quantity: 1, location: 'White Bag', category: 'Lighting' },
  
  // Box 4
  { name: 'Felt Paper', quantity: 1, location: 'Box 4', category: 'Art Supplies', description: '1 box' },
  { name: 'Chopsticks', quantity: 1, location: 'Box 4', category: 'Utensils', description: '1 bag' },
  { name: 'Streamers', quantity: 1, location: 'Box 4', category: 'Decoration', description: '1 pack' },
  { name: 'Scissors', quantity: 1, location: 'Box 4', category: 'Tools' },
  { name: 'Acrylic Paint Tubes', quantity: 6, location: 'Box 4', category: 'Art Supplies' },
  { name: 'Staples', quantity: 1, location: 'Box 4', category: 'Office Supplies' },
  { name: 'Sharpies', quantity: 10, location: 'Box 4', category: 'Office Supplies' },
  
  // Box 5
  { name: 'Mosaic Glue', quantity: 1, location: 'Box 5', category: 'Art Supplies', description: '1 box' },
  { name: 'Mosaic Tiles', quantity: 2, location: 'Box 5', category: 'Art Supplies', description: '2 boxes' },
  { name: 'Glitter', quantity: 10, location: 'Box 5', category: 'Art Supplies' },
  { name: 'Stacking Cups', quantity: 12, location: 'Box 5', category: 'Games' },
  { name: 'Staple Gun', quantity: 1, location: 'Box 5', category: 'Tools' },
  { name: 'First Aid Kit', quantity: 1, location: 'Box 5', category: 'Safety' },
  { name: 'Tapes', quantity: 3, location: 'Box 5', category: 'Office Supplies' },
  { name: 'Thumb Tacks', quantity: 100, location: 'Box 5', category: 'Office Supplies', description: 'a lot' },
  { name: 'Exacto Knife', quantity: 1, location: 'Box 5', category: 'Tools' },
  { name: 'Rulers', quantity: 6, location: 'Box 5', category: 'Office Supplies' },
  
  // Box 6
  { name: 'Giant Uno', quantity: 1, location: 'Box 6', category: 'Games' },
  { name: 'Legos', quantity: 2000, location: 'Box 6', category: 'Games', unit: 'pieces' },
  { name: 'Shaykh Fil A Canopy', quantity: 1, location: 'Box 6', category: 'Equipment' },
  { name: 'Whiteboard', quantity: 3, location: 'Box 6', category: 'Office Supplies' },
  { name: 'Button Making Machine', quantity: 1, location: 'Box 6', category: 'Equipment' },
  { name: 'Canvas Panels', quantity: 2, location: 'Box 6', category: 'Art Supplies' },
  
  // Box 7
  { name: 'Game On Backdrop', quantity: 1, location: 'Box 7', category: 'Decoration' },
  { name: 'Arcade Backdrop', quantity: 1, location: 'Box 7', category: 'Decoration' },
  { name: '8.5x11 Acrylic Sign Holder', quantity: 1, location: 'Box 7', category: 'Display' },
  { name: 'Large Zip Ties', quantity: 2, location: 'Box 7', category: 'Tools' },
  { name: 'White Tablecloth', quantity: 1, location: 'Box 7', category: 'Table Supplies' },
  { name: 'Black Tablecloth', quantity: 9, location: 'Box 7', category: 'Table Supplies' },
  { name: 'Balloon Packs', quantity: 2, location: 'Box 7', category: 'Decoration' },
  { name: 'Lysol Spray', quantity: 2, location: 'Box 7', category: 'Cleaning' },
  { name: 'Blue Tablecloths', quantity: 1, location: 'Box 7', category: 'Table Supplies' },
  { name: 'Giant Glow Sticks', quantity: 2, location: 'Box 7', category: 'Decoration', description: '2 packs' },
  { name: 'Construction Paper', quantity: 1, location: 'Box 7', category: 'Art Supplies' },
  
  // Box 8
  { name: 'Power Bricks / Power Cords', quantity: 20, location: 'Box 8', category: 'Electronics', description: 'a lot' },
  
  // Own Storage
  { name: 'Giant Whiteboard/Chalk Board', quantity: 1, location: 'Own Storage', category: 'Office Supplies' },
  { name: 'Giant Cardstock (Polaroid holder)', quantity: 1, location: 'Own Storage', category: 'Display' },
  { name: 'Chalkboard Eisele', quantity: 1, location: 'Own Storage', category: 'Office Supplies' },
  { name: 'Wooden Table Signs', quantity: 5, location: 'Own Storage', category: 'Display' },
  { name: 'Giant Connect 4', quantity: 1, location: 'Own Storage', category: 'Games' },
  { name: 'Corn Hole Tosses', quantity: 2, location: 'Own Storage', category: 'Games' },
  { name: 'Buddy Bumper', quantity: 1, location: 'Own Storage', category: 'Games' },
  { name: 'Backdrop Stands', quantity: 2, location: 'Own Storage', category: 'Equipment' },
  { name: 'Backdrop Connector', quantity: 1, location: 'Own Storage', category: 'Equipment' },
  { name: 'Backdrop Base Plates', quantity: 2, location: 'Own Storage', category: 'Equipment' },
  { name: 'Projector Screen', quantity: 1, location: 'Own Storage', category: 'Electronics' },
  { name: 'Projector Stands', quantity: 2, location: 'Own Storage', category: 'Equipment' },
  { name: 'Cooler', quantity: 1, location: 'Own Storage', category: 'Equipment' },
  { name: 'Metal Bucket', quantity: 1, location: 'Own Storage', category: 'Equipment' },
  { name: 'PAC Man Whiteboard', quantity: 1, location: 'Own Storage', category: 'Display' },
  { name: 'Blue Chairs', quantity: 2, location: 'Own Storage', category: 'Furniture' },
  { name: 'Box of Spoons', quantity: 2, location: 'Own Storage', category: 'Utensils' },
  { name: 'Box of Knives', quantity: 1, location: 'Own Storage', category: 'Utensils' },
  { name: 'Box of Cups', quantity: 1, location: 'Own Storage', category: 'Utensils' },
  { name: 'Giant Jenga', quantity: 1, location: 'Own Storage', category: 'Games' },
  { name: 'Large Fire Pits', quantity: 2, location: 'Own Storage', category: 'Equipment' },
  
  // CZ Storage
  { name: 'Velvet Curtains', quantity: 2, location: 'CZ Storage', category: 'Decoration' },
  { name: 'Spray Bottle', quantity: 1, location: 'CZ Storage', category: 'Cleaning' },
  
  // Yellow Bag
  { name: 'Jug of Acrylic Paint', quantity: 1, location: 'Yellow Bag', category: 'Art Supplies' },
  { name: 'Acrylic Paper Holders 8.5x11', quantity: 5, location: 'Yellow Bag', category: 'Display' },
  { name: 'Markers Fine Point', quantity: 1, location: 'Yellow Bag', category: 'Art Supplies', description: '1 box' },
  
  // Activities Box
  { name: 'Connect 4 Yellow and Red', quantity: 1, location: 'Activities Box', category: 'Games' },
  { name: 'Dodgeballs', quantity: 7, location: 'Activities Box', category: 'Sports' },
  { name: 'Badminton Rackets', quantity: 7, location: 'Activities Box', category: 'Sports' },
  { name: 'Volleyball', quantity: 1, location: 'Activities Box', category: 'Sports' },
  { name: 'Football', quantity: 1, location: 'Activities Box', category: 'Sports' },
  { name: 'Bean Bags', quantity: 10, location: 'Activities Box', category: 'Games' },
  { name: 'Volleyball Net', quantity: 1, location: 'Activities Box', category: 'Sports' },
  
  // ZU Storage
  { name: 'Artificial Plants', quantity: 5, location: 'ZU Storage', category: 'Decoration' },
  { name: 'Ping Pong Paddles', quantity: 3, location: 'ZU Storage', category: 'Sports' },
  { name: 'Dixie Cup Lids', quantity: 1, location: 'ZU Storage', category: 'Utensils', description: 'roll' },
  
  // Red Cooler
  { name: 'Toaster', quantity: 1, location: 'Red Cooler', category: 'Kitchen' },
  
  // Kirkland Box
  { name: 'Serving Gloves', quantity: 150, location: 'Kirkland Box', category: 'Kitchen' },
  { name: 'Hot Glue Sticks/Guns', quantity: 5, location: 'Kirkland Box', category: 'Tools' },
  { name: 'Scotch Tape', quantity: 5, location: 'Kirkland Box', category: 'Office Supplies' },
  
  // GD Storage
  { name: 'Why Islam Packets', quantity: 300, location: 'GD Storage', category: 'Educational' },
  { name: 'Palestine Decoration', quantity: 10, location: 'GD Storage', category: 'Decoration' },
  
  // ICNA Bag
  { name: 'Photo Frames', quantity: 2, location: 'ICNA Bag', category: 'Display' },
  { name: 'Mini Trophies', quantity: 15, location: 'ICNA Bag', category: 'Awards' },
  { name: 'Rulers (Small)', quantity: 3, location: 'ICNA Bag', category: 'Office Supplies' },
  
  // White Laxmi Box
  { name: 'Pineapple Bowling Set', quantity: 1, location: 'White Laxmi Box', category: 'Games' },
  
  // OA Storage
  { name: 'Plastic Forks', quantity: 100, location: 'OA Storage', category: 'Utensils' },
  { name: 'Ring Toss Set', quantity: 1, location: 'OA Storage', category: 'Games' },
  { name: 'Gold Utensils', quantity: 50, location: 'OA Storage', category: 'Utensils' },
  { name: 'Gallon Ziploc Bags', quantity: 1, location: 'OA Storage', category: 'Storage', description: 'box' },
  { name: 'Egg and Spoon Game', quantity: 1, location: 'OA Storage', category: 'Games' },
  { name: 'Mic for Speakers', quantity: 1, location: 'OA Storage', category: 'Electronics' },
  { name: 'Brand New Whistle Set', quantity: 1, location: 'OA Storage', category: 'Sports' },
  
  // Eastpoint Box
  { name: 'Badminton Net Frame', quantity: 1, location: 'Eastpoint Box', category: 'Sports' },
  { name: 'Badge/Pin Making Set', quantity: 1, location: 'Eastpoint Box', category: 'Equipment' },
  { name: 'Double Sided Tape', quantity: 5, location: 'Eastpoint Box', category: 'Office Supplies' },
  
  // HD Box
  { name: 'Frisbee', quantity: 3, location: 'HD Box', category: 'Sports' },
  { name: 'Dodgeballs (Extra)', quantity: 5, location: 'HD Box', category: 'Sports' },
  { name: 'Mini Basketball', quantity: 1, location: 'HD Box', category: 'Sports' },
  { name: 'Connect 4 Disks', quantity: 1, location: 'HD Box', category: 'Games', description: 'replacement set' },
  { name: 'Black and White Poster Boards', quantity: 10, location: 'HD Box', category: 'Art Supplies' }
];

// Seed Database Function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Create Users
    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      // Don't hash password here - let the User model's pre-save hook handle it!
      const user = new User({
        ...userData
        // password will be hashed by the pre-save hook
      });
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    console.log(`\n✅ Created ${demoUsers.length} demo users\n`);
    
    // Create Items
    console.log('📦 Creating inventory items...');
    let itemCount = 0;
    for (const itemData of inventoryItems) {
      // Generate SKU from name (first 3 letters + number)
      const namePrefix = itemData.name.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase();
      const sku = `${namePrefix || 'ITM'}-${String(itemCount + 1).padStart(4, '0')}`;
      
      const item = new Item({
        name: itemData.name,
        description: itemData.description || '',
        category: itemData.category || 'General',
        sku: sku,
        totalQuantity: itemData.quantity,
        availableQuantity: itemData.quantity,
        unit: itemData.unit || 'unit',
        location: {
          building: itemData.location || 'Storage',
          room: '',
          shelf: '',
          bin: ''
        },
        condition: 'good',
        status: 'active',
        isCheckoutable: true,
        requiresApproval: false,
        cost: {
          purchasePrice: 0,
          currentValue: 0,
          currency: 'USD'
        },
        notes: itemData.notes || ''
      });
      
      // Save first to get the _id
      await item.save();
      
      // Now generate QR code and barcode based on _id
      const itemId = item._id.toString();
      item.qrCode = `QR-${itemId}`;
      item.barcode = `${sku.replace('-', '')}-${itemId.substring(itemId.length - 6)}`;
      
      // Save again with QR code and barcode
      await item.save();
      
      itemCount++;
      if (itemCount % 20 === 0) {
        console.log(`✅ Created ${itemCount} items...`);
      }
    }
    console.log(`\n✅ Created ${inventoryItems.length} inventory items\n`);
    
    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║              🎉 DATABASE SEEDED SUCCESSFULLY! 🎉          ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Summary:');
    console.log(`   • ${demoUsers.length} demo users created`);
    console.log(`   • ${inventoryItems.length} inventory items created\n`);
    
    console.log('🔐 Demo Login Credentials:');
    console.log('   ┌─────────────────────────────────────────────────────┐');
    console.log('   │ Admin:                                              │');
    console.log('   │   Email: admin@msa.com                              │');
    console.log('   │   Password: admin123                                │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ Manager:                                            │');
    console.log('   │   Email: manager@msa.com                            │');
    console.log('   │   Password: manager123                              │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ User:                                               │');
    console.log('   │   Email: user@msa.com                               │');
    console.log('   │   Password: user123                                 │');
    console.log('   └─────────────────────────────────────────────────────┘\n');
    
    console.log('✨ Your MongoDB Atlas database is now fully populated!');
    console.log('🚀 Your Railway app will now have all data available!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();


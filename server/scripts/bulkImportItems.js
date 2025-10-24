require('dotenv').config();
const { getStorageService } = require('../services/storageService');

const items = [
  { name: "Small bulb light thing", totalQuantity: 1, location: { box: "1" }, category: "LIGHTS" },
  { name: "Extension Cords", totalQuantity: 2, location: { box: "1" }, category: "CORDS" },
  { name: "Box Cutter", totalQuantity: 5, location: { box: "1" }, category: "TOOLS" },
  
  { name: "Stage Lights", totalQuantity: 2, location: { box: "2" }, category: "LIGHTS" },
  { name: "I A W Lights", totalQuantity: 2, location: { box: "2" }, category: "LIGHTS" },
  { name: "2 4 Lights", totalQuantity: 1, location: { box: "2" }, category: "LIGHTS" },
  { name: "2 0 2 4 Lights", totalQuantity: 1, location: { box: "2" }, category: "LIGHTS" },
  
  { name: "Fairy lights", totalQuantity: 1, location: { box: "3" }, category: "LIGHTS" },
  { name: "Mini traffic lights", totalQuantity: 2, location: { box: "3" }, category: "LIGHTS" },
  { name: "Artist paint brushes", totalQuantity: 1, location: { box: "3" }, category: "ART SUPPLIES" },
  { name: "Crayola Markers", totalQuantity: 5, location: { box: "3" }, category: "ART SUPPLIES" },
  { name: "Caligraphy pens", totalQuantity: 1, location: { box: "3" }, category: "ART SUPPLIES" },
  { name: "Expo markers", totalQuantity: 2, location: { box: "3" }, category: "ART SUPPLIES" },
  { name: "Rope", totalQuantity: 1, location: { box: "3" }, category: "SUPPLIES" },
  { name: "Paint pens", totalQuantity: 1, location: { box: "3" }, category: "ART SUPPLIES" },
  { name: "Small bulb lights", totalQuantity: 1, location: { box: "3" }, category: "LIGHTS" },
  { name: "Stage light remote", totalQuantity: 12, location: { box: "3" }, category: "LIGHTS" },
  
  { name: "Stage lights (8 units)", totalQuantity: 8, location: { building: "white bag" }, category: "LIGHTS" },
  { name: "Lamp post light", totalQuantity: 1, location: { building: "white bag" }, category: "LIGHTS" },
  
  { name: "Felt paper", totalQuantity: 1, location: { box: "4" }, category: "CRAFT SUPPLIES" },
  { name: "Chopsticks", totalQuantity: 1, location: { box: "4" }, category: "SUPPLIES" },
  { name: "Streamers", totalQuantity: 1, location: { box: "4" }, category: "DECORATIONS" },
  { name: "Scissors", totalQuantity: 1, location: { box: "4" }, category: "TOOLS" },
  { name: "Acrylic paints tubes", totalQuantity: 6, location: { box: "4" }, category: "ART SUPPLIES" },
  { name: "Staples", totalQuantity: 1, location: { box: "4" }, category: "SUPPLIES" },
  { name: "Sharpies", totalQuantity: 10, location: { box: "4" }, category: "ART SUPPLIES" },
  
  { name: "Mosaic glue", totalQuantity: 1, location: { box: "5" }, category: "CRAFT SUPPLIES" },
  { name: "Mosaic tiles", totalQuantity: 2, location: { box: "5" }, category: "CRAFT SUPPLIES" },
  { name: "Glitter", totalQuantity: 10, location: { box: "5" }, category: "CRAFT SUPPLIES" },
  { name: "Stacking cups", totalQuantity: 12, location: { box: "5" }, category: "ACTIVITIES" },
  { name: "Staple gun", totalQuantity: 1, location: { box: "5" }, category: "TOOLS" },
  { name: "First aid kit", totalQuantity: 1, location: { box: "5" }, category: "SAFETY" },
  { name: "Tapes", totalQuantity: 3, location: { box: "5" }, category: "SUPPLIES" },
  { name: "Thumb tacks", totalQuantity: 100, location: { box: "5" }, category: "SUPPLIES" },
  { name: "Exacto Knife", totalQuantity: 1, location: { box: "5" }, category: "TOOLS" },
  { name: "Rulers", totalQuantity: 6, location: { box: "5" }, category: "SUPPLIES" },
  
  { name: "Giant Uno", totalQuantity: 1, location: { box: "6" }, category: "ACTIVITIES" },
  { name: "Legos", totalQuantity: 2000, location: { box: "6" }, category: "ACTIVITIES" },
  { name: "Shaykh Fil A canopy", totalQuantity: 1, location: { box: "6" }, category: "OUTDOOR" },
  { name: "Whiteboard", totalQuantity: 3, location: { box: "6" }, category: "SUPPLIES" },
  { name: "Button making machine", totalQuantity: 1, location: { box: "6" }, category: "CRAFT SUPPLIES" },
  { name: "Canvas panels", totalQuantity: 2, location: { box: "6" }, category: "ART SUPPLIES" },
  
  { name: "Game On Backdrop", totalQuantity: 1, location: { box: "7" }, category: "DECORATIONS" },
  { name: "Arcade Backdrop", totalQuantity: 1, location: { box: "7" }, category: "DECORATIONS" },
  { name: "8.5x11 Acrylic Sign Holder", totalQuantity: 1, location: { box: "7" }, category: "SUPPLIES" },
  { name: "Large Zip Ties", totalQuantity: 2, location: { box: "7" }, category: "SUPPLIES" },
  { name: "White Tablecloth", totalQuantity: 1, location: { box: "7" }, category: "DECORATIONS" },
  { name: "Black Tablecloth", totalQuantity: 9, location: { box: "7" }, category: "DECORATIONS" },
  { name: "Balloon Packs", totalQuantity: 2, location: { box: "7" }, category: "DECORATIONS" },
  { name: "Lysol spray", totalQuantity: 2, location: { box: "7" }, category: "CLEANING" },
  { name: "Blue table cloths", totalQuantity: 1, location: { box: "7" }, category: "DECORATIONS" },
  { name: "Giant glow sticks", totalQuantity: 2, location: { box: "7" }, category: "ACTIVITIES" },
  { name: "Construction Paper", totalQuantity: 1, location: { box: "7" }, category: "CRAFT SUPPLIES" },
  
  { name: "Power Bricks / Power Cords", totalQuantity: 20, location: { box: "8" }, category: "CORDS" },
  
  { name: "Giant Whiteboard/Chalk Board", totalQuantity: 1, location: { building: "Own" }, category: "SUPPLIES" },
  { name: "Giant cardstock (Polaroid picture holder)", totalQuantity: 1, location: { building: "Own" }, category: "DECORATIONS" },
  { name: "Chalkboard eisele", totalQuantity: 1, location: { building: "Own" }, category: "SUPPLIES" },
  { name: "Wooden Table Signs", totalQuantity: 5, location: { building: "Own" }, category: "DECORATIONS" },
  { name: "Giant Connect 4", totalQuantity: 1, location: { building: "Own" }, category: "ACTIVITIES" },
  { name: "Corn Hole Tosses", totalQuantity: 2, location: { building: "Own" }, category: "ACTIVITIES" },
  { name: "Buddy Bumper", totalQuantity: 1, location: { building: "Own" }, category: "ACTIVITIES" },
  { name: "Velvet Curtains", totalQuantity: 2, location: { building: "CZ" }, category: "DECORATIONS" },
  { name: "Backdrop Stands", totalQuantity: 2, location: { building: "Own" }, category: "EQUIPMENT" },
  { name: "Backdrop Connector", totalQuantity: 1, location: { building: "Own" }, category: "EQUIPMENT" },
  { name: "Backdrop Base Plates", totalQuantity: 2, location: { building: "Own" }, category: "EQUIPMENT" },
  { name: "Projector Screen", totalQuantity: 1, location: { building: "CZ" }, category: "EQUIPMENT" },
  { name: "Projector Stands", totalQuantity: 2, location: { building: "Own" }, category: "EQUIPMENT" },
  { name: "Cooler", totalQuantity: 1, location: { building: "Own" }, category: "EQUIPMENT" },
  { name: "Toaster", totalQuantity: 1, location: { building: "red cooler - TRAP" }, category: "KITCHEN" },
  { name: "Metal bucket", totalQuantity: 1, location: { building: "Own" }, category: "SUPPLIES" },
  { name: "PAC man white board", totalQuantity: 1, location: { building: "Own" }, category: "DECORATIONS" },
  { name: "Blue Chairs", totalQuantity: 2, location: { building: "Own" }, category: "FURNITURE" },
  { name: "Box of Spoons", totalQuantity: 2, location: { building: "Own" }, category: "KITCHEN" },
  { name: "Box of Knives", totalQuantity: 1, location: { building: "Own" }, category: "KITCHEN" },
  { name: "Box of Cups", totalQuantity: 1, location: { building: "Own" }, category: "KITCHEN" },
  { name: "Giant Jenga", totalQuantity: 1, location: { building: "Own" }, category: "ACTIVITIES" },
  { name: "Large Fire Pits", totalQuantity: 2, location: { building: "Own - At Rehan's house" }, category: "OUTDOOR" },
  
  { name: "Jug of acrylic paint", totalQuantity: 1, location: { building: "Yellow bag" }, category: "ART SUPPLIES" },
  { name: "Acrylic paper holders 8.5x11", totalQuantity: 5, location: { building: "Yellow bag" }, category: "SUPPLIES" },
  { name: "Markers fine point", totalQuantity: 1, location: { building: "Yellow bag" }, category: "ART SUPPLIES" },
  
  { name: "Connect 4 Yellow and Red", totalQuantity: 1, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Dodgeballs", totalQuantity: 7, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Badminton Rackets", totalQuantity: 7, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Volleyball", totalQuantity: 1, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Football", totalQuantity: 1, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Bean bags", totalQuantity: 10, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  { name: "Volleyball Net", totalQuantity: 1, location: { building: "Activities Box" }, category: "ACTIVITIES" },
  
  { name: "Buzzer", totalQuantity: 2, location: { building: "UMR" }, category: "EQUIPMENT", notes: "BORROWED" },
  { name: "Red vase", totalQuantity: 1, location: { building: "UMR" }, category: "DECORATIONS", notes: "BORROWED" },
  { name: "Wall plug to cigarette lighter adapter", totalQuantity: 1, location: { building: "UMR" }, category: "EQUIPMENT", notes: "BORROWED" },
  { name: "Large plastic bags", totalQuantity: 1, location: { building: "UMR" }, category: "SUPPLIES", notes: "BORROWED" },
  
  { name: "Artificial plants", totalQuantity: 5, location: { building: "ZU" }, category: "DECORATIONS" },
  { name: "Ping pong paddles", totalQuantity: 3, location: { building: "ZU" }, category: "ACTIVITIES" },
  { name: "Dixie cup lids", totalQuantity: 100, location: { building: "ZU" }, category: "KITCHEN" },
  { name: "Spray bottle", totalQuantity: 1, location: { building: "CZ" }, category: "CLEANING" },
  { name: "Serving gloves", totalQuantity: 150, location: { building: "Kirkland box" }, category: "KITCHEN" },
  { name: "Why Islam packets", totalQuantity: 300, location: { building: "GD" }, category: "DAWAH" },
  { name: "Palestine decoration", totalQuantity: 5, location: { building: "GD" }, category: "DECORATIONS" },
  { name: "Photo frame", totalQuantity: 2, location: { building: "ICNA bag" }, category: "DECORATIONS" },
  { name: "Trophies mini", totalQuantity: 15, location: { building: "ICNA bag" }, category: "AWARDS" },
  { name: "Rulers (ICNA)", totalQuantity: 3, location: { building: "ICNA bag" }, category: "SUPPLIES" },
  { name: "Hot glue sticks/guns", totalQuantity: 5, location: { building: "Kirkland box" }, category: "CRAFT SUPPLIES" },
  { name: "Scotch tape", totalQuantity: 10, location: { building: "Kirkland box" }, category: "SUPPLIES" },
  { name: "Pineapple bowling", totalQuantity: 1, location: { building: "White Laxmi box" }, category: "ACTIVITIES" },
  
  { name: "Plastic forks", totalQuantity: 200, location: { building: "OA" }, category: "KITCHEN" },
  { name: "Ring toss set", totalQuantity: 1, location: { building: "OA" }, category: "ACTIVITIES" },
  { name: "Gold utensils", totalQuantity: 50, location: { building: "OA" }, category: "KITCHEN" },
  { name: "Gallon ziploc bag", totalQuantity: 50, location: { building: "OA" }, category: "SUPPLIES" },
  { name: "Egg and spoon set", totalQuantity: 1, location: { building: "OA" }, category: "ACTIVITIES" },
  { name: "Giant Uno (OA)", totalQuantity: 1, location: { building: "OA" }, category: "ACTIVITIES" },
  { name: "Mic for speakers", totalQuantity: 1, location: { building: "OA" }, category: "EQUIPMENT" },
  { name: "Brand new whistle set", totalQuantity: 1, location: { building: "OA" }, category: "ACTIVITIES" },
  
  { name: "Badminton net frame", totalQuantity: 1, location: { building: "Eastpoint horizontal box" }, category: "ACTIVITIES" },
  { name: "Badge/pin making set", totalQuantity: 1, location: { building: "Kirkland box" }, category: "CRAFT SUPPLIES" },
  { name: "Double sided tape", totalQuantity: 5, location: { building: "Kirkland box" }, category: "SUPPLIES" },
  
  { name: "Frisbee", totalQuantity: 3, location: { building: "HD box" }, category: "ACTIVITIES" },
  { name: "Dodgeballs (HD)", totalQuantity: 5, location: { building: "HD box" }, category: "ACTIVITIES" },
  { name: "Mini basketball", totalQuantity: 1, location: { building: "HD box" }, category: "ACTIVITIES" },
  { name: "Connect 4 disks", totalQuantity: 50, location: { building: "HD box" }, category: "ACTIVITIES" },
  { name: "Black and white poster boards", totalQuantity: 20, location: { building: "Storage" }, category: "CRAFT SUPPLIES" }
];

async function importItems() {
  try {
    console.log('🚀 Starting bulk import of', items.length, 'items...\n');
    
    const storageService = getStorageService();
    let successCount = 0;
    let errorCount = 0;

    for (const itemData of items) {
      try {
        const fullItemData = {
          ...itemData,
          availableQuantity: itemData.totalQuantity,
          unit: 'piece',
          condition: 'good',
          status: 'active',
          isCheckoutable: true,
          requiresApproval: false,
          description: itemData.notes || '',
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
  }
}

// Run the import
importItems().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


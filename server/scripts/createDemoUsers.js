/**
 * Create Demo Users Script
 * Creates demo user accounts for quick login testing
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../storage/data/users.json');

// Demo user configurations
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@msa.com',
    password: 'admin123',
    phone: '(555) 100-0001',
    role: 'admin',
    status: 'active',
    permissions: {
      canViewItems: true,
      canManageItems: true,
      canCheckout: true,
      canReturn: true,
      canApprove: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canViewReports: true,
      canManageSettings: true,
      canDeleteItems: true,
      canOverrideRestrictions: true
    }
  },
  {
    name: 'Manager User',
    email: 'manager@msa.com',
    password: 'manager123',
    phone: '(555) 100-0002',
    role: 'manager',
    status: 'active',
    permissions: {
      canViewItems: true,
      canManageItems: true,
      canCheckout: true,
      canReturn: true,
      canApprove: true,
      canManageUsers: false,
      canViewAnalytics: true,
      canViewReports: true,
      canManageSettings: false,
      canDeleteItems: false,
      canOverrideRestrictions: false
    }
  },
  {
    name: 'Regular User',
    email: 'user@msa.com',
    password: 'user123',
    phone: '(555) 100-0003',
    role: 'user',
    status: 'active',
    permissions: {
      canViewItems: true,
      canManageItems: false,
      canCheckout: true,
      canReturn: true,
      canApprove: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canViewReports: false,
      canManageSettings: false,
      canDeleteItems: false,
      canOverrideRestrictions: false
    }
  }
];

async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users...\n');

    // Read existing users
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, 'utf8');
      users = JSON.parse(data);
      console.log(`📖 Found ${users.length} existing users`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 Users file not found, creating new one');
        // Create directory if it doesn't exist
        const dir = path.dirname(USERS_FILE);
        await fs.mkdir(dir, { recursive: true });
      } else {
        throw error;
      }
    }

    // Create demo users if they don't exist
    let created = 0;
    let skipped = 0;

    for (const userData of demoUsers) {
      const existingUser = users.find(u => u.email === userData.email);

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists (${userData.role})`);
        skipped++;
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user object
        const newUser = {
          id: uuidv4(),
          _id: uuidv4(),
          ...userData,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Remove plain text password from object
        delete newUser.password;
        newUser.password = hashedPassword;

        users.push(newUser);
        console.log(`✅ Created ${userData.email} (${userData.role})`);
        created++;
      }
    }

    // Save users back to file
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (already exist)`);
    console.log(`   📝 Total users: ${users.length}`);

    console.log('\n🎉 Demo users ready!');
    console.log('\n📝 Quick Login Credentials:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ Admin:                                      │');
    console.log('│   Email: admin@msa.com                      │');
    console.log('│   Password: admin123                        │');
    console.log('│   Access: Full system access                │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ Manager:                                    │');
    console.log('│   Email: manager@msa.com                    │');
    console.log('│   Password: manager123                      │');
    console.log('│   Access: Manage items & approve requests   │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ User:                                       │');
    console.log('│   Email: user@msa.com                       │');
    console.log('│   Password: user123                         │');
    console.log('│   Access: View items & checkout             │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\n🌐 Login at: http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
}

// Run the script
createDemoUsers();


/**
 * Supabase Setup Script
 * This script helps set up your Supabase database
 * 
 * Run: node server/scripts/setupSupabase.js
 * 
 * Note: Table creation requires running SQL in Supabase dashboard,
 * but this script will verify tables exist and create initial data.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkTables() {
  console.log('\n🔍 Checking if tables exist...\n');
  
  const tables = ['users', 'items', 'transactions', 'notifications', 'guest_requests'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          results[table] = { exists: false, error: 'Table does not exist' };
        } else {
          results[table] = { exists: false, error: error.message };
        }
      } else {
        results[table] = { exists: true, count: data ? data.length : 0 };
      }
    } catch (error) {
      results[table] = { exists: false, error: error.message };
    }
  }
  
  console.log('Table Status:');
  console.log('─────────────────────────────────');
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table.padEnd(20)} - EXISTS`);
    } else {
      console.log(`❌ ${table.padEnd(20)} - MISSING: ${result.error}`);
    }
  }
  console.log('─────────────────────────────────\n');
  
  const missingTables = Object.entries(results).filter(([_, r]) => !r.exists);
  
  if (missingTables.length > 0) {
    console.log('⚠️  Missing Tables Detected!\n');
    console.log('You need to run the SQL migration in Supabase:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Click your project');
    console.log('3. Go to SQL Editor → New Query');
    console.log('4. Copy the SQL from: server/scripts/supabase-migration.sql');
    console.log('5. Paste and Run\n');
    return false;
  }
  
  return true;
}

async function createFirstUser() {
  console.log('\n👤 Create First Admin User\n');
  
  const email = await question('Email (default: admin@msa.com): ') || 'admin@msa.com';
  const password = await question('Password (default: admin123): ') || 'admin123';
  const name = await question('Name (default: Admin User): ') || 'Admin User';
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (existingUser) {
    console.log(`\n⚠️  User with email ${email} already exists!`);
    const overwrite = await question('Update password? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipped.');
      return;
    }
  }
  
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const userData = {
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    department: '',
    team: '',
    phone: '',
    permissions: {
      canCheckout: true,
      canReturn: true,
      canApprove: true,
      canManageItems: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canBulkImport: true
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      language: 'en',
      theme: 'light'
    },
    profile: {
      avatar: '',
      bio: ''
    }
  };
  
  if (existingUser) {
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email.toLowerCase())
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating user:', error);
      return;
    }
    
    console.log('\n✅ User password updated!');
    console.log('Email:', email);
    console.log('Password:', password);
  } else {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating user:', error);
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('\n⚠️  ERROR: Users table does not exist!');
        console.error('Please run the SQL migration first.');
      }
      return;
    }
    
    console.log('\n✅ User created successfully!');
    console.log('User ID:', data.id);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: admin');
  }
}

async function main() {
  console.log('🚀 Supabase Setup Script\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('─────────────────────────────────\n');
  
  // Check tables
  const tablesExist = await checkTables();
  
  if (!tablesExist) {
    console.log('❌ Cannot proceed without tables. Please run SQL migration first.');
    rl.close();
    process.exit(1);
  }
  
  // Create first user
  const createUser = await question('\nCreate first admin user? (y/n): ');
  if (createUser.toLowerCase() === 'y') {
    await createFirstUser();
  }
  
  console.log('\n✅ Setup complete!\n');
  console.log('You can now login at: https://msainv-stks.onrender.com/login');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});


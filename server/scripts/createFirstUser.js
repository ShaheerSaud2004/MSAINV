/**
 * Script to create the first admin user in Supabase
 * Run this after setting up Supabase tables
 * 
 * Usage: node server/scripts/createFirstUser.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFirstUser() {
  try {
    // Prompt for user details (in real scenario, use readline)
    const email = process.argv[2] || 'admin@msa.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    console.log('Creating first admin user...');
    console.log('Email:', email);
    console.log('Name:', name);

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('\n⚠️  ERROR: Database tables do not exist!');
        console.error('Please run the SQL migration in Supabase first:');
        console.error('1. Go to Supabase Dashboard → SQL Editor');
        console.error('2. Run the SQL from: server/scripts/supabase-migration.sql');
        process.exit(1);
      }
      process.exit(1);
    }

    console.log('✅ User created successfully!');
    console.log('User ID:', data.id);
    console.log('Email:', data.email);
    console.log('Role:', data.role);
    console.log('\nYou can now login with:');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFirstUser();


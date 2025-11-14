/**
 * Ensure Supabase Admin Script
 * Creates or refreshes the default admin@msa.com user with full permissions.
 *
 * Usage:
 *   STORAGE_MODE=supabase \
 *   SUPABASE_URL=... \
 *   SUPABASE_ANON_KEY=... \
 *   JWT_SECRET=... \
 *   node server/scripts/ensureSupabaseAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { getStorageService } = require('../services/storageService');

const ADMIN_EMAIL = 'admin@msa.com';
const ADMIN_PASSWORD = 'admin123';

async function ensureAdmin() {
  try {
    // Force storage service to use Supabase unless explicitly overridden
    if (!process.env.STORAGE_MODE) {
      process.env.STORAGE_MODE = 'supabase';
    }

    const storageService = getStorageService();
    const existingAdmin = await storageService.findUserByEmail(ADMIN_EMAIL);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const adminPayload = {
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone: '(555) 100-0001',
      department: 'HQ',
      team: 'MSA Exec',
      role: 'admin',
      status: 'active',
      permissions: {
        canViewItems: true,
        canManageItems: true,
        canCheckout: true,
        canReturn: true,
        canApprove: true,
        canApproveTransactions: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canBulkImport: true,
        canViewReports: true,
        canDeleteItems: true
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        language: 'en',
        theme: 'system'
      },
      profile: {
        avatar: '',
        bio: 'Default administrator account'
      },
      lastLogin: new Date()
    };

    if (existingAdmin) {
      console.log('🔁 Updating existing admin account…');
      await storageService.updateUser(existingAdmin._id || existingAdmin.id, adminPayload);
      console.log('✅ Admin account updated. You can log in with admin@msa.com / admin123');
    } else {
      console.log('✨ Creating admin account…');
      await storageService.createUser(adminPayload);
      console.log('✅ Admin account created. You can log in with admin@msa.com / admin123');
    }
  } catch (error) {
    console.error('❌ Failed to ensure admin account:', error.message);
    process.exit(1);
  }
}

ensureAdmin();



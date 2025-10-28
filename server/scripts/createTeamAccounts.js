const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const teams = [
  {
    name: 'IAW Team',
    email: 'iaw@msa.com',
    password: 'iaw123',
    team: 'IAW',
    role: 'admin',
    color: '#3B82F6' // Blue
  },
  {
    name: 'Ladders Team',
    email: 'ladders@msa.com',
    password: 'ladders123',
    team: 'Ladders',
    role: 'admin',
    color: '#8B5CF6' // Purple
  },
  {
    name: 'R2R Team',
    email: 'r2r@msa.com',
    password: 'r2r123',
    team: 'R2R',
    role: 'admin',
    color: '#10B981' // Green
  },
  {
    name: 'Brothers Social',
    email: 'brothers@msa.com',
    password: 'brothers123',
    team: 'Brothers Social',
    role: 'admin',
    color: '#F59E0B' // Amber
  },
  {
    name: 'Sister Social',
    email: 'sisters@msa.com',
    password: 'sisters123',
    team: 'Sister Social',
    role: 'admin',
    color: '#EC4899' // Pink
  },
  {
    name: 'Hope Team',
    email: 'hope@msa.com',
    password: 'hope123',
    team: 'Hope',
    role: 'admin',
    color: '#14B8A6' // Teal
  },
  {
    name: 'Submissions Team',
    email: 'submissions@msa.com',
    password: 'submissions123',
    team: 'Submissions',
    role: 'admin',
    color: '#EF4444' // Red
  }
];

async function createTeamAccountsJSON() {
  const usersFilePath = path.join(__dirname, '../storage/data/users.json');
  
  // Read existing users
  let users = [];
  if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    users = JSON.parse(data);
  }
  
  // Remove existing team accounts
  users = users.filter(u => !teams.find(t => t.email === u.email));
  
  // Hash passwords (simple base64 for demo - in production use bcrypt)
  const bcrypt = require('bcryptjs');
  
  console.log('✨ Creating team accounts...\n');
  
  for (const teamData of teams) {
    const hashedPassword = await bcrypt.hash(teamData.password, 10);
    
    const user = {
      _id: new Date().getTime() + Math.random().toString(36).substring(2, 15),
      id: new Date().getTime() + Math.random().toString(36).substring(2, 15),
      name: teamData.name,
      email: teamData.email,
      password: hashedPassword,
      team: teamData.team,
      role: teamData.role,
      phone: '',
      status: 'active',
      permissions: {
        canCheckout: true,
        canReturn: true,
        canManageItems: true,
        canApprove: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canViewReports: true,
        canBulkImport: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(user);
    
    console.log(`✅ Created: ${teamData.team}`);
    console.log(`   Email: ${teamData.email}`);
    console.log(`   Password: ${teamData.password}`);
    console.log(`   Color: ${teamData.color}\n`);
  }
  
  // Write back to file
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SUCCESS! All team accounts created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Quick Login Credentials:\n');
  teams.forEach(team => {
    console.log(`${team.team}:`);
    console.log(`  Email: ${team.email}`);
    console.log(`  Password: ${team.password}\n`);
  });
}

async function createTeamAccountsMongoDB() {
  const User = require('../models/User');
  const connectDatabase = require('../config/database');
  
  console.log('🚀 Connecting to database...');
  await connectDatabase();
  
  console.log('🗑️  Clearing existing team accounts...');
  await User.deleteMany({ email: { $in: teams.map(t => t.email) } });
  
  console.log('✨ Creating team accounts...\n');
  
  for (const teamData of teams) {
    const user = await User.create({
      name: teamData.name,
      email: teamData.email,
      password: teamData.password,
      team: teamData.team,
      role: teamData.role,
      phone: '',
      permissions: {
        canCheckout: true,
        canReturn: true,
        canManageItems: true,
        canApprove: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canViewReports: true,
        canBulkImport: true
      }
    });
    
    console.log(`✅ Created: ${teamData.team}`);
    console.log(`   Email: ${teamData.email}`);
    console.log(`   Password: ${teamData.password}`);
    console.log(`   Color: ${teamData.color}\n`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SUCCESS! All team accounts created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Quick Login Credentials:\n');
  teams.forEach(team => {
    console.log(`${team.team}:`);
    console.log(`  Email: ${team.email}`);
    console.log(`  Password: ${team.password}\n`);
  });
}

async function createTeamAccounts() {
  try {
    const storageMode = process.env.STORAGE_MODE || 'json';
    
    if (storageMode === 'mongodb') {
      await createTeamAccountsMongoDB();
    } else {
      await createTeamAccountsJSON();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating team accounts:', error);
    process.exit(1);
  }
}

createTeamAccounts();

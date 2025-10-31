const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const TEAM_ACCOUNTS = [
  { email: 'iaw@msa.com', password: 'iaw123', team: 'IAW' },
  { email: 'hope@msa.com', password: 'hope123', team: 'Hope' },
  { email: 'submissions@msa.com', password: 'submissions123', team: 'Submissions' },
  { email: 'ept@msa.com', password: 'ept123', team: 'EPT' },
  { email: 'ladders@msa.com', password: 'ladders123', team: 'Ladders' },
  { email: 'brothers@msa.com', password: 'brothers123', team: 'Brothers Social' },
  { email: 'sisters@msa.com', password: 'sisters123', team: 'Sisters Social' },
  { email: 'r2r@msa.com', password: 'r2r123', team: 'R2R' },
];

async function resetTeamPasswords() {
  try {
    console.log('🔐 Resetting team passwords...\n');

    // Read users.json
    const usersFilePath = path.join(__dirname, '../storage/data/users.json');
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    let updatedCount = 0;

    // Update each team account
    for (const teamAccount of TEAM_ACCOUNTS) {
      const userIndex = users.findIndex(u => u.email === teamAccount.email);
      
      if (userIndex !== -1) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(teamAccount.password, salt);
        
        // Update the user
        users[userIndex].password = hashedPassword;
        users[userIndex].team = teamAccount.team;
        users[userIndex].status = 'active';
        users[userIndex].role = 'user';
        users[userIndex].permissions = {
          canCheckout: true,
          canReturn: true,
          canApprove: false,
          canManageItems: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canManageSettings: false,
          canViewReports: false,
          canBulkImport: false
        };
        users[userIndex].updatedAt = new Date().toISOString();
        
        console.log(`✅ ${teamAccount.team} - ${teamAccount.email}`);
        console.log(`   Password reset to: ${teamAccount.password}\n`);
        updatedCount++;
      } else {
        // Create account if missing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(teamAccount.password, salt);
        const now = new Date().toISOString();
        users.push({
          _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: `${teamAccount.team} Team`,
          email: teamAccount.email,
          password: hashedPassword,
          team: teamAccount.team,
          role: 'user',
          phone: '',
          permissions: {
            canCheckout: true,
            canReturn: true,
            canApprove: false,
            canManageItems: false,
            canManageUsers: false,
            canViewAnalytics: false,
            canManageSettings: false,
            canViewReports: false,
            canBulkImport: false
          },
          createdAt: now,
          updatedAt: now,
          status: 'active',
          lastLogin: now
        });
        console.log(`🆕 Created ${teamAccount.team} - ${teamAccount.email}`);
        updatedCount++;
      }
    }

    // Save the updated users
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ Successfully reset ${updatedCount} team passwords!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎯 Team Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    TEAM_ACCOUNTS.forEach(team => {
      console.log(`  ${team.team.padEnd(20)} → ${team.email.padEnd(25)} / ${team.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error.message);
    process.exit(1);
  }
}

// Run the script
resetTeamPasswords();


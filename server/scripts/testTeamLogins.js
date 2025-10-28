const axios = require('axios');

const TEAMS = [
  { name: 'IAW', email: 'iaw@msa.com', password: 'iaw123' },
  { name: 'Ladders', email: 'ladders@msa.com', password: 'ladders123' },
  { name: 'R2R', email: 'r2r@msa.com', password: 'r2r123' },
  { name: 'Brothers Social', email: 'brothers@msa.com', password: 'brothers123' },
  { name: 'Sister Social', email: 'sisters@msa.com', password: 'sisters123' },
  { name: 'Hope', email: 'hope@msa.com', password: 'hope123' },
  { name: 'Submissions', email: 'submissions@msa.com', password: 'submissions123' }
];

const API_URL = process.env.API_URL || 'http://localhost:3022';

async function testLogin(team) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: team.email,
      password: team.password
    });
    
    if (response.data.success) {
      return { success: true, team: team.name };
    } else {
      return { success: false, team: team.name, error: 'Login failed' };
    }
  } catch (error) {
    return { 
      success: false, 
      team: team.name, 
      error: error.response?.data?.message || error.message 
    };
  }
}

async function testAllLogins() {
  console.log('🔐 Testing Team Logins...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = await Promise.all(TEAMS.map(testLogin));
  
  let successCount = 0;
  let failureCount = 0;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.team.padEnd(20)} - Login successful`);
      successCount++;
    } else {
      console.log(`❌ ${result.team.padEnd(20)} - Login failed: ${result.error}`);
      failureCount++;
    }
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Results: ${successCount}/${TEAMS.length} teams can login successfully`);
  
  if (failureCount > 0) {
    console.log(`\n⚠️  ${failureCount} team(s) failed to login. Run password reset:`);
    console.log('   npm run reset-team-passwords\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All team logins are working!\n');
  }
}

// Check if axios is available
try {
  require.resolve('axios');
  testAllLogins();
} catch (e) {
  console.log('⚠️  axios not found. Installing...');
  console.log('Please wait...\n');
  
  // Fallback to manual testing
  console.log('Alternatively, test logins manually:');
  TEAMS.forEach(team => {
    console.log(`  curl -X POST ${API_URL}/api/auth/login -H "Content-Type: application/json" -d '{"email":"${team.email}","password":"${team.password}"}'`);
  });
}


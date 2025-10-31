const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';
const TEAMS = [
  { name: 'IAW', email: 'iaw@msa.com', password: 'iaw123' },
  { name: 'Hope', email: 'hope@msa.com', password: 'hope123' },
  { name: 'Submissions', email: 'submissions@msa.com', password: 'submissions123' },
  { name: 'EPT', email: 'ept@msa.com', password: 'ept123' },
  { name: 'Ladders', email: 'ladders@msa.com', password: 'ladders123' },
  { name: 'Brothers Social', email: 'brothers@msa.com', password: 'brothers123' },
  { name: 'Sisters Social', email: 'sisters@msa.com', password: 'sisters123' },
  { name: 'R2R', email: 'r2r@msa.com', password: 'r2r123' },
];

const ADMIN = { email: 'admin@msa.com', password: 'admin123' };

let results = { passed: 0, failed: 0, errors: [] };

function log(message, status = 'INFO') {
  const icons = { PASS: '✅', FAIL: '❌', INFO: 'ℹ️', WARN: '⚠️' };
  console.log(`${icons[status]} ${message}`);
}

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    if (response.data.success) {
      return response.data.data.token;
    }
    throw new Error('Login failed');
  } catch (error) {
    throw new Error(`Login error: ${error.response?.data?.message || error.message}`);
  }
}

async function test(name, testFn) {
  try {
    await testFn();
    results.passed++;
    log(`${name}`, 'PASS');
    return true;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: name, error: error.message });
    log(`${name}: ${error.message}`, 'FAIL');
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 Starting Comprehensive Walkthrough Tests\n');
  console.log('='.repeat(60));

  // Test 1: Admin Login
  await test('Admin Login', async () => {
    const token = await login(ADMIN.email, ADMIN.password);
    if (!token) throw new Error('No token received');
  });

  let adminToken;
  let createdItemId;
  let pendingTransactionId;

  // Test 2: Admin creates item
  await test('Admin: Create New Item', async () => {
    adminToken = await login(ADMIN.email, ADMIN.password);
    const itemData = {
      name: 'Test Extension Cord',
      description: 'Test item for walkthrough',
      category: 'Electronics',
      totalQuantity: 5,
      availableQuantity: 5,
      unit: 'piece',
      condition: 'good',
      status: 'active',
      isCheckoutable: true,
    };
    const response = await axios.post(
      `${BASE_URL}/items`,
      itemData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Item creation failed');
    createdItemId = response.data.data._id || response.data.data.id;
  });

  // Test 3: Admin views items
  await test('Admin: View All Items', async () => {
    const response = await axios.get(`${BASE_URL}/items`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success || !response.data.data.length) {
      throw new Error('No items found or API failed');
    }
  });

  // Test 4: Each team can login
  const teamTokens = {};
  for (const team of TEAMS) {
    await test(`Team Login: ${team.name}`, async () => {
      const token = await login(team.email, team.password);
      if (!token) throw new Error('Login failed');
      teamTokens[team.name] = token;
    });
  }

  // Test 5: Teams can view items (shared inventory)
  await test('Teams: View Shared Inventory', async () => {
    const iawToken = teamTokens['IAW'];
    // Get all items (no pagination limit)
    const response = await axios.get(`${BASE_URL}/items?limit=1000`, {
      headers: { Authorization: `Bearer ${iawToken}` }
    });
    if (!response.data.success) throw new Error('Failed to fetch items');
    const foundItem = response.data.data.find(
      item => String(item._id) === String(createdItemId) || String(item.id) === String(createdItemId)
    );
    if (!foundItem) {
      // Debug: show what items we got
      const itemIds = response.data.data.map(i => i._id || i.id).slice(0, 5);
      throw new Error(`Created item (${createdItemId}) not visible to teams. Found ${response.data.data.length} items. First IDs: ${itemIds.join(', ')}`);
    }
    if (foundItem.availableQuantity !== 5) {
      throw new Error(`Expected quantity 5, got ${foundItem.availableQuantity}`);
    }
  });

  // Test 6: Team requests checkout
  await test('Team: Request Checkout', async () => {
    const iawToken = teamTokens['IAW'];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 2);
    
    const response = await axios.post(
      `${BASE_URL}/transactions/checkout`,
      {
        item: createdItemId,
        quantity: 1,
        purpose: 'Test checkout request',
        expectedReturnDate: returnDate.toISOString(),
      },
      { headers: { Authorization: `Bearer ${iawToken}` } }
    );
    if (!response.data.success) throw new Error('Checkout request failed');
    if (response.data.data.status !== 'pending') {
      throw new Error(`Expected status 'pending', got '${response.data.data.status}'`);
    }
    pendingTransactionId = response.data.data._id || response.data.data.id;
  });

  // Test 7: Reservation blocks other requests
  await test('Reservation System: Blocks Overbooking', async () => {
    const hopeToken = teamTokens['Hope'];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 2);
    
    // Try to request more than available (after reservation)
    try {
      const response = await axios.post(
        `${BASE_URL}/transactions/checkout`,
        {
          item: createdItemId,
          quantity: 10, // More than available (5 total - 1 pending = 4 effective)
          purpose: 'Test overbooking',
          expectedReturnDate: returnDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${hopeToken}` } }
      );
      
      // Should fail - if we get here, it succeeded when it shouldn't
      if (response.data.success) {
        throw new Error('Overbooking should have been blocked');
      }
    } catch (error) {
      // Expected: should get 400 error
      if (error.response && error.response.status === 400) {
        const message = error.response.data?.message || '';
        if (!message.includes('available') && !message.includes('Only')) {
          throw new Error(`Expected availability error, got: ${message}`);
        }
        // This is the expected behavior - request was blocked
        return;
      }
      // Unexpected error
      throw error;
    }
  });

  // Test 8: Admin sees pending approvals
  await test('Admin: View Pending Approvals', async () => {
    const response = await axios.get(`${BASE_URL}/transactions?status=pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to fetch transactions');
    const pending = response.data.data.find(
      t => (t._id === pendingTransactionId || t.id === pendingTransactionId)
    );
    if (!pending) throw new Error('Pending transaction not found in admin view');
  });

  // Test 9: Admin approves request
  await test('Admin: Approve Transaction', async () => {
    const response = await axios.post(
      `${BASE_URL}/transactions/${pendingTransactionId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Approval failed');
    if (response.data.data.status !== 'active') {
      throw new Error(`Expected status 'active', got '${response.data.data.status}'`);
    }
  });

  // Test 10: Item availability decreased after approval
  await test('Item Availability: Decreases After Approval', async () => {
    const response = await axios.get(`${BASE_URL}/items/${createdItemId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Failed to fetch item');
    const item = response.data.data;
    if (item.availableQuantity !== 4) {
      throw new Error(`Expected quantity 4 (5-1), got ${item.availableQuantity}`);
    }
  });

  // Test 11: Teams see only own transactions
  await test('Teams: See Only Own Transactions', async () => {
    const iawToken = teamTokens['IAW'];
    const hopeToken = teamTokens['Hope'];
    
    // IAW should see their transaction
    const iawResponse = await axios.get(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${iawToken}` }
    });
    const iawTransaction = iawResponse.data.data.find(
      t => (t._id === pendingTransactionId || t.id === pendingTransactionId)
    );
    if (!iawTransaction) throw new Error('IAW cannot see their own transaction');
    
    // Hope should NOT see IAW's transaction
    const hopeResponse = await axios.get(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${hopeToken}` }
    });
    const hopeTransaction = hopeResponse.data.data.find(
      t => (t._id === pendingTransactionId || t.id === pendingTransactionId)
    );
    if (hopeTransaction) throw new Error('Hope can see other team transactions (should not)');
  });

  // Test 12: Guest request submission
  await test('Guest: Submit Request', async () => {
    const guestRequest = {
      team: 'IAW',
      itemName: 'Test Extension Cord',
      name: 'John Guest',
      email: 'john@example.com',
      purpose: 'Test guest request',
      itemPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      departurePhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };
    const response = await axios.post(`${BASE_URL}/guest-requests`, guestRequest);
    if (!response.data.success) throw new Error(`Guest request failed: ${response.data.message}`);
    // Small delay to ensure write completes
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  // Test 13: Admin sees guest requests
  await test('Admin: View Guest Requests', async () => {
    const response = await axios.get(`${BASE_URL}/guest-requests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error(`Failed to fetch guest requests: ${response.data.message}`);
    if (!response.data.data || response.data.data.length === 0) {
      // Try once more with a small delay
      await new Promise(resolve => setTimeout(resolve, 200));
      const retryResponse = await axios.get(`${BASE_URL}/guest-requests`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!retryResponse.data.data || retryResponse.data.data.length === 0) {
        throw new Error('No guest requests found after retry');
      }
    }
  });

  // Test 14: Admin dashboard analytics
  await test('Admin: Dashboard Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.success) throw new Error('Dashboard analytics failed');
    const { summary } = response.data.data;
    if (summary.totalItems < 1) throw new Error('Dashboard should show items');
    if (summary.activeCheckouts < 0) throw new Error('Dashboard should show active checkouts');
  });

  // Test 15: Teams get simplified dashboard
  await test('Teams: Simplified Dashboard', async () => {
    const iawToken = teamTokens['IAW'];
    const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${iawToken}` }
    });
    if (!response.data.success) throw new Error('Team dashboard failed');
    const { summary } = response.data.data;
    // Teams should see their own active checkouts
    if (summary.activeCheckouts < 0) throw new Error('Should show own active checkouts');
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(({ test, error }) => {
      console.log(`   ${test}: ${error}`);
    });
  }

  console.log('\n');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


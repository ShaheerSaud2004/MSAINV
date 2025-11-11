#!/usr/bin/env node

/**
 * PRODUCTION TEST SUITE FOR MSA INVENTORY SYSTEM
 * Tests all features on the deployed production site
 */

const axios = require('axios');

// Production URL
const BASE_URL = 'https://msainv-stks.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Test results tracker
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  skipped: []
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { 
      status: response.status, 
      data: response.data,
      success: true 
    };
  } catch (error) {
    return { 
      status: error.response?.status || 500, 
      data: error.response?.data || { message: error.message },
      error: error.message,
      success: false 
    };
  }
}

// Logging functions
function logTest(name, passed, message = '') {
  if (passed) {
    testResults.passed.push({ name, message });
    console.log(`${colors.green}✅ PASS:${colors.reset} ${name}${message ? ` - ${message}` : ''}`);
  } else {
    testResults.failed.push({ name, message });
    console.log(`${colors.red}❌ FAIL:${colors.reset} ${name}${message ? ` - ${message}` : ''}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message });
  console.log(`${colors.yellow}⚠️  WARN:${colors.reset} ${name} - ${message}`);
}

function logSkip(name, reason) {
  testResults.skipped.push({ name, reason });
  console.log(`${colors.cyan}⏭️  SKIP:${colors.reset} ${name} - ${reason}`);
}

// Test functions
async function testHealthCheck() {
  console.log(`\n${colors.bold}${colors.blue}=== Health Check ===${colors.reset}`);
  const result = await apiCall('/health');
  logTest('Health Check', result.success && result.status === 200, 
    result.success ? `Status: ${result.status}` : result.error);
}

async function testAuthEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Authentication Tests ===${colors.reset}`);
  
  // Test login endpoint exists
  const loginTest = await apiCall('/auth/login', 'POST', {
    email: 'test@test.com',
    password: 'test'
  });
  logTest('Login Endpoint Accessible', loginTest.status === 401 || loginTest.status === 400, 
    `Expected 401/400, got ${loginTest.status}`);
  
  // Test register endpoint exists
  const registerTest = await apiCall('/auth/register', 'POST', {
    name: 'Test',
    email: 'test@test.com',
    password: 'test123'
  });
  logTest('Register Endpoint Accessible', registerTest.status === 400 || registerTest.status === 201, 
    `Status: ${registerTest.status}`);
}

async function testItemEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Items API Tests ===${colors.reset}`);
  
  // Test items endpoint (should require auth)
  const itemsTest = await apiCall('/items');
  logTest('Items Endpoint Protected', itemsTest.status === 401, 
    `Expected 401, got ${itemsTest.status}`);
  
  // Test categories endpoint
  const categoriesTest = await apiCall('/items/categories/list');
  logTest('Categories Endpoint Protected', categoriesTest.status === 401, 
    `Expected 401, got ${categoriesTest.status}`);
}

async function testTransactionEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Transactions API Tests ===${colors.reset}`);
  
  // Test transactions endpoint (should require auth)
  const transactionsTest = await apiCall('/transactions');
  logTest('Transactions Endpoint Protected', transactionsTest.status === 401, 
    `Expected 401, got ${transactionsTest.status}`);
  
  // Test checkout endpoint
  const checkoutTest = await apiCall('/transactions/checkout', 'POST', {
    item: 'test',
    quantity: 1,
    purpose: 'test',
    expectedReturnDate: new Date().toISOString()
  });
  logTest('Checkout Endpoint Protected', checkoutTest.status === 401, 
    `Expected 401, got ${checkoutTest.status}`);
}

async function testAnalyticsEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Analytics API Tests ===${colors.reset}`);
  
  // Test dashboard endpoint (should require auth)
  const dashboardTest = await apiCall('/analytics/dashboard');
  logTest('Dashboard Endpoint Protected', dashboardTest.status === 401, 
    `Expected 401, got ${dashboardTest.status}`);
}

async function testQREndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== QR Code API Tests ===${colors.reset}`);
  
  // Test QR endpoint
  const qrTest = await apiCall('/qr/item/TEST123');
  logTest('QR Endpoint Accessible', qrTest.status === 200 || qrTest.status === 404, 
    `Status: ${qrTest.status}`);
}

async function testUserEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Users API Tests ===${colors.reset}`);
  
  // Test users endpoint (should require auth)
  const usersTest = await apiCall('/users');
  logTest('Users Endpoint Protected', usersTest.status === 401, 
    `Expected 401, got ${usersTest.status}`);
}

async function testNotificationEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Notifications API Tests ===${colors.reset}`);
  
  // Test notifications endpoint (should require auth)
  const notificationsTest = await apiCall('/notifications');
  logTest('Notifications Endpoint Protected', notificationsTest.status === 401, 
    `Expected 401, got ${notificationsTest.status}`);
}

async function testGuestRequestEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}=== Guest Requests API Tests ===${colors.reset}`);
  
  // Test guest requests endpoint (should be accessible)
  const guestRequestsTest = await apiCall('/guest-requests');
  logTest('Guest Requests Endpoint Accessible', guestRequestsTest.status === 200 || guestRequestsTest.status === 401, 
    `Status: ${guestRequestsTest.status}`);
}

async function testFrontendRoutes() {
  console.log(`\n${colors.bold}${colors.blue}=== Frontend Routes Tests ===${colors.reset}`);
  
  const routes = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/items',
    '/transactions',
    '/admin',
    '/analytics',
    '/qr-scanner'
  ];
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`, {
        validateStatus: () => true,
        timeout: 10000
      });
      const passed = response.status === 200 || response.status === 401 || response.status === 302;
      logTest(`Frontend Route: ${route}`, passed, `Status: ${response.status}`);
    } catch (error) {
      logTest(`Frontend Route: ${route}`, false, error.message);
    }
  }
}

async function testWithAuth() {
  console.log(`\n${colors.bold}${colors.blue}=== Authenticated Tests ===${colors.reset}`);
  console.log(`${colors.yellow}Note: These tests require valid credentials${colors.reset}`);
  
  // Try to get a test user from environment or skip
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;
  
  if (!testEmail || !testPassword) {
    logSkip('Authenticated Tests', 'TEST_EMAIL and TEST_PASSWORD not set');
    return;
  }
  
  // Login
  const loginResult = await apiCall('/auth/login', 'POST', {
    email: testEmail,
    password: testPassword
  });
  
  if (!loginResult.success || !loginResult.data.token) {
    logTest('Login with Test Credentials', false, loginResult.data.message || 'Login failed');
    return;
  }
  
  const token = loginResult.data.token;
  logTest('Login with Test Credentials', true, 'Token received');
  
  // Test dashboard
  const dashboardResult = await apiCall('/analytics/dashboard', 'GET', null, token);
  logTest('Dashboard Data Loads', dashboardResult.success, 
    dashboardResult.success ? 'Data received' : dashboardResult.data.message);
  
  // Test items list
  const itemsResult = await apiCall('/items', 'GET', null, token);
  logTest('Items List Loads', itemsResult.success, 
    itemsResult.success ? `Found ${itemsResult.data.data?.length || 0} items` : itemsResult.data.message);
  
  // Test transactions list
  const transactionsResult = await apiCall('/transactions', 'GET', null, token);
  logTest('Transactions List Loads', transactionsResult.success, 
    transactionsResult.success ? 'Transactions loaded' : transactionsResult.data.message);
  
  // Test user profile
  const userResult = await apiCall('/auth/me', 'GET', null, token);
  logTest('User Profile Loads', userResult.success, 
    userResult.success ? `User: ${userResult.data.data?.name || 'Unknown'}` : userResult.data.message);
}

// Main test runner
async function runTests() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   MSA Inventory System - Production Test Suite            ║');
  console.log('║   Testing: https://msainv-stks.onrender.com              ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
  
  try {
    await testHealthCheck();
    await testAuthEndpoints();
    await testItemEndpoints();
    await testTransactionEndpoints();
    await testAnalyticsEndpoints();
    await testQREndpoints();
    await testUserEndpoints();
    await testNotificationEndpoints();
    await testGuestRequestEndpoints();
    await testFrontendRoutes();
    await testWithAuth();
    
    // Print summary
    console.log(`\n${colors.bold}${colors.cyan}=== Test Summary ===${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${testResults.passed.length}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${testResults.failed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings.length}${colors.reset}`);
    console.log(`${colors.cyan}⏭️  Skipped: ${testResults.skipped.length}${colors.reset}`);
    
    if (testResults.failed.length > 0) {
      console.log(`\n${colors.red}${colors.bold}Failed Tests:${colors.reset}`);
      testResults.failed.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    const successRate = (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;
    console.log(`\n${colors.bold}📊 Success Rate: ${successRate.toFixed(1)}%${colors.reset}\n`);
    
    process.exit(testResults.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}${colors.bold}Test suite error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run tests
runTests();




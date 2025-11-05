# 🧪 Testing Guide - MSA Inventory System

This guide explains how to run comprehensive tests on the MSA Inventory System.

---

## 🚀 Quick Start

### Option 1: Automated API Tests (Recommended)

Run the automated test suite that tests all API endpoints:

```bash
npm test
```

Or with custom URL:

```bash
TEST_URL=https://your-ngrok-url.ngrok-free.app npm test
```

**What it tests:**
- ✅ System health
- ✅ Authentication & login
- ✅ Items management
- ✅ Checkout workflows
- ✅ Approval flows
- ✅ QR code & barcode scanning
- ✅ Analytics endpoints
- ✅ User management
- ✅ Notifications
- ✅ Dashboard data

### Option 2: Manual Testing Checklist

Use the comprehensive manual testing checklist:

1. Open `COMPREHENSIVE_TEST_CHECKLIST.md`
2. Follow the step-by-step checklist
3. Test each feature systematically
4. Mark items as complete

---

## 📋 Test Categories

### 1. Authentication Tests
- Admin login
- Manager login
- Regular user login
- Invalid credentials
- Logout functionality

### 2. Tutorial & Quiz System
- Tutorial flow for new users
- Quiz completion (12 questions, 80% pass rate)
- Skip quiz functionality
- Returning user access

### 3. Items Management
- View all items
- Search & filter items
- Category quick filters
- Recently checked out items
- Add/edit/delete items (admin only)

### 4. Checkout Flow (Test for Each Team)
- Request checkout
- WhatsApp message generation
- Transaction status (pending → active)
- Approval workflow
- Photo upload requirement
- Return process

### 5. QR Code & Barcode Scanning
- Camera scanner
- Manual QR code entry
- Barcode scanning
- Quick checkout via scan

### 6. Transactions Management
- View all transactions
- Filter by status/type/user
- Transaction details
- Approval/rejection
- Return workflow

### 7. Photo Upload System
- Upload storage visit photos
- Photo requirement validation
- View uploaded photos
- Prevent return without photos

### 8. Analytics (Admin/Manager Only)
- Dashboard overview
- Item utilization
- User activity
- Overdue patterns

### 9. User Management (Admin Only)
- View all users
- Add/edit users
- Filter by role/status
- Permission checks

### 10. Notifications
- View notifications
- Mark as read
- Unread count
- Notification types

---

## 🎯 Testing Each Team's Checkout Flow

### Team 1: MSA Events
1. Login as Team 1 user
2. Request checkout for an item
3. Copy WhatsApp message
4. Manager approves
5. Upload photos
6. Return item

### Team 2: Youth
1. Repeat Team 1 flow with Team 2 user
2. Verify independent transactions

### Team 3: Friday Prayer
1. Repeat Team 1 flow with Team 3 user
2. Verify multiple teams can checkout simultaneously

---

## 🔧 Running Tests

### Automated Test Script

The test script (`test-all-features.js`) will:
1. Check system health
2. Prompt for admin credentials
3. Test all API endpoints
4. Generate a summary report

**Example Output:**
```
✅ PASS: System Health Check - Storage: json, Env: production
✅ PASS: Admin Login
✅ PASS: Get All Items - Found 120 items
✅ PASS: Get Categories - Found 15 categories
❌ FAIL: Get Pending Transactions - No pending transactions
⚠️  WARNING: Photo Upload - No transactions requiring photos
```

### Manual Testing

For manual testing, use the checklist in `COMPREHENSIVE_TEST_CHECKLIST.md`. This provides:
- Step-by-step instructions
- Expected results
- Edge cases to test
- Error scenarios

---

## 🐛 Common Issues

### Test Script Fails to Connect
- **Issue**: Cannot connect to server
- **Solution**: 
  - Verify server is running: `cd server && npm run dev`
  - Check ngrok is active: `curl http://localhost:4040/api/tunnels`
  - Update TEST_URL in test script

### Authentication Tests Fail
- **Issue**: Login fails
- **Solution**:
  - Verify user credentials exist
  - Check database/storage has users
  - Verify JWT_SECRET is set

### No Items for Testing
- **Issue**: No items found
- **Solution**:
  - Import items via admin panel
  - Use existing items in system
  - Create test items manually

---

## 📊 Test Results

After running tests, you'll get:
- ✅ Pass count
- ❌ Fail count
- ⚠️ Warning count
- ⏭️ Skipped count
- 📊 Success rate percentage

### Interpreting Results

- **90%+ Success Rate**: System is working well
- **70-90% Success Rate**: Some issues need attention
- **<70% Success Rate**: Critical issues need fixing

---

## 🔍 Debugging Failed Tests

1. **Check server logs**: Look for error messages
2. **Verify endpoints**: Test endpoints manually with Postman/curl
3. **Check database**: Verify data exists
4. **Review permissions**: Ensure user roles are correct
5. **Check environment variables**: Verify all required vars are set

---

## 📝 Test Checklist Completion

When completing manual tests:
1. Check off each item as you test it
2. Note any issues found
3. Document bugs in the Issues section
4. Sign off with your name and date

---

## 🎯 Next Steps After Testing

1. **Fix Critical Issues**: Address any blocking bugs
2. **Document Findings**: Update test results
3. **Re-test**: Run tests again after fixes
4. **Deploy**: Once all tests pass, deploy to production

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Review error messages
3. Verify environment setup
4. Check API documentation

---

**Last Updated**: November 5, 2025


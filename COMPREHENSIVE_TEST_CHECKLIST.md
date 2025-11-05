# 🧪 COMPREHENSIVE TEST CHECKLIST - MSA INVENTORY SYSTEM

This document provides a complete manual testing checklist for all features in the MSA Inventory System.

**Test URL**: https://b6aaff6c4236.ngrok-free.app

---

## 📋 TEST PREPARATION

- [ ] Clear browser cache and localStorage
- [ ] Ensure server is running
- [ ] Have test accounts ready (admin, manager, regular users from different teams)
- [ ] Have test items ready in the system
- [ ] Prepare test QR codes and barcodes if available

---

## 1️⃣ AUTHENTICATION & ACCESS CONTROL

### Login System
- [ ] **Test Admin Login**
  - [ ] Enter admin credentials
  - [ ] Verify successful login
  - [ ] Verify redirect to dashboard
  - [ ] Verify admin menu options are visible

- [ ] **Test Manager Login**
  - [ ] Enter manager credentials
  - [ ] Verify successful login
  - [ ] Verify manager menu options (no user management)
  - [ ] Verify can approve transactions

- [ ] **Test Regular User Login**
  - [ ] Enter user credentials
  - [ ] Verify successful login
  - [ ] Verify limited menu options
  - [ ] Verify cannot access admin features

- [ ] **Test Invalid Login**
  - [ ] Enter wrong password
  - [ ] Verify error message appears
  - [ ] Verify no redirect occurs

- [ ] **Test Logout**
  - [ ] Click logout button
  - [ ] Verify redirect to login page
  - [ ] Verify token is cleared

---

## 2️⃣ TUTORIAL & QUIZ SYSTEM

### Tutorial Flow
- [ ] **New User First Login**
  - [ ] Login as new user
  - [ ] Verify tutorial automatically starts
  - [ ] Verify tutorial has 10 sections
  - [ ] Test navigation (Next/Previous buttons)
  - [ ] Verify progress bar updates
  - [ ] Test "Skip Tutorial & Quiz" button

- [ ] **Quiz System**
  - [ ] After tutorial, verify quiz appears
  - [ ] Verify 12 questions (6 website, 6 policy)
  - [ ] Test answering questions
  - [ ] Submit quiz with correct answers (80%+ required)
  - [ ] Verify pass message and access granted
  - [ ] Submit quiz with incorrect answers (<80%)
  - [ ] Verify fail message and retry option
  - [ ] Test "Skip Quiz" button
  - [ ] Verify skip grants access

- [ ] **Returning User**
  - [ ] Login as user who passed quiz
  - [ ] Verify no tutorial/quiz shown
  - [ ] Verify direct access to dashboard

---

## 3️⃣ DASHBOARD

### Dashboard Overview
- [ ] **Admin Dashboard**
  - [ ] Verify all statistics cards display
  - [ ] Verify total items count
  - [ ] Verify active checkouts count
  - [ ] Verify pending approvals count
  - [ ] Verify recent activity list
  - [ ] Verify top items section
  - [ ] Verify category distribution chart

- [ ] **Manager Dashboard**
  - [ ] Verify manager-specific statistics
  - [ ] Verify can see all transactions
  - [ ] Verify cannot see user management

- [ ] **Regular User Dashboard**
  - [ ] Verify personalized welcome message
  - [ ] Verify "Your Recent Checkouts" section
  - [ ] Verify only own transactions shown
  - [ ] Verify "Quick Checkout" section with link
  - [ ] Verify Quick Access Link to items page

---

## 4️⃣ ITEMS MANAGEMENT

### Items List Page
- [ ] **View Items**
  - [ ] Navigate to Items page
  - [ ] Verify all items display
  - [ ] Verify item cards show: name, category, quantity, status
  - [ ] Verify "Recently Checked Out Items" section appears
  - [ ] Verify recent checkouts show correct info

- [ ] **Search & Filter**
  - [ ] Test search by item name
  - [ ] Test filter by category dropdown
  - [ ] Test "Quick Filter by Category" buttons
  - [ ] Verify "All" button clears category filter
  - [ ] Test filter by status (available/checked out)
  - [ ] Verify filters work together

- [ ] **Category Quick Filters**
  - [ ] Verify category chips/buttons display
  - [ ] Click a category button
  - [ ] Verify items filter to that category
  - [ ] Verify active category is highlighted
  - [ ] Click "All" button
  - [ ] Verify all items show again

- [ ] **Item Details**
  - [ ] Click on an item card
  - [ ] Verify item detail page loads
  - [ ] Verify all item information displays
  - [ ] Verify QR code generation button
  - [ ] Verify checkout button (if available)

### Add/Edit Items (Admin/Manager Only)
- [ ] **Add New Item**
  - [ ] Navigate to Add Item page
  - [ ] Fill in all required fields
  - [ ] Test category autocomplete (datalist)
  - [ ] Select existing category from dropdown
  - [ ] Type new category
  - [ ] Add item
  - [ ] Verify success message
  - [ ] Verify item appears in list

- [ ] **Edit Item**
  - [ ] Click edit on existing item
  - [ ] Modify item details
  - [ ] Save changes
  - [ ] Verify changes persist

- [ ] **Delete Item** (if available)
  - [ ] Delete a test item
  - [ ] Verify confirmation dialog
  - [ ] Verify item removed from list

---

## 5️⃣ CHECKOUT FLOW - FULL WORKFLOW FOR EACH TEAM

### Team 1: Test Checkout (e.g., MSA Events)
- [ ] **Step 1: Request Checkout**
  - [ ] Login as Team 1 user
  - [ ] Navigate to Items page
  - [ ] Select an item with available quantity
  - [ ] Click "Checkout" or "Request"
  - [ ] Fill checkout form:
    - [ ] Quantity
    - [ ] Purpose
    - [ ] Expected return date
    - [ ] Destination (building, room, location)
    - [ ] Notes
  - [ ] Read Terms & Conditions
  - [ ] Check "I agree" checkbox
  - [ ] Submit request
  - [ ] Verify success message

- [ ] **Step 2: WhatsApp Message**
  - [ ] After submission, verify modal appears
  - [ ] Verify WhatsApp message is generated
  - [ ] Verify message includes:
    - [ ] User name
    - [ ] Item name
    - [ ] Quantity
    - [ ] Purpose
    - [ ] Expected return date
  - [ ] Click "Copy to Clipboard"
  - [ ] Verify copy confirmation
  - [ ] Verify message is correct format

- [ ] **Step 3: Transaction Status (Pending)**
  - [ ] Navigate to Transactions page
  - [ ] Verify transaction appears with "Pending" status
  - [ ] Click on transaction
  - [ ] Verify transaction detail page loads
  - [ ] Verify "Next Step: Send WhatsApp Message" section
  - [ ] Verify WhatsApp message is copyable

- [ ] **Step 4: Approval (Manager/Admin)**
  - [ ] Login as manager/admin
  - [ ] Navigate to Transactions page
  - [ ] Filter by "Pending" status
  - [ ] Find Team 1's transaction
  - [ ] Click on transaction
  - [ ] Verify transaction details
  - [ ] Click "Approve" button
  - [ ] Verify approval success message
  - [ ] Verify notification sent to user

- [ ] **Step 5: Photo Upload Requirement**
  - [ ] Login back as Team 1 user
  - [ ] Navigate to transaction detail page
  - [ ] Verify prominent orange/red alert appears:
    - [ ] "⚠️ REQUIRED: Upload Storage Visit Photos"
    - [ ] Warning about photos required
    - [ ] "Upload Photos Now" button
  - [ ] Verify "Mark as Returned" button is disabled
  - [ ] Click "Upload Photos Now" button
  - [ ] Verify redirect to storage visit page

- [ ] **Step 6: Upload Photos**
  - [ ] On storage visit page
  - [ ] Upload check-in photo
  - [ ] Upload check-out photo
  - [ ] Add notes if needed
  - [ ] Submit photos
  - [ ] Verify success message
  - [ ] Return to transaction detail page
  - [ ] Verify photos are displayed
  - [ ] Verify alert disappears
  - [ ] Verify "Mark as Returned" button is now enabled

- [ ] **Step 7: Return Item**
  - [ ] On transaction detail page
  - [ ] Click "Mark as Returned" button
  - [ ] Verify confirmation dialog
  - [ ] Confirm return
  - [ ] Verify success message
  - [ ] Verify transaction status changes to "Returned"
  - [ ] Verify item quantity restored

### Team 2: Test Checkout (e.g., Youth)
- [ ] Repeat all steps from Team 1 with Team 2 user
- [ ] Verify different team members can checkout independently
- [ ] Verify each team's transactions are separate

### Team 3: Test Checkout (e.g., Friday Prayer)
- [ ] Repeat all steps from Team 1 with Team 3 user
- [ ] Verify multiple teams can checkout simultaneously

---

## 6️⃣ QR CODE & BARCODE SCANNING

### QR Code Scanner
- [ ] **Camera Scanner**
  - [ ] Navigate to QR Scanner page
  - [ ] Click "Start Camera"
  - [ ] Grant camera permissions
  - [ ] Verify camera view appears
  - [ ] Test scan mode selection:
    - [ ] QR Codes & Barcodes
    - [ ] QR Codes Only
    - [ ] Barcodes Only
  - [ ] Scan a QR code
  - [ ] Verify item details appear
  - [ ] Verify camera stops automatically
  - [ ] Click "Stop Camera" button
  - [ ] Verify camera stops

- [ ] **Manual QR Code Entry**
  - [ ] Enter QR code manually
  - [ ] Click "Lookup QR Code"
  - [ ] Verify item found
  - [ ] Verify item details display

- [ ] **Barcode Scanner**
  - [ ] Select "Barcodes Only" mode
  - [ ] Scan a barcode with camera
  - [ ] Verify item found by barcode
  - [ ] Test manual barcode entry
  - [ ] Click "Lookup Barcode"
  - [ ] Verify item found

- [ ] **Quick Actions**
  - [ ] After scanning, verify "Checkout" button (if available)
  - [ ] Click checkout
  - [ ] Verify redirect to checkout form with item pre-filled

---

## 7️⃣ TRANSACTIONS MANAGEMENT

### Transactions List
- [ ] **View Transactions**
  - [ ] Navigate to Transactions page
  - [ ] Verify all transactions display
  - [ ] Verify transaction cards show:
    - [ ] Item name
    - [ ] User name
    - [ ] Status badge
    - [ ] Dates
    - [ ] Quantity

- [ ] **Filter Transactions**
  - [ ] Filter by status (Pending, Active, Returned, Overdue)
  - [ ] Filter by type (Checkout, Return)
  - [ ] Filter by user (admin/manager only)
  - [ ] Filter by item
  - [ ] Verify filters work correctly

- [ ] **Transaction Details**
  - [ ] Click on a transaction
  - [ ] Verify detail page loads
  - [ ] Verify all transaction information displays
  - [ ] Verify action buttons (Approve, Reject, Return, etc.)

### Approval Workflow
- [ ] **Approve Transaction**
  - [ ] As manager/admin, find pending transaction
  - [ ] Click "Approve"
  - [ ] Verify approval success
  - [ ] Verify notification sent
  - [ ] Verify transaction status changes to "Active"
  - [ ] Verify prominent message about photo requirement

- [ ] **Reject Transaction**
  - [ ] As manager/admin, find pending transaction
  - [ ] Click "Reject"
  - [ ] Enter rejection reason
  - [ ] Verify rejection success
  - [ ] Verify notification sent
  - [ ] Verify transaction status changes to "Rejected"

---

## 8️⃣ PHOTO UPLOAD SYSTEM

### Storage Visit Photos
- [ ] **Upload Photos (Required)**
  - [ ] Navigate to transaction requiring photos
  - [ ] Verify prominent alert about photo requirement
  - [ ] Click "Upload Photos Now"
  - [ ] Upload check-in photo
  - [ ] Upload check-out photo
  - [ ] Add notes
  - [ ] Submit
  - [ ] Verify success message
  - [ ] Verify photos display on transaction page

- [ ] **Photo Validation**
  - [ ] Try to return transaction without photos
  - [ ] Verify "Mark as Returned" button is disabled
  - [ ] Click disabled button
  - [ ] Verify error toast message
  - [ ] Upload photos
  - [ ] Verify button becomes enabled

- [ ] **View Photos**
  - [ ] On transaction with photos
  - [ ] Verify photos are displayed
  - [ ] Verify photo thumbnails work
  - [ ] Verify full-size view works

---

## 9️⃣ ANALYTICS & REPORTS

### Analytics Dashboard (Admin/Manager Only)
- [ ] **Navigate to Analytics**
  - [ ] Login as admin/manager
  - [ ] Navigate to Analytics page
  - [ ] Verify page loads without errors

- [ ] **Overview Tab**
  - [ ] Verify summary cards display
  - [ ] Verify charts render
  - [ ] Verify data is accurate

- [ ] **Item Utilization Tab**
  - [ ] Click "Item Utilization" tab
  - [ ] Verify utilization chart displays
  - [ ] Verify utilization table shows items
  - [ ] Verify data is sorted correctly

- [ ] **User Activity Tab**
  - [ ] Click "User Activity" tab
  - [ ] Verify activity chart displays
  - [ ] Verify user activity table shows
  - [ ] Verify user checkout counts are accurate

- [ ] **Overdue Patterns Tab**
  - [ ] Click "Overdue Patterns" tab
  - [ ] Verify overdue statistics display
  - [ ] Verify overdue by user table
  - [ ] Verify overdue by item table

---

## 🔟 USER MANAGEMENT (Admin Only)

### Users List
- [ ] **View Users**
  - [ ] Login as admin
  - [ ] Navigate to Users page
  - [ ] Verify all users display
  - [ ] Verify user cards show: name, email, role, status

- [ ] **Filter Users**
  - [ ] Filter by role (Admin, Manager, User)
  - [ ] Filter by status (Active, Inactive)
  - [ ] Verify filters work

- [ ] **Add User**
  - [ ] Click "Add User"
  - [ ] Fill in user form
  - [ ] Select role
  - [ ] Submit
  - [ ] Verify user created

- [ ] **Edit User**
  - [ ] Click edit on user
  - [ ] Modify user details
  - [ ] Save
  - [ ] Verify changes persist

- [ ] **User Permissions**
  - [ ] Verify regular users cannot access user management
  - [ ] Verify managers cannot access user management

---

## 1️⃣1️⃣ NOTIFICATIONS

### Notification Center
- [ ] **View Notifications**
  - [ ] Click notification bell icon
  - [ ] Verify notifications list appears
  - [ ] Verify unread count badge displays
  - [ ] Verify notifications are sorted by date

- [ ] **Mark as Read**
  - [ ] Click on a notification
  - [ ] Verify notification marked as read
  - [ ] Verify unread count decreases

- [ ] **Mark All as Read**
  - [ ] Click "Mark All as Read"
  - [ ] Verify all notifications marked as read
  - [ ] Verify unread count is 0

---

## 1️⃣2️⃣ SEARCH & NAVIGATION

### Navigation
- [ ] **Sidebar Navigation**
  - [ ] Verify all menu items display
  - [ ] Click each menu item
  - [ ] Verify correct page loads
  - [ ] Verify active menu item is highlighted

- [ ] **Mobile Navigation**
  - [ ] Resize browser to mobile size
  - [ ] Verify hamburger menu appears
  - [ ] Click menu
  - [ ] Verify sidebar slides in
  - [ ] Verify all menu items accessible

### Search Functionality
- [ ] **Items Search**
  - [ ] Go to Items page
  - [ ] Enter search term
  - [ ] Verify results filter in real-time
  - [ ] Verify search works with categories

---

## 1️⃣3️⃣ EDGE CASES & ERROR HANDLING

### Error Scenarios
- [ ] **Network Errors**
  - [ ] Disconnect internet
  - [ ] Try to load page
  - [ ] Verify error message appears
  - [ ] Reconnect internet
  - [ ] Verify page reloads

- [ ] **Invalid Data**
  - [ ] Try to checkout with quantity > available
  - [ ] Verify error message
  - [ ] Try to checkout with past return date
  - [ ] Verify validation error

- [ ] **Unauthorized Access**
  - [ ] Try to access admin page as regular user
  - [ ] Verify redirect or error message
  - [ ] Try to access another user's transaction
  - [ ] Verify cannot access

- [ ] **Empty States**
  - [ ] Test with no items
  - [ ] Verify empty state message
  - [ ] Test with no transactions
  - [ ] Verify appropriate message

---

## 1️⃣4️⃣ PERFORMANCE & RESPONSIVENESS

### Performance
- [ ] **Page Load Times**
  - [ ] Test dashboard load time
  - [ ] Test items page load time
  - [ ] Test transactions page load time
  - [ ] Verify pages load within reasonable time (<3 seconds)

- [ ] **Large Data Sets**
  - [ ] Test with 100+ items
  - [ ] Verify pagination works
  - [ ] Verify search/filter still responsive

### Responsive Design
- [ ] **Mobile View (< 768px)**
  - [ ] Test all pages on mobile
  - [ ] Verify layout adapts
  - [ ] Verify buttons are touch-friendly
  - [ ] Verify forms are usable

- [ ] **Tablet View (768px - 1024px)**
  - [ ] Test all pages on tablet
  - [ ] Verify layout is appropriate

- [ ] **Desktop View (> 1024px)**
  - [ ] Test all pages on desktop
  - [ ] Verify optimal use of space

---

## 1️⃣5️⃣ WHATSAPP INTEGRATION

### WhatsApp Message Generation
- [ ] **After Checkout Request**
  - [ ] Submit checkout request
  - [ ] Verify WhatsApp message modal appears
  - [ ] Verify message includes all details
  - [ ] Click "Copy to Clipboard"
  - [ ] Verify copy confirmation
  - [ ] Paste message
  - [ ] Verify message format is correct

- [ ] **On Transaction Detail (Pending)**
  - [ ] Navigate to pending transaction
  - [ ] Verify "Next Step: Send WhatsApp Message" section
  - [ ] Verify message is generated
  - [ ] Copy message
  - [ ] Verify format is correct

---

## 📊 TEST SUMMARY

After completing all tests:

- [ ] **Total Tests Passed**: _____ / _____
- [ ] **Total Tests Failed**: _____
- [ ] **Critical Issues Found**: _____
- [ ] **Minor Issues Found**: _____

### Issues Found:
1. ________________________________________________________
2. ________________________________________________________
3. ________________________________________________________

### Notes:
________________________________________________________
________________________________________________________
________________________________________________________

---

## ✅ SIGN-OFF

**Tester Name**: ________________________  
**Date**: ________________________  
**System Version**: ________________________  
**Status**: ☐ Pass ☐ Fail ☐ Needs Review

---

**Last Updated**: November 5, 2025


# 🧪 Complete System Walkthrough Test Guide

This document provides a step-by-step walkthrough to test all features of the MSA Inventory system.

## Setup

**Backend:** `http://localhost:5001`  
**Frontend:** `http://localhost:3021`

## Test Accounts

### 7 Team Accounts (Base Users)
1. **IAW** - `iaw@msa.com` / `iaw123`
2. **Hope** - `hope@msa.com` / `hope123`
3. **Submissions** - `submissions@msa.com` / `submissions123`
4. **EPT** - `ept@msa.com` / `ept123`
5. **Ladders** - `ladders@msa.com` / `ladders123`
6. **Brothers Social** - `brothers@msa.com` / `brothers123`
7. **Sisters Social** - `sisters@msa.com` / `sisters123`

### Admin Account
- **Admin** - `admin@msa.com` / `admin123`

---

## Walkthrough Steps

### Phase 1: Admin Setup & Item Management

#### Step 1.1: Login as Admin
1. Go to `http://localhost:3021/login`
2. Click "Login as Admin (Full Access)" quick login button
3. ✅ Verify: Redirected to dashboard
4. ✅ Verify: Dashboard shows "Total Items", "Active Transactions", "Total Users", "Overdue Items"

#### Step 1.2: Add New Items
1. Click "Add New Item" in sidebar OR Dashboard Quick Action
2. Fill form:
   - **Name:** "Extension Cord (10ft)"
   - **Description:** "Heavy duty extension cord"
   - **Category:** "Electronics"
   - **Sub-Category:** "Cables"
   - **Total Quantity:** 5
   - **Unit:** "piece"
   - **Condition:** "Good"
   - **Status:** "Active"
   - ✅ Check "Checkoutable"
   - **Location:** Building: "Storage", Room: "A1", Shelf: "Top"
3. Click "Create Item"
4. ✅ Verify: Success message, redirected to Items list
5. ✅ Verify: Item appears in list

#### Step 1.3: Add More Test Items
Add at least 3 more items:
- "Ladder (8ft)" - Category: "Equipment", Quantity: 2
- "Table (Folding)" - Category: "Furniture", Quantity: 10
- "Speaker System" - Category: "Electronics", Quantity: 1

#### Step 1.4: Edit an Item
1. From Items list, click on any item
2. Click "Edit" button
3. Change quantity or description
4. Click "Update Item"
5. ✅ Verify: Changes saved

---

### Phase 2: Team Member Experience (Base Users)

#### Step 2.1: Login as Team Member (IAW)
1. Logout from Admin
2. Go to login page
3. Click "🌟 IAW Team" quick login
4. ✅ Verify: Dashboard shows simplified view:
   - "My Active Checkouts" (should be 0)
   - "My Overdue" (should be 0)
   - NO "Total Items" or "Total Users" cards

#### Step 2.2: Browse Items
1. Click "Items" in sidebar
2. ✅ Verify: Can see all items (shared inventory)
3. ✅ Verify: Cannot see "Add New Item" button
4. Click on an item to view details
5. ✅ Verify: Can view item details but no edit/delete buttons

#### Step 2.3: Request Checkout
1. From item detail page, click "Checkout" or "Request Item"
2. Fill checkout form:
   - **Quantity:** 1
   - **Purpose:** "For event setup"
   - **Expected Return Date:** 2 days from now
   - **Destination:** Building: "Event Hall", Room: "Main"
   - **Notes:** "Need for Friday event"
3. Click "Submit Request"
4. ✅ Verify: Success message "Checkout request submitted for admin approval"
5. ✅ Verify: Status shows "Pending"

#### Step 2.4: View My Transactions
1. Click "Transactions" in sidebar
2. ✅ Verify: Only see own transactions
3. ✅ Verify: See the pending request you just created
4. Click on transaction to view details
5. ✅ Verify: See all transaction details

#### Step 2.5: Test Reservation System
1. Logout
2. Login as different team (e.g., "Hope Team")
3. Try to checkout the SAME item that IAW just requested
4. ✅ Verify: System calculates availability correctly (reserves pending requests)
5. If item has quantity > 1, try requesting remaining quantity
6. ✅ Verify: Can only request what's actually available after reservations

---

### Phase 3: Admin Approval Process

#### Step 3.1: Login as Admin
1. Login as admin again
2. Click "Admin Panel" in sidebar

#### Step 3.2: Review Pending Approvals
1. In Admin Panel, click "Pending Approvals" tab
2. ✅ Verify: See all pending checkout requests from all teams
3. ✅ Verify: Each card shows:
   - Item name
   - User name and team
   - Quantity
   - Purpose
   - Expected return date

#### Step 3.3: Approve a Request
1. Find a pending request
2. Click "Approve" button
3. ✅ Verify: Request approved
4. ✅ Verify: Removed from pending list
5. ✅ Verify: Transaction status changed to "active"
6. ✅ Verify: Item available quantity decreased

#### Step 3.4: Reject a Request
1. Find another pending request
2. Click "Reject" button
3. Enter rejection reason: "Item needed for priority event"
4. Click OK
5. ✅ Verify: Request rejected
6. ✅ Verify: Removed from pending list
7. ✅ Verify: Status shows "rejected"

---

### Phase 4: Guest Request System

#### Step 4.1: Access Guest Request Form
1. Logout
2. Go to `http://localhost:3021/guest` (no login required)
3. ✅ Verify: Simple form appears

#### Step 4.2: Submit Guest Request
1. Select Team: "IAW"
2. Item Needed: "Extension Cord (10ft)"
3. Your Name: "John Guest"
4. Email: "john@example.com"
5. Purpose: "Need for community event"
6. **Required:** Upload photo of item
7. **Required:** Upload departure photo
8. Click "Submit Request"
9. ✅ Verify: Success message, confirmation screen

#### Step 4.3: Admin Review Guest Request
1. Login as admin
2. Go to Admin Panel
3. Click "Guest Requests" tab
4. ✅ Verify: See the guest request submitted
5. ✅ Verify: Both photos display correctly
6. ✅ Verify: See requester name, email, purpose, team
7. Click "Approve" or "Reject"
8. ✅ Verify: Action completes successfully

---

### Phase 5: Return Items

#### Step 5.1: Team Member Returns Item
1. Login as team member who has active checkout
2. Go to Transactions
3. Find active transaction
4. Click on it
5. Click "Return Item" button
6. Select return condition: "Good"
7. Add return notes (optional)
8. Click "Return"
9. ✅ Verify: Item returned successfully
10. ✅ Verify: Transaction status = "returned"
11. ✅ Verify: Item available quantity increased

---

### Phase 6: Test All 7 Teams

#### Step 6.1: Quick Login Each Team
Test quick login for all 7 teams:
- ✅ IAW Team
- ✅ Hope Team  
- ✅ Submissions Team
- ✅ EPT Team
- ✅ Ladders Team
- ✅ Brothers Social
- ✅ Sisters Social
- ✅ R2R Team

For each team:
1. Logout
2. Quick login as team
3. ✅ Verify: Dashboard loads (simplified view)
4. ✅ Verify: Can browse items
5. ✅ Verify: Can create checkout request
6. ✅ Verify: Can view own transactions only

---

### Phase 7: Admin Features Verification

#### Step 7.1: Admin Dashboard
1. Login as admin
2. ✅ Verify: Full dashboard with all stats
3. ✅ Verify: "Total Items", "Active Transactions", "Total Users", "Overdue Items"
4. ✅ Verify: Recent Activity shows all team activity
5. ✅ Verify: Top Items section visible

#### Step 7.2: User Management
1. Click "User Management" in sidebar
2. ✅ Verify: Can view all users
3. ✅ Verify: Can create new user
4. ✅ Verify: Can edit user details
5. ✅ Verify: Can change user roles/permissions

#### Step 7.3: Analytics
1. Click "Analytics & Reports"
2. ✅ Verify: Dashboard analytics page loads
3. ✅ Verify: Item utilization charts
4. ✅ Verify: User activity reports
5. ✅ Verify: Overdue patterns

#### Step 7.4: QR Code Generation
1. Click "Print QR Codes"
2. ✅ Verify: Page loads with item list
3. Click "Generate All QR Codes"
4. ✅ Verify: QR codes generated for all items
5. ✅ Verify: QR codes display correctly
6. ✅ Verify: Print layout works

#### Step 7.5: Notifications
1. Click "Notifications" bell icon
2. ✅ Verify: Can see notifications
3. ✅ Verify: Mark as read works
4. ✅ Verify: Can delete notifications

---

### Phase 8: Cross-Team Inventory Sharing

#### Step 8.1: Verify Shared Inventory
1. Login as IAW team
2. Note available quantity of an item (e.g., "Extension Cord" has 4 available)
3. Logout

4. Login as Hope team
5. ✅ Verify: See same available quantity (4) for same item
6. Create checkout request for 2 units
7. ✅ Verify: Request submitted
8. Logout

9. Login as Admin
10. Approve Hope's request
11. ✅ Verify: Item available quantity now shows 2 (4 - 2 = 2)
12. Logout

13. Login as Ladders team
14. ✅ Verify: See updated quantity (2 available)
15. ✅ Verify: Cannot request more than 2 units

---

### Phase 9: Edge Cases & Error Handling

#### Step 9.1: Insufficient Quantity
1. As any team, try to request more items than available
2. ✅ Verify: Error message "Only X units available"
3. ✅ Verify: Request not created

#### Step 9.2: Reservation Blocking
1. Item has quantity 1 available
2. Team A requests it (pending)
3. Team B tries to request same item
4. ✅ Verify: Team B blocked or sees reduced availability
5. Admin approves Team A
6. Team B tries again
7. ✅ Verify: Team B still blocked (now 0 available)

#### Step 9.3: Return Increases Availability
1. Item has 0 available (all checked out)
2. User returns 1 unit
3. ✅ Verify: Available quantity = 1
4. Another team can now request it

---

## ✅ Checklist Summary

### Admin Features
- [ ] Login works
- [ ] Dashboard shows all metrics
- [ ] Can add items
- [ ] Can edit items
- [ ] Can delete items
- [ ] Can approve/reject transactions
- [ ] Can approve/reject guest requests
- [ ] Can manage users
- [ ] Can view analytics
- [ ] Can generate QR codes
- [ ] Can view all transactions

### Team Member Features (All 7 Teams)
- [ ] Quick login works for each team
- [ ] Simplified dashboard (only personal metrics)
- [ ] Can view all items (shared inventory)
- [ ] Can request checkout
- [ ] Can view own transactions
- [ ] Can return items
- [ ] Cannot add/edit/delete items
- [ ] Cannot see other teams' transactions
- [ ] Cannot approve requests

### Guest Features
- [ ] Can access guest form without login
- [ ] Can submit request with photos
- [ ] Photos required and validated
- [ ] Request appears in admin panel

### System Features
- [ ] Inventory shared across all teams
- [ ] Reservations block overbooking
- [ ] Returns restore availability
- [ ] Team isolation in transactions (users see only their own)
- [ ] Notifications work

---

## Expected Issues to Watch For

1. **404 errors** - Check routes match (`/items/add` not `/items/new`)
2. **JSX warnings** - Should be fixed in PrintQRCodes
3. **CORS errors** - Backend should allow localhost:3021
4. **Token expiry** - May need to re-login during long tests
5. **Reservation math** - Ensure pending requests count toward availability

---

## Notes

- All teams share the same inventory
- Each team can request any item
- Once requested (pending or active), quantity is reserved
- Only admins/managers can approve requests
- Base users see only their own data in dashboard/transactions
- Guest requests require photos before submission


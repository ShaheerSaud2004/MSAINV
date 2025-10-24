# 🔐 Admin Panel Guide

## 🎯 Overview

The Admin Panel is a comprehensive control center for administrators and managers to oversee all system activities, approve checkout requests, view login history, and monitor the inventory system.

## 🚀 Access

**URL:** http://localhost:3001/admin

**Required Permissions:** Admin or Manager role only

### Quick Access:
- Login as **Admin** (`admin@msa.com`) for full access
- Login as **Manager** (`manager@msa.com`) for approval access

## 📊 Dashboard Overview

The Admin Panel displays 4 key statistics at the top:

### Stats Cards:

1. **⏰ Pending Approvals** (Yellow)
   - Number of checkout requests waiting for approval
   - Click "Pending Approvals" tab to review

2. **✅ Active Checkouts** (Green)
   - Number of items currently checked out
   - Shows items in use across the organization

3. **👥 Active Users** (Blue)
   - Number of unique users who have checked out items
   - Tracks system engagement

4. **⚠️ Overdue Items** (Red)
   - Number of items not returned by expected date
   - Requires immediate attention

## 📑 Three Main Tabs

### 1. ⏰ Pending Approvals Tab

**Purpose:** Review and approve/reject all checkout requests

**What You See:**
- List of all pending checkout requests
- Each request shows:
  - User name and email
  - Item name and quantity
  - Purpose of checkout
  - Expected return date
  - Any special notes
  - Request timestamp

**Actions Available:**
- ✅ **Approve Button** - Approve the checkout request
  - Updates item to "active" status
  - Reduces available quantity
  - Sends confirmation to user
  
- ❌ **Reject Button** - Deny the checkout request
  - Prompts for rejection reason
  - Returns item to available inventory
  - Notifies user with reason

- 👁️ **View Details** - See full transaction details

**Important:** ALL checkout requests now require admin approval for accountability!

### 2. 📋 Recent Activity Tab

**Purpose:** Monitor all recent transactions in the system

**What You See:**
- Last 20 transactions (most recent first)
- Transaction status badges:
  - 🟡 **Pending** - Awaiting approval
  - 🟢 **Active** - Currently checked out
  - 🔵 **Returned** - Item returned
  - 🔴 **OVERDUE** - Past due date

**Details Shown:**
- Item name and quantity
- User who checked out
- Transaction type (checkout/return)
- Timestamp
- Overdue status (if applicable)

**Click any transaction** to view full details

### 3. 👥 Login Activity Tab

**Purpose:** Track who logged into the system and when

**What You See:**
- Table of recent logins (last 50)
- Columns:
  - **User**: Name and email
  - **Role**: Admin/Manager/User badge
  - **Timestamp**: Date and time of login
  - **IP Address**: Where they logged in from
  - **Device**: Browser/device information

**Security Benefits:**
- Detect unauthorized access attempts
- Monitor user activity patterns
- Verify login locations
- Track admin access

## ✅ Approval Workflow

### How Checkout Approval Works:

```
User Requests Checkout
        ↓
Form filled with:
• Name, Team, Phone, Email
• Quantity & Return Date
• Purpose & Details
        ↓
Request sent to Admin Panel
        ↓
Admin/Manager Reviews:
• User information
• Item availability
• Purpose justification
• Return date reasonableness
        ↓
Decision:
   Approve → Item checked out
   Reject → Request denied with reason
        ↓
User Notified
```

### Approval Best Practices:

✅ **Approve When:**
- Valid business purpose stated
- Reasonable return date
- User information complete
- Item available

❌ **Reject When:**
- Vague or missing purpose
- Unrealistic return timeframe
- Duplicate/suspicious request
- Item needed elsewhere

## 🔔 Notifications

Admins receive notifications for:
- 📬 New checkout requests
- ⏰ Overdue items
- ⚠️ System alerts
- 📊 Important updates

## 🎛️ Features

### Real-Time Updates
- Stats update when you approve/reject
- Automatically refreshes data
- No need to manually reload

### Visual Indicators
- Color-coded status badges
- Icon-based navigation
- Intuitive button design

### Quick Actions
- One-click approve/reject
- Direct links to details
- Seamless workflow

## 🔒 Security

### Access Control:
- Only Admin and Manager roles can access
- Regular users see "Access Denied"
- JWT authentication required
- Session timeout protection

### Login Tracking:
- Every login is logged
- IP address recorded
- Device information captured
- Timestamp stored

### Audit Trail:
- All approvals/rejections recorded
- Action history maintained
- User accountability ensured

## 📱 Responsive Design

Works perfectly on:
- 💻 Desktop computers
- 📱 Tablets
- 🖥️ Large monitors
- Mobile phones (with horizontal scroll for tables)

## 🎯 Common Tasks

### Task 1: Approve a Checkout Request
1. Go to Admin Panel
2. Click "Pending Approvals" tab
3. Review request details
4. Click green "Approve" button
5. User receives confirmation
6. Item becomes active checkout

### Task 2: Reject a Request
1. Find request in "Pending Approvals"
2. Click red "Reject" button
3. Enter reason for rejection
4. User receives notification with reason
5. Item remains available

### Task 3: Check Who's Logged In
1. Go to Admin Panel
2. Click "Login Activity" tab
3. See recent logins
4. Review timestamps and IPs
5. Verify legitimate access

### Task 4: Monitor Overdue Items
1. Check red "Overdue Items" stat card
2. Go to "Recent Activity" tab
3. Look for red "OVERDUE" badges
4. Take appropriate action
5. Contact users to return items

## 💡 Tips & Tricks

### Quick Approval:
- Review purpose carefully
- Check return date is reasonable
- Verify user contact info
- Approve with one click

### Batch Processing:
- Review multiple requests at once
- Sort by urgency
- Approve similar requests together

### Monitoring:
- Check panel daily
- Review login activity weekly
- Follow up on overdue items immediately
- Keep pending approvals list empty

## ⚙️ Settings

### Customization Options:
- Adjustable table page sizes
- Sortable columns
- Filterable data
- Export capabilities (future)

## 🎉 Benefits

1. **Full Control** - See everything happening in the system
2. **Accountability** - Every action is tracked and recorded
3. **Security** - Monitor access and detect anomalies
4. **Efficiency** - Quick approval/rejection workflow
5. **Transparency** - Complete audit trail
6. **Peace of Mind** - Know exactly who has what

## 📚 Additional Resources

- **Login System:** See `QUICK_LOGIN.md`
- **Checkout Process:** See `CHECKOUT_FEATURES.md`
- **QR Codes:** See documentation in sidebar

---

## 🌐 Access URLs

- **Admin Panel:** http://localhost:3001/admin
- **Login Page:** http://localhost:3001/login
- **Dashboard:** http://localhost:3001/dashboard

---

**Remember:** As an admin, you're responsible for ensuring items are properly tracked and returned. Use the admin panel regularly to maintain system integrity! 🛡️


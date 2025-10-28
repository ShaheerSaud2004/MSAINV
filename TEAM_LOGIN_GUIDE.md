# 🎯 Team Auto-Login System

## Overview

The MSA Inventory system now has **7 separate team accounts**, each with their own isolated storage and inventory. Teams can log in with a single click!

---

## 🌟 Available Teams

### 1. IAW
- **Email:** `iaw@msa.com`
- **Password:** `iaw123`
- **Color:** Blue 🔵
- **Icon:** 🌟

### 2. Ladders
- **Email:** `ladders@msa.com`
- **Password:** `ladders123`
- **Color:** Purple 🟣
- **Icon:** 🪜

### 3. R2R
- **Email:** `r2r@msa.com`
- **Password:** `r2r123`
- **Color:** Green 🟢
- **Icon:** 🎯

### 4. Brothers Social
- **Email:** `brothers@msa.com`
- **Password:** `brothers123`
- **Color:** Amber 🟠
- **Icon:** 👥

### 5. Sister Social
- **Email:** `sisters@msa.com`
- **Password:** `sisters123`
- **Color:** Pink 🔴
- **Icon:** 👭

### 6. Hope
- **Email:** `hope@msa.com`
- **Password:** `hope123`
- **Color:** Teal 🩵
- **Icon:** 💚

### 7. Submissions
- **Email:** `submissions@msa.com`
- **Password:** `submissions123`
- **Color:** Red 🔴
- **Icon:** 📝

---

## 🚀 How to Use

### Quick Login on Login Page

1. Go to: `http://localhost:3021/login`
2. Scroll down to see **⚡ Quick Team Login** section
3. Click on any team button to instantly log in
4. Each team has their own color-coded button with an emoji

### What You'll See After Login

- **Dashboard Header:** Your team name appears in a colored badge
- **Team-Specific Data:** Only see items and transactions for your team
- **Welcome Message:** "Welcome back! Here's what's happening with your [Team Name]'s inventory."

---

## 🔒 Team Isolation

### Separate Storage

Each team has:
- ✅ **Separate Items** - Teams can only see their own inventory
- ✅ **Separate Transactions** - Checkout/return history is team-specific
- ✅ **Separate Analytics** - Dashboard shows only team data
- ✅ **Full Admin Access** - Each team can manage their own inventory

### How It Works

- When a user logs in, their `team` field is stored
- All API requests automatically filter by team
- Items created by a team are tagged with that team
- Transactions are also team-specific

---

## 🛠️ Technical Implementation

### Frontend Changes

1. **Login Page** (`client/src/pages/Login.js`)
   - Added 7 color-coded team buttons
   - One-click auto-login for each team
   - Emoji icons and hover effects

2. **Dashboard** (`client/src/pages/Dashboard.js`)
   - Team badge displayed next to title
   - Dynamic welcome message with team name
   - Uses `useAuth()` to get current user's team

3. **Styling** (`client/src/index.css`)
   - Team-specific color classes
   - Hover effects and animations

### Backend Changes

1. **Models Updated**
   - `Item.js`: Added `team` field (required, indexed)
   - `Transaction.js`: Added `team` field (required, indexed)

2. **Routes Updated**
   - `items.js`: Automatically filters by team on GET, sets team on POST
   - `transactions.js`: Filters by team on GET, sets team on POST/checkout

3. **Team Accounts**
   - Script: `server/scripts/createTeamAccounts.js`
   - Creates users with full admin permissions
   - Works with both MongoDB and JSON storage

---

## 📝 Adding More Teams

To add more teams:

1. Edit `server/scripts/createTeamAccounts.js`
2. Add a new team object to the `teams` array:
```javascript
{
  name: 'New Team Name',
  email: 'newteam@msa.com',
  password: 'newteam123',
  team: 'New Team',
  role: 'admin',
  color: '#HEXCODE'
}
```
3. Run: `cd server && STORAGE_MODE=json node scripts/createTeamAccounts.js`
4. Update the login page to include the new team button

---

## 🧪 Testing

### Test Team Isolation

1. Login as **IAW** team
2. Create some items (e.g., "IAW Projector")
3. Logout
4. Login as **Ladders** team
5. Create different items (e.g., "Ladders Speaker")
6. Verify that IAW's items don't show up for Ladders

### Test Checkout Flow

1. Login as any team
2. Create an item
3. Request checkout (will be pending - needs approval)
4. Item quantity should NOT decrease until approved
5. Approve the checkout (if admin/manager)
6. Verify item quantity decreases

---

## 🎨 UI Features

### Team Badge
- Appears on Dashboard next to "Dashboard" title
- Color-coded gradient (blue-to-indigo)
- Animated scale-in effect

### Quick Login Buttons
- Grid layout (1 column on mobile, responsive)
- Color-coded borders and backgrounds
- Hover effects (scale + shadow)
- Arrow icon on the right
- Team emoji on the left

---

## 📍 File Locations

### Frontend
- `client/src/pages/Login.js` - Auto-login buttons
- `client/src/pages/Dashboard.js` - Team badge display
- `client/src/index.css` - Team color styles

### Backend
- `server/models/Item.js` - Team field in Item model
- `server/models/Transaction.js` - Team field in Transaction model
- `server/routes/items.js` - Team filtering for items
- `server/routes/transactions.js` - Team filtering for transactions
- `server/scripts/createTeamAccounts.js` - Team account creation script

---

## 🔗 Related Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Start on Custom Ports](./START_CUSTOM_PORTS.md)
- [Approval & Photo System](./APPROVAL_AND_PHOTO_SYSTEM.md)

---

## 💡 Tips

- Each team is fully isolated - perfect for different departments or projects
- Team admins have full control over their inventory
- Use color-coding to quickly identify which team you're logged in as
- The team badge is always visible on the Dashboard for easy reference

---

**Happy Team Managing! 🎉**


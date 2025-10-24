# 🚀 Quick Start Guide - MSA Inventory Management System

## Overview

This is a comprehensive full-stack inventory management system with QR code integration built with:
- **Backend**: Node.js + Express + MongoDB (or JSON storage)
- **Frontend**: React + Tailwind CSS
- **Features**: QR Code scanning, role-based access, real-time notifications, analytics

## 📦 Installation

### Prerequisites
- Node.js v16+ installed
- MongoDB installed (optional - can use JSON storage mode)
- A modern web browser
- Camera access for QR scanning (optional)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5001
NODE_ENV=development

# For JSON storage (no MongoDB needed)
STORAGE_MODE=json

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
CLIENT_URL=http://localhost:3000

# Optional: Email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Create Frontend Environment

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on: `http://localhost:5001`

### Start Frontend App

In a new terminal:

```bash
cd client
npm start
```

Frontend will run on: `http://localhost:3000`

## 👤 First Time Setup

1. **Register an Account**
   - Navigate to `http://localhost:3000`
   - Click "Register here"
   - Fill in your details
   - You'll be automatically logged in

2. **Upgrade to Admin (if using JSON storage)**
   - Stop the server
   - Open `server/storage/data/users.json`
   - Find your user and change `"role": "user"` to `"role": "admin"`
   - Restart the server

3. **Add Your First Item**
   - Go to Items → Add Item
   - Fill in item details
   - Save

4. **Generate QR Code**
   - Open the item detail page
   - Click "Generate QR"
   - Print or save the QR code

5. **Test QR Scanning**
   - Go to QR Scanner page
   - Click "Start Camera" or enter QR code manually
   - Select action (checkout, return, reserve, view)

## 🎯 Key Features

### QR Code Workflow
1. **Generate**: Each item gets a unique QR code (format: `ITEM_xxxxx`)
2. **Print**: Print QR codes and attach to physical items
3. **Scan**: Users scan QR code with mobile device
4. **Action**: Quick checkout, return, or reserve items

### User Roles

**Admin**
- Full system access
- Manage users and items
- Approve/reject checkouts
- View analytics

**Manager**
- Manage items
- Approve/reject checkouts
- View analytics
- Cannot manage users

**User**
- Checkout items
- Return items
- View own transactions

### Transaction Workflow

**Checkout**
1. User requests item
2. System checks availability
3. If requires approval → Pending status
4. If approved/no approval → Active status
5. Quantity automatically reduced

**Return**
1. User initiates return
2. System checks for overdue
3. If overdue → Penalty applied
4. Status changes to Returned
5. Quantity restored

## 📱 Using QR Scanner

### On Desktop
1. Use "Enter QR Code Manually" section
2. Type the QR code (e.g., `ITEM_xxxxx`)
3. Click "Look Up Item"

### On Mobile
1. Click "Start Camera"
2. Grant camera permissions
3. Point camera at QR code
4. System automatically reads code

### QR Code Format
```json
{
  "id": "item-id-here",
  "name": "Item Name",
  "qrCode": "ITEM_xxxxx",
  "type": "item"
}
```

## 🔧 Configuration Options

### Storage Modes

**JSON Storage (Default for demo)**
```env
STORAGE_MODE=json
```
- No database required
- Data stored in `server/storage/data/`
- Perfect for testing and demos

**MongoDB Storage (Production)**
```env
MONGODB_URI=mongodb://localhost:27017/msa-inventory
STORAGE_MODE=mongodb
```
- Better performance
- Advanced querying
- Recommended for production

### Background Jobs

The system runs automated background jobs:
- **Overdue Detection**: Daily at midnight
- **Due Soon Reminders**: Daily at 9 AM

These are configured in `server/server.js` using cron.

## 📊 Dashboard Features

- **Real-time Stats**: Total items, active checkouts, overdue items
- **Recent Activity**: Last 10 transactions
- **Top Items**: Most checked-out items
- **Category Distribution**: Visual breakdown
- **Alerts**: Overdue and pending approval notifications

## 🔐 Security Features

- JWT authentication with 7-day expiry
- Bcrypt password hashing (12 salt rounds)
- Rate limiting (100 requests per 15 minutes)
- Role-based access control
- Input validation on all endpoints
- Helmet.js security headers

## 🐛 Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Change PORT in .env file
PORT=5002
```

**MongoDB connection error**
```bash
# Switch to JSON storage mode
STORAGE_MODE=json
```

### Frontend Issues

**API connection error**
```bash
# Check REACT_APP_API_URL in client/.env
# Make sure backend is running
```

**Camera not working**
```bash
# Use manual QR code entry
# Check browser camera permissions
# Try HTTPS (camera requires secure context)
```

### Common Errors

**"User with this email already exists"**
- Email is already registered
- Use login instead or register with different email

**"Item not found"**
- QR code format is incorrect
- Item may have been deleted
- Check the QR code matches format: ITEM_xxxxx

**"Not authorized"**
- JWT token expired
- Log out and log back in
- Check localStorage for token

## 📚 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### QR Codes
- `GET /api/qr/generate/:itemId` - Generate QR
- `POST /api/qr/scan` - Process QR scan
- `GET /api/qr/item/:qrCode` - Get item by QR

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions/checkout` - Checkout item
- `POST /api/transactions/:id/return` - Return item
- `POST /api/transactions/:id/approve` - Approve
- `POST /api/transactions/:id/reject` - Reject

## 💡 Tips & Best Practices

1. **QR Codes**: Use durable labels for QR codes on physical items
2. **Categories**: Use consistent category names for better organization
3. **Quantities**: Set realistic quantities and update regularly
4. **Approval Workflow**: Enable for high-value or restricted items
5. **Notifications**: Configure email for important alerts
6. **Backups**: If using JSON storage, backup `server/storage/data/` regularly

## 🚀 Next Steps

1. Customize categories for your organization
2. Add your inventory items
3. Generate and print QR codes
4. Train users on QR scanning workflow
5. Set up email notifications
6. Configure approval workflow for restricted items
7. Review analytics regularly

## 📞 Support

For issues or questions:
- Check the main README.md
- Review the API documentation
- Check browser console for errors
- Review server logs

## 🎉 You're Ready!

Your MSA Inventory Management System is now set up and ready to use!

Visit http://localhost:3000 to get started.


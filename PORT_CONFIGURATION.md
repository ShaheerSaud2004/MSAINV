# 🌐 MSA Inventory - Port Configuration

## ✅ Current Setup

Your MSA Inventory Management System is now running on:

### Backend Server
- **Port**: 3132
- **URL**: http://localhost:3132
- **API Endpoint**: http://localhost:3132/api
- **Health Check**: http://localhost:3132/api/health
- **Status**: ✅ Running

### Frontend Application
- **Port**: 3001
- **URL**: http://localhost:3001
- **Status**: ✅ Running

## 🚀 Access Your Application

**Open your browser and visit:**
```
http://localhost:3001
```

This is where you'll access the full inventory management system interface!

## 📋 Configuration Files

### Backend Configuration
File: `server/.env`
```env
PORT=3132
NODE_ENV=development
STORAGE_MODE=json
JWT_SECRET=msa-inventory-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3001
```

### Frontend Configuration
File: `client/.env`
```env
PORT=3001
REACT_APP_API_URL=http://localhost:3132/api
```

## 🔄 How It Works

1. **Frontend** runs on port **3001** (your browser interface)
2. **Backend API** runs on port **3132** (handles all data)
3. Frontend makes API calls to `http://localhost:3132/api`
4. Backend allows requests from `http://localhost:3001` (CORS)

## 🎯 Next Steps

1. **Open http://localhost:3001** in your browser
2. Click "Register here" to create an account
3. After registering, upgrade to admin (one-time):
   ```bash
   cd /Users/shaheersaud/MSAInventory/server/storage/data
   # Edit users.json and change "role":"user" to "role":"admin"
   ```

## 🛠️ Managing the Servers

### Check Server Status
```bash
# Check if backend is running
curl http://localhost:3132/api/health

# Check if frontend is running
lsof -ti:3001
```

### Stop Servers
```bash
# Stop backend
pkill -f "nodemon server.js"

# Stop frontend
pkill -f "react-scripts start"
```

### Restart Servers
```bash
# Start backend
cd /Users/shaheersaud/MSAInventory/server && npm run dev

# Start frontend (in new terminal)
cd /Users/shaheersaud/MSAInventory/client && npm start
```

## 🔧 Change Ports Again (if needed)

### To change Backend port:
Edit `server/.env` and change `PORT=3132` to your desired port

### To change Frontend port:
Edit `client/.env` and change `PORT=3001` to your desired port

**Important**: If you change ports, also update:
- `CLIENT_URL` in `server/.env` to match frontend port
- `REACT_APP_API_URL` in `client/.env` to match backend port

## 📱 Mobile Access (Optional)

To access from your phone on the same network:

1. Find your computer's local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update configurations to use your IP instead of localhost

3. Access from phone: `http://YOUR_IP:3001`

## ✨ You're All Set!

Your inventory management system is running and ready to use at:
**http://localhost:3001**

Enjoy! 🎉


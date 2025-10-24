# 🚀 Starting MSA Inventory on Port 3132

## Quick Setup Instructions

### Step 1: Backend Configuration

Create `server/.env` file with this content:

```env
PORT=3132
NODE_ENV=development
STORAGE_MODE=json
JWT_SECRET=msa-inventory-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=M
```

### Step 2: Frontend Configuration

Create `client/.env` file with this content:

```env
REACT_APP_API_URL=http://localhost:3132/api
```

### Step 3: Start Backend

```bash
cd server
npm install
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   MSA Inventory Management System                        ║
║   Server running on port 3132                            ║
║   Environment: development                               ║
║   Storage Mode: json                                     ║
║                                                           ║
║   API Health: http://localhost:3132/api/health           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Start Frontend (New Terminal)

```bash
cd client
npm install
npm start
```

Frontend will open at: http://localhost:3000

## Quick Commands

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm start
```

## Testing the Setup

1. Visit: http://localhost:3000
2. Register a new account
3. Backend API is at: http://localhost:3132/api

## Notes

- Backend runs on: **3132**
- Frontend runs on: **3000** (default React port)
- The frontend connects to backend at `localhost:3132/api`

Enjoy! 🎉


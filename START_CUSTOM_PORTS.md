# Running MSA Inventory on Custom Ports

## Port Configuration

Your application is now configured to run on:
- **Frontend (React)**: http://localhost:3021
- **Backend (API)**: http://localhost:3022

## Quick Start

### Option 1: Using the start script (Recommended)
```bash
npm run dev:custom
```

This will start both the client and server in one terminal.

### Option 2: Manual start in separate terminals

**Terminal 1 - Start the Backend:**
```bash
cd server
npm run dev
```
The server will start on port 3022.

**Terminal 2 - Start the Frontend:**
```bash
cd client
npm start
```
The React app will start on port 3021.

## Configuration Files Created

### Client Configuration (`client/.env`)
```env
PORT=3021
REACT_APP_API_URL=http://localhost:3022/api
```

### Server Configuration (`server/.env`)
```env
PORT=3022
NODE_ENV=development
CLIENT_URL=http://localhost:3021
STORAGE_MODE=mongodb
MONGODB_URI=mongodb://localhost:27017/msa-inventory
JWT_SECRET=your-secret-key-change-in-production-please
JWT_EXPIRE=30d
```

## CORS Configuration
The server has been updated to allow requests from:
- http://localhost:3000 (default)
- http://localhost:3001
- http://localhost:3021 (your custom port) ✅
- http://localhost:3022 (server port) ✅

## Accessing the Application

Once both servers are running:
1. Open your browser
2. Go to: **http://localhost:3021**
3. The frontend will communicate with the backend at http://localhost:3022/api

## Switching Back to Default Ports

To use the default ports (3000 for client, 5001 for server):

1. **Delete or rename the .env files:**
   ```bash
   mv client/.env client/.env.backup
   mv server/.env server/.env.backup
   ```

2. **Or update the PORT values in the .env files:**
   - Client: Change `PORT=3021` to `PORT=3000`
   - Server: Change `PORT=3022` to `PORT=5001`

## Troubleshooting

### Port Already in Use
If you see "Port 3021 is already in use", either:
- Kill the process using that port:
  ```bash
  lsof -ti:3021 | xargs kill -9
  ```
- Or change the PORT in the respective .env file

### Cannot Connect to API
1. Make sure both servers are running
2. Check that the server .env has `PORT=3022`
3. Check that the client .env has `REACT_APP_API_URL=http://localhost:3022/api`
4. Clear browser cache and restart both servers

### Environment Variables Not Loading
React requires a restart when .env files change:
1. Stop the React dev server (Ctrl+C)
2. Run `npm start` again

## Notes

- Environment variables in React must start with `REACT_APP_`
- Changes to .env files require restarting the development servers
- .env files are git-ignored for security (don't commit secrets!)
- Make sure MongoDB is running if using `STORAGE_MODE=mongodb`

## Security Reminder

⚠️ **Important**: Update the `JWT_SECRET` in `server/.env` before deploying to production!


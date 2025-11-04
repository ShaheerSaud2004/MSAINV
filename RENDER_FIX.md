# 🔧 Render Deployment Fix

## The Problem
Render is running `npm install` only at root level, which doesn't install server dependencies (like `dotenv`).

## ✅ Solution: Update Render Build Settings

### Step 1: Go to Render Dashboard
1. Open your Render dashboard
2. Click on your web service
3. Go to **"Settings"** tab

### Step 2: Update Build Command
Change the **Build Command** to:
```bash
npm run render-build
```

### Step 3: Update Start Command
Change the **Start Command** to:
```bash
npm run render-start
```

### Step 4: Save and Redeploy
1. Click **"Save Changes"**
2. Go to **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📋 Alternative: Direct Commands

If the scripts don't work, use these direct commands:

**Build Command:**
```bash
npm install && cd server && npm install && cd ../client && npm install && npm run build
```

**Start Command:**
```bash
cd server && node server.js
```

---

## ✅ What This Does

1. **Build Command (`npm run render-build`):**
   - Installs root dependencies
   - Installs server dependencies (including `dotenv`)
   - Installs client dependencies
   - Builds React frontend

2. **Start Command (`npm run render-start`):**
   - Changes to server directory
   - Runs the Node.js server
   - Serves both API and frontend

---

## 🎯 Quick Fix Steps

1. Open Render dashboard → Your service → Settings
2. Build Command: `npm run render-build`
3. Start Command: `npm run render-start`
4. Save → Manual Deploy

---

## 🔍 Why This Happened

- Root `package.json` doesn't have server dependencies
- Server dependencies are in `server/package.json`
- Render's default `npm install` only installs root dependencies
- We need to install server dependencies separately

---

After updating these settings, your deployment should work! 🚀


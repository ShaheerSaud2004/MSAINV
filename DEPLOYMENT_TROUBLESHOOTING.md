# 🚨 Deployment Troubleshooting Guide

Since you're having trouble with Render/Railway and can only use ngrok, here's a comprehensive guide to fix your deployment issues.

---

## 🔍 Common Issues & Quick Fixes

### Issue 1: Build Command Not Installing Dependencies

**Symptoms:**
- `Error: Cannot find module 'dotenv'`
- `Error: Cannot find module 'express'`
- Build fails immediately

**Fix:**
1. **For Render:**
   - Go to Render Dashboard → Your Service → Settings
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm run render-start`
   - Save and redeploy

2. **For Railway:**
   - Railway auto-detects, but verify:
   - Root `package.json` has build scripts
   - Check Railway logs for build errors

### Issue 2: Port Configuration

**Symptoms:**
- App doesn't start
- "Port already in use" errors
- App crashes on startup

**Fix:**
Make sure your `server.js` uses:
```javascript
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

✅ **Already fixed in your code!**

### Issue 3: Environment Variables Missing

**Symptoms:**
- `JWT_SECRET is not set` error
- Database connection fails
- 401 Unauthorized errors

**Fix:**
Set these in Render/Railway dashboard:

**Required Variables:**
```
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-key-min-32-characters
PORT=10000 (Render) or leave empty (Railway)
```

**How to set:**
- **Render:** Service → Environment → Add Variable
- **Railway:** Service → Variables → + New Variable

### Issue 4: MongoDB Connection Issues

**Symptoms:**
- "MongoServerError: connection timeout"
- "Authentication failed"

**Fix:**
1. **MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all)
   - Or add Render's IP ranges

2. **Check Connection String:**
   - Must include database name: `mongodb+srv://.../msa-inventory?retryWrites=true&w=majority`
   - Verify username/password are correct

### Issue 5: CORS Issues

**Symptoms:**
- "CORS policy" errors in browser
- Frontend can't connect to API

**Fix:**
Your `server.js` already allows all origins in production. Verify:
- Render: Same domain, no CORS needed ✅
- Railway: Same domain, no CORS needed ✅

---

## 🚀 Step-by-Step: Deploy to Render (Recommended)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free)

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repo: `ShaheerSaud2004/MSAINV`
3. Select branch: `main`

### Step 3: Configure Build Settings

**Build Command:**
```bash
npm run render-build
```

**Start Command:**
```bash
npm run render-start
```

**Environment:** `Node`

**Node Version:** `18.x` or `20.x`

### Step 4: Add Environment Variables

Click **"Environment"** tab, add:

```
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msa-inventory?retryWrites=true&w=majority
JWT_SECRET=generate-a-random-32-character-string-here
JWT_EXPIRES_IN=7d
PORT=10000
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Get your URL: `https://your-app.onrender.com`

### Step 6: Test
- Visit your URL
- Check `/api/health` endpoint
- Try logging in

---

## 🚂 Step-by-Step: Deploy to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `ShaheerSaud2004/MSAINV`

### Step 3: Add Environment Variables

Click **"Variables"** tab, add:

```
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msa-inventory?retryWrites=true&w=majority
JWT_SECRET=generate-a-random-32-character-string-here
JWT_EXPIRES_IN=7d
```

**Note:** Railway auto-assigns PORT, don't set it manually.

### Step 4: Configure Build

Railway usually auto-detects, but verify:
- **Root Directory:** Leave empty (root)
- **Build Command:** Auto-detected (or `npm run build`)
- **Start Command:** `cd server && node server.js`

### Step 5: Deploy
1. Railway auto-deploys on git push
2. Or click **"Deploy"** button
3. Get your URL: `https://your-app.up.railway.app`

---

## 🔧 Quick Fix Script

Run this to check your deployment readiness:

```bash
# Check if all dependencies are in package.json
cd server && npm list --depth=0
cd ../client && npm list --depth=0

# Verify environment variables are set (locally)
echo "JWT_SECRET: ${JWT_SECRET:+SET}"
echo "MONGODB_URI: ${MONGODB_URI:+SET}"

# Test build locally
npm run render-build
```

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [ ] All dependencies in `package.json` files
- [ ] Build scripts work locally (`npm run render-build`)
- [ ] Server starts locally (`npm run render-start`)
- [ ] MongoDB Atlas allows connections from `0.0.0.0/0`
- [ ] Environment variables ready (JWT_SECRET, MONGODB_URI)
- [ ] Git repository is up to date
- [ ] No hardcoded localhost URLs in code

---

## 🐛 Debugging Deployment Issues

### Check Build Logs

**Render:**
- Go to Service → Logs
- Look for build errors
- Check for missing dependencies

**Railway:**
- Go to Service → Deployments → Latest
- Click "View Logs"
- Look for errors

### Common Error Messages

**"Cannot find module 'dotenv'"**
- Fix: Build command must install server dependencies
- Use: `npm run render-build`

**"JWT_SECRET is not set"**
- Fix: Add JWT_SECRET to environment variables
- Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**"MongoServerError"**
- Fix: Check MongoDB Atlas network access
- Add `0.0.0.0/0` to allowed IPs
- Verify connection string is correct

**"Port already in use"**
- Fix: Use `process.env.PORT` (already in your code)
- Don't hardcode port numbers

---

## 💡 Alternative: Keep Using Ngrok (Temporary)

If deployment is still not working, you can:

1. **Keep ngrok running 24/7:**
   - Use ngrok paid plan ($8/month)
   - Or use free ngrok with auto-restart script

2. **Set up auto-restart for ngrok:**
   ```bash
   # Create a script to restart ngrok if it dies
   while true; do
     ngrok http 3022
     sleep 5
   done
   ```

3. **Use PM2 to keep server running:**
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name msa-inventory
   pm2 startup  # Auto-start on reboot
   ```

---

## 🎯 Recommended: Fix Render Deployment

**Why Render is best:**
- ✅ Free tier (750 hours/month)
- ✅ One service (frontend + backend)
- ✅ Auto HTTPS
- ✅ Easy setup
- ✅ No credit card needed

**Steps to fix:**
1. Follow Render deployment steps above
2. Use exact build/start commands
- Build: `npm run render-build`
- Start: `npm run render-start`
3. Set all environment variables
4. Check logs for errors
5. Test the URL

---

## 📞 Need More Help?

If still having issues:

1. **Share Render/Railway logs** - Check what errors appear
2. **Check build logs** - Look for specific error messages
3. **Verify environment variables** - Make sure all are set
4. **Test locally first** - Make sure `npm run render-build` works locally

---

## ✅ Quick Success Checklist

After deployment, verify:
- [ ] App URL loads (not just API)
- [ ] `/api/health` returns success
- [ ] Can login with user account
- [ ] Can view items page
- [ ] Can create checkout request
- [ ] No CORS errors in browser console

---

**Last Updated:** November 5, 2025


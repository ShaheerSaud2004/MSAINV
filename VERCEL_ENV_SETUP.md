# 🔐 Vercel Environment Variables Setup

## Required Environment Variables

Your login isn't working because these environment variables need to be set in your Vercel project settings.

### Go to Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click on your project: **msainventory**
3. Go to **Settings** → **Environment Variables**

### Add These Variables:

#### 1. JWT_SECRET (REQUIRED)
```
Name: JWT_SECRET
Value: [Your existing JWT_SECRET from your Vercel env vars]
Environment: Production, Preview, Development
```
⚠️ **This is already set** - make sure it's still there!

#### 2. STORAGE_MODE (REQUIRED)
```
Name: STORAGE_MODE
Value: json
Environment: Production, Preview, Development
```
⚠️ **This is already set** - make sure it's still there!

#### 3. NODE_ENV (REQUIRED)
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```
⚠️ **This is already set** - make sure it's still there!

### Optional but Recommended:

#### 4. MONGODB_URI (If using MongoDB)
```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/msa-inventory
Environment: Production, Preview, Development
```

#### 5. JWT_EXPIRES_IN
```
Name: JWT_EXPIRES_IN
Value: 7d
Environment: Production, Preview, Development
```

## 🔍 How to Check if Variables are Set:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see:
   - ✅ JWT_SECRET (hidden value)
   - ✅ STORAGE_MODE = json
   - ✅ NODE_ENV = production

## 🐛 Troubleshooting Login Issues:

### If login still doesn't work:

1. **Check Vercel Function Logs:**
   - Go to your Vercel project → **Logs** tab
   - Look for errors when you try to login
   - Check for "JWT_SECRET not set" errors

2. **Test API Endpoint:**
   - Try accessing: `https://msainventory.vercel.app/api/health`
   - Should return: `{"success":true,"message":"API is healthy",...}`

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to login
   - Check the `/api/auth/login` request
   - Look for error messages

4. **Verify Serverless Function:**
   - The server should be accessible at `/api/*` routes
   - Check Vercel Functions tab to see if `server/server.js` is deployed

## ✅ After Setting Variables:

1. **Redeploy:**
   - Go to Deployments tab
   - Click the 3 dots on latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger redeploy

2. **Wait for deployment to complete** (~2-3 minutes)

3. **Try logging in again**

## 📝 Notes:

- Environment variables are case-sensitive
- Make sure variables are set for **Production** environment
- After adding/changing variables, you need to **redeploy** for changes to take effect
- JSON storage mode means data resets on each deployment (use MongoDB for persistence)

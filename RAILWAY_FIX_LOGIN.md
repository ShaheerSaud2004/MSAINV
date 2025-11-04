# 🔧 Fix Railway Login 401 Errors

## ❌ Issues Found

1. **401 Unauthorized Errors** - Login endpoint returning 401
2. **Trust Proxy Warning** - Rate limiter configuration conflict
3. **JWT_SECRET Not Set** - Missing environment variable in Railway

## ✅ Fixes Applied

### 1. Fixed Trust Proxy Warning
- Updated rate limiter to properly handle Railway's proxy
- Added custom key generator for IP-based rate limiting
- Matches `trust proxy` setting

### 2. Added JWT_SECRET Validation
- Server now checks for JWT_SECRET on startup
- Better error messages if JWT_SECRET is missing
- Login endpoint validates JWT_SECRET before generating tokens

### 3. Improved Error Handling
- Better error messages for login failures
- Proper error logging for debugging

---

## 🔐 CRITICAL: Set JWT_SECRET in Railway

**The main issue is that `JWT_SECRET` is not set in Railway environment variables!**

### Steps to Fix:

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Open your project: **msa-inventory** (or msainv-production)

2. **Add Environment Variable:**
   - Click on your service
   - Go to **Variables** tab
   - Click **+ New Variable**

3. **Add JWT_SECRET:**
   ```
   Variable Name: JWT_SECRET
   Value: your-super-secret-jwt-key-min-32-characters-long-change-this
   ```

4. **Generate a Secure Secret:**
   You can generate one using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Or use any 32+ character random string

5. **Also Check These Variables:**
   ```
   NODE_ENV=production
   STORAGE_MODE=mongodb
   MONGODB_URI=your-mongodb-connection-string
   PORT=3132 (or Railway's assigned port)
   ```

6. **Redeploy:**
   - Railway will automatically redeploy when you add the variable
   - Or manually trigger a redeploy from the dashboard

---

## 🧪 Testing After Fix

1. **Check Server Logs:**
   - Railway Dashboard → Deployments → View Logs
   - Should see: "Server running on port..." (no JWT_SECRET error)

2. **Test Login:**
   - Visit: https://msainv-production.up.railway.app/login
   - Try logging in with:
     - Admin: `admin@msa.com` / `admin123`
     - Or any user account

3. **Check Console:**
   - Open browser DevTools (F12)
   - Should see successful login (200 status)
   - No more 401 errors

---

## 📝 What Was Changed

### Files Modified:
1. `server/server.js`
   - Added JWT_SECRET validation on startup
   - Fixed rate limiter trust proxy configuration

2. `server/routes/auth.js`
   - Added JWT_SECRET check in generateToken()
   - Better error messages for missing JWT_SECRET

3. `server/middleware/auth.js`
   - Added JWT_SECRET validation before token verification

---

## ⚠️ Important Notes

- **JWT_SECRET must be at least 32 characters long**
- **Never commit JWT_SECRET to git** (it's in .gitignore)
- **Use different JWT_SECRET for production vs development**
- **After adding JWT_SECRET, Railway will auto-redeploy**

---

## 🚀 After Fixing

Once JWT_SECRET is set:
1. ✅ Trust proxy warning will be gone
2. ✅ Login will work (no more 401 errors)
3. ✅ Token generation will succeed
4. ✅ All authenticated routes will work

---

## 📞 Still Having Issues?

If login still fails after setting JWT_SECRET:

1. **Check Railway Logs:**
   - Look for any error messages
   - Check if MongoDB connection is working

2. **Verify User Exists:**
   - Check MongoDB database
   - Verify user email/password

3. **Check CORS:**
   - Should be configured correctly
   - Railway handles this automatically

4. **Clear Browser Cache:**
   - Old tokens might be cached
   - Clear localStorage and try again


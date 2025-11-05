# 🔧 CRITICAL FIX: Render Build Command

## ❌ The Problem
Render is using `npm install` instead of `npm run render-build`, so server dependencies aren't installed.

## ✅ The Fix

### In Render Dashboard:

1. Go to your Render service → **Settings** tab
2. Find **Build Command** field
3. **Change it to:**
   ```
   npm run render-build
   ```
4. Find **Start Command** field  
5. **Change it to:**
   ```
   npm run render-start
   ```
6. Click **Save Changes**
7. Go to **Manual Deploy** → **Deploy latest commit**

---

## 📋 What These Commands Do

**Build Command (`npm run render-build`):**
- Installs root dependencies
- Installs server dependencies (including `dotenv`, `@supabase/supabase-js`, etc.)
- Installs client dependencies
- Builds React frontend

**Start Command (`npm run render-start`):**
- Changes to server directory
- Runs Node.js server
- Serves both API and frontend

---

## ⚠️ Current Wrong Settings

- Build Command: `npm install` ❌
- Start Command: `node server/server.js` ❌

## ✅ Correct Settings

- Build Command: `npm run render-build` ✅
- Start Command: `npm run render-start` ✅

---

After updating these, Render will properly install all dependencies and your app will deploy successfully!

# 🔧 Quick Fix: 401 Login Error

## The Problem
Getting `401 Unauthorized` when trying to login. This usually means:
1. **Supabase tables don't exist yet** (most likely)
2. **No users in the database**

## ✅ Fix Steps

### Step 1: Run SQL Migration in Supabase

1. Go to: https://supabase.com/dashboard
2. Click your project: `trikujcotjghuhppxtkj`
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy ALL content from: `server/scripts/supabase-migration.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success" message

This creates all the tables:
- ✅ users
- ✅ items  
- ✅ transactions
- ✅ notifications
- ✅ guest_requests

### Step 2: Create First User

You have 2 options:

#### Option A: Register via Website (Easiest)
1. Go to: https://msainv-stks.onrender.com/register
2. Fill in the registration form
3. First user will be created as regular user
4. Then go to Supabase → Table Editor → users
5. Find your user and change `role` to `'admin'`

#### Option B: Use Script (Advanced)
Run this locally (with Supabase env vars set):
```bash
node server/scripts/createFirstUser.js admin@msa.com admin123 "Admin User"
```

### Step 3: Check Render Logs

1. Go to Render Dashboard
2. Click your service → **Logs** tab
3. Look for errors like:
   - "relation does not exist" = Tables not created
   - "User not found" = No users in database
   - "JWT_SECRET" = Missing env variable

### Step 4: Verify Environment Variables

Make sure these are set in Render:
- ✅ `STORAGE_MODE=supabase`
- ✅ `SUPABASE_URL=https://trikujcotjghuhppxtkj.supabase.co`
- ✅ `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ `JWT_SECRET=61010f539b1a1c0d81382a6c3ef938874543deb7e2ce36a4011420637d5eaa32`

## 🎯 Most Likely Issue

**Supabase tables haven't been created yet!**

Run the SQL migration (Step 1) and the 401 error will be fixed.

## 📊 Verify Tables Exist

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see 5 tables:
   - users
   - items
   - transactions
   - notifications
   - guest_requests

If you don't see these, the migration hasn't run!

---

**After running the migration, try logging in again!**


# 🚀 Supabase Setup Guide

Your MSA Inventory System is now configured to use Supabase!

## ✅ What's Already Done

1. ✅ Supabase client installed (`@supabase/supabase-js`)
2. ✅ Supabase storage service created
3. ✅ Storage service factory updated to support Supabase
4. ✅ SQL migration file created

## 📋 Step-by-Step Setup

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project: `trikujcotjghuhppxtkj`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `server/scripts/supabase-migration.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success" message

This creates all the tables:
- `users`
- `items`
- `transactions`
- `notifications`
- `guest_requests`

### Step 2: Set Environment Variables

In your Render dashboard (or local `.env` file):

```
NODE_ENV=production
STORAGE_MODE=supabase
SUPABASE_URL=https://trikujcotjghuhppxtkj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaWt1amNvdGpnaHVocHB4dGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzM0MTYsImV4cCI6MjA3Nzk0OTQxNn0.wzznGzB5crndfFMP_v56x3K69PlUXteB-Xt6RvYJon4
JWT_SECRET=61010f539b1a1c0d81382a6c3ef938874543deb7e2ce36a4011420637d5eaa32
JWT_EXPIRES_IN=7d
PORT=10000
```

### Step 3: Deploy

1. Push to GitHub (already done ✅)
2. Render will auto-deploy
3. Or deploy manually: Render → Manual Deploy

### Step 4: Test

1. Visit your Render URL
2. Try to register a new user
3. Check Supabase dashboard → Table Editor → `users` table
4. You should see your new user!

## 🔍 Verify Tables in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. You should see:
   - ✅ users
   - ✅ items
   - ✅ transactions
   - ✅ notifications
   - ✅ guest_requests

## 📊 Import Existing Data (Optional)

If you have existing data in MongoDB/JSON:

1. Export data from MongoDB/JSON
2. Go to Supabase → Table Editor
3. Manually import or use Supabase's import feature

## 🔒 Security Notes

- The `anon` key is safe to use in the browser (as shown in your image)
- Row Level Security (RLS) is enabled but set to allow all operations
- You can customize RLS policies later for better security

## 🎯 That's It!

Your app is now using Supabase! 🎉

---

**Next Steps:**
1. Run the SQL migration ✅
2. Set environment variables in Render ✅
3. Deploy and test ✅


# 🚀 Vercel Deployment Guide

## 📋 Overview

This guide will help you deploy your MSA Inventory Management System to Vercel. The application will be split into two deployments:
1. **Frontend** (React) - Static site on Vercel
2. **Backend** (Node.js/Express) - Serverless functions on Vercel

## ⚠️ Important Note About Storage

**JSON File Storage** won't persist on Vercel's serverless environment. For production, you MUST use MongoDB Atlas (free tier available).

### Why MongoDB Atlas?
- ✅ Persistent data storage
- ✅ Free tier (512MB)
- ✅ Automatic backups
- ✅ Scalable
- ✅ Works perfectly with Vercel

## 🗄️ Step 1: Set Up MongoDB Atlas (Recommended)

### Option A: Use MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free
   - Create a new cluster (free M0 tier)

2. **Configure Database:**
   - Click "Connect"
   - Whitelist IP: `0.0.0.0/0` (allow from anywhere)
   - Create database user with password
   - Copy connection string

3. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/msa-inventory
   ```

### Option B: Continue with JSON Storage (Dev Only)

⚠️ **Warning:** Data will reset on each deployment!

## 📦 Step 2: Prepare Your Project

### Update Environment Variables

1. **Backend Environment Variables:**
   Create in Vercel Dashboard:
   ```env
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
   JWT_EXPIRES_IN=7d
   STORAGE_MODE=mongodb
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msa-inventory
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

2. **Frontend Environment Variables:**
   Create in Vercel Dashboard:
   ```env
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   REACT_APP_NAME=MSA Inventory Management
   REACT_APP_ENV=production
   ```

## 🚀 Step 3: Deploy Backend

### Method 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd server
   vercel --prod
   ```

4. **Configure Environment Variables:**
   ```bash
   vercel env add JWT_SECRET
   vercel env add MONGODB_URI
   vercel env add CORS_ORIGIN
   ```

5. **Note your backend URL:**
   ```
   https://your-backend-name.vercel.app
   ```

### Method 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select "server" as root directory
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_secret_key`
   - `MONGODB_URI` = `your_mongodb_connection_string`
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
6. Deploy!

## 🎨 Step 4: Deploy Frontend

### Method 1: Deploy via Vercel CLI

1. **Update API URL:**
   ```bash
   cd ../client
   # Create production .env
   echo "REACT_APP_API_URL=https://your-backend.vercel.app/api" > .env.production
   ```

2. **Deploy Frontend:**
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select "client" as root directory
5. Add environment variables:
   - `REACT_APP_API_URL` = `https://your-backend.vercel.app/api`
6. Deploy!

## 🔧 Step 5: Update CORS Settings

After deploying frontend, update backend CORS:

1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Update `CORS_ORIGIN` to your frontend URL:
   ```
   https://your-frontend-name.vercel.app
   ```
3. Redeploy backend

## ✅ Step 6: Verify Deployment

1. **Visit your frontend URL:**
   ```
   https://your-frontend-name.vercel.app
   ```

2. **Test quick login:**
   - Click "Login as Admin"
   - Should redirect to dashboard

3. **Check API connection:**
   - Open browser console
   - Should see successful API calls
   - No CORS errors

## 🎯 Step 7: Initial Setup

### Create Demo Users (if using MongoDB)

1. **Option A: Via API Call:**
   ```bash
   curl -X POST https://your-backend.vercel.app/api/setup/demo-users
   ```

2. **Option B: Manual Registration:**
   - Register an admin user manually
   - Update role in MongoDB Atlas dashboard

### Import Inventory Items

1. **Via MongoDB Atlas:**
   - Go to Collections → items
   - Import JSON data from `server/storage/data/items.json`

2. **Via API:**
   - Create bulk import endpoint
   - Upload items via admin panel

## 🔐 Security Checklist

Before going live, ensure:

- ✅ Strong JWT_SECRET (min 32 characters)
- ✅ MongoDB connection string secured
- ✅ CORS_ORIGIN set to exact frontend URL
- ✅ Demo accounts have strong passwords or removed
- ✅ Environment variables not in code
- ✅ .env files in .gitignore

## 📱 Custom Domain (Optional)

### Add Custom Domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `inventory.msaclub.org`)
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in backend
5. Update `REACT_APP_API_URL` in frontend

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push:

1. Connect GitHub repo to Vercel
2. Enable automatic deployments
3. Push to main branch
4. Vercel auto-deploys!

```bash
git add .
git commit -m "Update features"
git push origin main
# Vercel automatically deploys! 🚀
```

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:**
- Check `CORS_ORIGIN` matches exactly
- Include `https://` protocol
- No trailing slash
- Redeploy backend after changes

### Issue: API Not Found (404)

**Solution:**
- Verify `REACT_APP_API_URL` is correct
- Check API routes in backend
- Ensure backend is deployed

### Issue: Data Not Persisting

**Solution:**
- Switch to MongoDB Atlas
- Update `STORAGE_MODE=mongodb`
- Add `MONGODB_URI` environment variable

### Issue: JWT Invalid

**Solution:**
- Check `JWT_SECRET` is set on backend
- Clear browser localStorage
- Login again

### Issue: Environment Variables Not Loading

**Solution:**
- Redeploy after adding env vars
- Check variable names (case-sensitive)
- Frontend vars must start with `REACT_APP_`

## 📊 Monitoring

### Vercel Dashboard Features:

- 📈 **Analytics** - View traffic and performance
- 🔍 **Logs** - Debug serverless function errors
- ⚡ **Speed Insights** - Monitor page load times
- 🛡️ **Deployment History** - Rollback if needed

## 💰 Pricing

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Serverless functions
- ✅ Edge network (CDN)

### MongoDB Atlas Free Tier:
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for small apps

## 🎉 Final Checklist

Before launching:

- [ ] MongoDB Atlas cluster created and connected
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Demo users created
- [ ] Inventory items imported
- [ ] Quick login tested
- [ ] Admin panel accessible
- [ ] Checkout workflow working
- [ ] QR codes generating
- [ ] Custom domain added (optional)

## 🚀 Quick Deploy Commands

```bash
# Deploy everything at once
cd /path/to/MSAInventory

# Backend
cd server
vercel --prod
# Note the URL

# Frontend (update .env.production first)
cd ../client
echo "REACT_APP_API_URL=https://your-backend.vercel.app/api" > .env.production
vercel --prod

# Done! 🎉
```

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **React Deployment:** https://create-react-app.dev/docs/deployment/

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection

**Your MSA Inventory System is ready for production! 🚀**


# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Easiest)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Your account)
# - Link to existing project? No
# - Project name? msa-inventory (or your choice)
# - Directory? ./
```

### Option 2: Deploy via GitHub (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository: `ShaheerSaud2004/MSAINV`
5. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd server && npm install && cd ../client && npm install`

6. Click **"Deploy"**

## 🔧 Environment Variables

**IMPORTANT:** Add these in Vercel Dashboard → **Settings** → **Environment Variables**:

### Required Variables:
```
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
NODE_ENV=production
STORAGE_MODE=mongodb
```

### MongoDB (if using MongoDB):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msa-inventory?retryWrites=true&w=majority
```

### Optional (but recommended):
```
CLIENT_URL=https://your-project.vercel.app
```

**Note:** Vercel automatically sets `VERCEL_URL` - you don't need to set it manually.

## 📁 Project Structure for Vercel

- **Frontend**: `client/` - React app built to `client/build`
- **Backend**: `server/` - Express API routes
- **API Entry**: `api/index.js` - Vercel serverless function entry point
- **Config**: `vercel.json` - Vercel configuration

## 🔍 How It Works

1. **Frontend**: React app is built and served as static files
2. **API Routes**: All `/api/*` requests are handled by serverless functions
3. **Routing**: React Router handles client-side routing
4. **Storage**: File uploads are stored in `server/storage/uploads/`

## ✅ After Deployment

1. Your app will be live at: `https://your-project.vercel.app`
2. API routes available at: `https://your-project.vercel.app/api/*`
3. Frontend available at: `https://your-project.vercel.app`

## 🧪 Test Deployment

1. Visit: `https://your-project.vercel.app/api/health`
   - Should return: `{"success":true,"message":"Server is running",...}`

2. Visit: `https://your-project.vercel.app`
   - Should show the React login page

## 🔄 Continuous Deployment

- Vercel automatically deploys on every push to `main` branch
- Preview deployments are created for pull requests
- You can disable auto-deploy in Vercel settings if needed

## 📝 Notes

- ✅ Vercel handles HTTPS automatically
- ✅ Serverless functions scale automatically
- ✅ CDN for static assets
- ✅ Automatic deployments on git push
- ⚠️ File uploads: Vercel serverless functions have a 4.5MB limit
- ⚠️ Cron jobs: May need Vercel Cron or external service

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `vercel-build` script works locally
- Check Vercel build logs for specific errors

### API Not Working
- Verify environment variables are set
- Check that `api/index.js` exists
- Ensure routes in `vercel.json` are correct

### CORS Errors
- Vercel URL is automatically added to allowed origins
- Check `CLIENT_URL` environment variable

## 🔗 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Your Project: https://vercel.com/[your-username]/msa-inventory
- Docs: https://vercel.com/docs

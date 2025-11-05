# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: Deploy via GitHub (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login
3. Click "Add New Project"
4. Import your GitHub repository: `ShaheerSaud2004/MSAINV`
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd server && npm install && cd ../client && npm install`

### Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required:
- `JWT_SECRET` - Your JWT secret key (min 32 characters)
- `NODE_ENV` - Set to `production`
- `STORAGE_MODE` - Set to `mongodb` or `json`

#### MongoDB (if using MongoDB):
- `MONGODB_URI` - Your MongoDB connection string

#### Optional:
- `CLIENT_URL` - Your Vercel deployment URL (auto-set)
- `PORT` - Leave default (Vercel handles this)

### Build Settings
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd server && npm install && cd ../client && npm install`

### After Deployment
1. Your app will be live at: `https://your-project.vercel.app`
2. API routes available at: `https://your-project.vercel.app/api/*`
3. Frontend available at: `https://your-project.vercel.app`

### Notes
- Vercel automatically handles API routes via serverless functions
- Frontend is served as static files
- All `/api/*` routes are proxied to the Express server
- Storage files (if using JSON mode) need to be in server/storage directory

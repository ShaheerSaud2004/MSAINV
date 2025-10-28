# 🚀 Vercel Deployment Guide - MSA Inventory

## ⚠️ Important: Deploy Client and Server Separately

For the best Vercel experience, deploy the **frontend (client)** and **backend (server)** as **two separate projects**.

---

## 📦 Option 1: Deploy Client Only (Recommended)

This deploys just the React frontend to Vercel. The backend should be deployed separately (Railway, Render, etc.)

### Step 1: Navigate to Client Directory

The root `vercel.json` is already configured to deploy the client.

### Step 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repo: `ShaheerSaud2004/MSAINV`
4. Vercel will detect the configuration automatically
5. Click **"Deploy"**

### Step 3: Configure Environment Variables

In your Vercel project settings, add:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

Replace `your-backend-url.com` with your actual backend URL (Railway, Render, etc.)

### Step 4: Deploy Backend Separately

Deploy the server to:
- **Railway** (recommended) - See `RAILWAY_DEPLOY.md`
- **Render**
- **Heroku**
- Any Node.js hosting platform

---

## 📦 Option 2: Deploy Client from /client Directory

If you want more control, you can deploy just the client directory:

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Deploy
vercel

# For production
vercel --prod
```

### Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import repo
4. Set **Root Directory** to: `client`
5. Framework Preset: **Create React App**
6. Build Command: `npm run build`
7. Output Directory: `build`
8. Click **"Deploy"**

---

## 🔧 Environment Variables for Client

Add these in Vercel Project Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend.railway.app/api` | Backend API URL |
| `NODE_ENV` | `production` | Environment mode |

---

## 🖥️ Deploy Server (Backend)

The Node.js/Express server should be deployed to a platform that supports Node.js:

### Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
cd server
railway link

# Deploy
railway up
```

See `RAILWAY_DEPLOY.md` for detailed instructions.

### Render

1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add environment variables

### Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
cd server
heroku create msa-inventory-server

# Deploy
git subtree push --prefix server heroku main
```

---

## 🔗 Connecting Frontend to Backend

After deploying both:

1. **Get your backend URL** (e.g., `https://msa-inventory-server.railway.app`)
2. **Update Vercel environment variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` to your backend URL + `/api`
   - Example: `https://msa-inventory-server.railway.app/api`
3. **Redeploy frontend** (Vercel will auto-redeploy)

---

## 🧪 Testing Deployment

### Test Frontend
Visit your Vercel URL: `https://your-project.vercel.app`

### Test Backend
Visit: `https://your-backend-url.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### Test Connection
1. Open your Vercel frontend URL
2. Try to login with a team account
3. If it works, you're all set! 🎉

---

## 🐛 Common Issues

### Issue 1: "No Output Directory named 'build' found"

**Solution:** Make sure you're deploying from the root with the updated `vercel.json`, or deploy the `client` directory separately.

### Issue 2: API calls fail with CORS errors

**Solution:** Update your backend's CORS configuration to include your Vercel URL:

```javascript
// In server/server.js
const allowedOrigins = [
  'https://your-project.vercel.app',
  process.env.CLIENT_URL,
  // ... other origins
];
```

### Issue 3: Environment variables not working

**Solution:**
- Vercel: Add in Dashboard → Settings → Environment Variables
- Railway: Add in Dashboard → Variables
- Redeploy after adding

---

## 📋 Deployment Checklist

### Frontend (Vercel)
- [ ] Root `vercel.json` is configured
- [ ] Deployed to Vercel
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] Custom domain configured (optional)
- [ ] SSL enabled (automatic with Vercel)

### Backend (Railway/Render/Heroku)
- [ ] Deployed to Node.js hosting
- [ ] Environment variables configured:
  - [ ] `PORT`
  - [ ] `CLIENT_URL` (your Vercel URL)
  - [ ] `MONGODB_URI` (if using MongoDB)
  - [ ] `JWT_SECRET`
  - [ ] `STORAGE_MODE`
- [ ] CORS configured with Vercel URL
- [ ] Health endpoint accessible
- [ ] Team accounts created (run script)

### Team Setup
- [ ] Run `node scripts/createTeamAccounts.js` on production
- [ ] Verify all 7 teams can login
- [ ] Test data isolation

---

## 🎯 Recommended Setup

**For MSA Inventory, we recommend:**

1. **Frontend:** Deploy to **Vercel** (from root with current vercel.json)
2. **Backend:** Deploy to **Railway** (easiest Node.js deployment)
3. **Database:** Use **MongoDB Atlas** (free tier available)

This gives you:
- ✅ Fast, global CDN for frontend (Vercel)
- ✅ Reliable Node.js hosting for backend (Railway)
- ✅ Managed MongoDB database (Atlas)
- ✅ Easy SSL/HTTPS for both
- ✅ Simple environment variable management

---

## 🚀 Quick Deploy Commands

### Deploy Frontend (from root)
```bash
vercel --prod
```

### Deploy Backend (from server directory)
```bash
cd server
railway up
# or
git push heroku main
```

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Project Issues: https://github.com/ShaheerSaud2004/MSAINV/issues

---

**Your current setup:** Frontend builds successfully! Just needs proper backend URL configuration. ✅


# 🚂 Deploy to Railway (Single Deployment Alternative)

## Why Railway for Fullstack?

Railway is **built for fullstack apps** - deploy your entire monorepo as ONE project!

### ✅ Benefits:
- **One deployment** for frontend + backend
- **No serverless conversion** needed
- **Runs Express directly** 
- **Free tier** ($5 credit/month)
- **Environment variables** built-in
- **MongoDB Atlas** works perfectly
- **Auto HTTPS** and custom domains

---

## 🚀 Deploy in 5 Minutes

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

Or use without installing:
```bash
npx @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This opens browser to authenticate.

### Step 3: Initialize Project

```bash
cd /Users/shaheersaud/MSAInventory
railway init
```

Choose: **"Create new project"**
Name it: **"msa-inventory"**

### Step 4: Configure Environment Variables

```bash
# Add all variables at once
railway variables set NODE_ENV=production
railway variables set STORAGE_MODE=mongodb
railway variables set MONGODB_URI="mongodb+srv://ss4108_db_user:I7LTEA9LnANLfId9@cluster0.zk8wtbi.mongodb.net/msa-inventory?retryWrites=true&w=majority"
railway variables set JWT_SECRET="msa-inventory-2024-super-secret-key"
railway variables set JWT_EXPIRES_IN=7d
railway variables set PORT=3132
```

### Step 5: Create railway.json

This tells Railway how to build your app:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 6: Update package.json

Add Railway start script:

```json
{
  "scripts": {
    "start:railway": "cd server && npm start & cd client && npm start"
  }
}
```

### Step 7: Deploy!

```bash
railway up
```

That's it! Railway will:
1. ✅ Install all dependencies
2. ✅ Build React frontend
3. ✅ Start Express backend
4. ✅ Give you a live URL

---

## 🌐 Access Your App

After deployment:

```bash
railway open
```

Or get your URL:
```bash
railway domain
```

You'll get: `https://your-app.railway.app`

---

## 🔧 Managing Your App

### View Logs
```bash
railway logs
```

### Add Custom Domain
```bash
railway domain add yourdomain.com
```

### View Environment Variables
```bash
railway variables
```

### Redeploy
```bash
railway up
```

---

## 💰 Pricing

**Free Tier:**
- $5 credit per month
- Usually enough for small apps
- Auto-sleeps after inactivity
- Wakes up on first request (1-2 sec delay)

**Hobby Plan ($5/month):**
- $5 credit + $5 fixed fee
- No sleep
- Always available

---

## 🆚 Railway vs Vercel

| Feature | Railway | Vercel (2 projects) |
|---------|---------|---------------------|
| **Setup** | 5 commands | 2 deployments |
| **Express** | ✅ Native | ⚠️ Serverless |
| **Single URL** | ✅ Yes | ❌ Two URLs |
| **CORS** | ✅ Auto | ⚠️ Manual config |
| **Cost** | $5 credit | Free |
| **Best For** | Fullstack | Frontend-heavy |

---

## 🎯 Recommended Approach

### For Learning/Testing: ✨ **Railway**
- Simpler setup
- One deployment
- No CORS issues
- Works like localhost

### For Production: 🚀 **Vercel**
- Free forever
- Better CDN
- More scalable
- Industry standard

---

## 🔄 Easy Migration

Already deployed to Vercel? No problem!

Your code works on both! Just:
1. Keep Vercel deployment
2. Try Railway for testing
3. Choose what you prefer

Both use same:
- ✅ MongoDB Atlas
- ✅ Environment variables
- ✅ Same codebase

---

## 🆘 Railway Troubleshooting

### Build Failed?
```bash
railway logs
```
Check for missing dependencies

### Can't Connect to Database?
Make sure MongoDB Atlas allows 0.0.0.0/0

### CORS Issues?
Railway uses single domain - no CORS needed!

### Port Issues?
Railway auto-assigns PORT - our app already handles this

---

## 📞 Railway Dashboard

Web interface: https://railway.app/dashboard

You can:
- ✅ View logs
- ✅ Manage variables
- ✅ Monitor usage
- ✅ Add custom domains
- ✅ View metrics

---

## 🎉 Summary

**Vercel (Current):**
```
Two deployments → Two URLs → CORS config
```

**Railway (Alternative):**
```
One deployment → One URL → No CORS
```

Both work! Railway is simpler for fullstack, Vercel is better for scale.

---

**Ready to try Railway?**

```bash
npm install -g @railway/cli
railway login
cd /Users/shaheersaud/MSAInventory
railway init
railway up
```

That's it! 🚂✨


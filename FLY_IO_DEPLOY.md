# 🪂 Deploy to Fly.io (Alternative Option)

## Why Fly.io?
- ✅ **Free tier** available
- ✅ **Global deployment** (edge locations)
- ✅ **No sleep** on free tier
- ✅ **Good for full-stack** apps
- ✅ **Docker-based** (but auto-detects)

---

## 🚀 Quick Deploy

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

Or on macOS:
```bash
brew install flyctl
```

### Step 2: Sign Up / Login
```bash
fly auth signup
# Or if you have an account:
fly auth login
```

### Step 3: Initialize Project
```bash
cd /Users/shaheersaud/MSAInventory
fly launch
```

This will:
- Detect your Node.js app
- Create a `fly.toml` config file
- Ask you to name your app
- Deploy it!

### Step 4: Configure Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set STORAGE_MODE=mongodb
fly secrets set MONGODB_URI="your-mongodb-uri"
fly secrets set JWT_SECRET="your-secret-key"
fly secrets set JWT_EXPIRES_IN=7d
```

### Step 5: Deploy
```bash
fly deploy
```

---

## 📝 Fly.toml Configuration
After `fly launch`, you'll have a `fly.toml` file. Make sure it looks like:

```toml
app = "your-app-name"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[http_service]
  internal_port = 5001
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  http_checks = []
  internal_port = 5001
  processes = ["app"]
  protocol = "tcp"
  script_checks = []
```

---

## 🌐 Your App URL
After deployment:
- `https://your-app-name.fly.dev`

---

## 💰 Pricing
- **Free tier:** 3 shared-cpu VMs, 3GB persistent volumes
- **Paid:** Starts at $1.94/month per VM

---

## 🔧 Useful Commands

```bash
# View logs
fly logs

# Open app
fly open

# Check status
fly status

# SSH into app
fly ssh console
```

---

## 🆚 Fly.io vs Render

| Feature | Fly.io | Render |
|---------|--------|--------|
| Free Tier | ✅ Yes | ✅ Yes |
| Sleep | ❌ No | ⚠️ Yes |
| Global | ✅ Yes | ⚠️ Limited |
| Setup | ⚠️ CLI needed | ✅ Web UI |
| Best For | Performance | Simplicity |

---

## 📞 Resources
- Docs: https://fly.io/docs
- Dashboard: https://fly.io/dashboard

---

**Recommendation:** Use **Render** for easier setup, or **Fly.io** if you want no sleep and global performance.



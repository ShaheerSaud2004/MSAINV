# 📋 Environment Variables List

## 🔴 Required Variables (Must Have)

### 1. `JWT_SECRET`
**Required:** Yes  
**Description:** Secret key for JWT token signing  
**Example:** `msa-inventory-2024-super-secret-key-min-32-characters-long`  
**Minimum Length:** 32 characters  
**Note:** Keep this secret! Never commit to git.

---

### 2. `MONGODB_URI`
**Required:** Yes (if using MongoDB)  
**Description:** MongoDB connection string  
**Example:** `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/msa-inventory?retryWrites=true&w=majority`  
**Format:** MongoDB Atlas connection string  
**Note:** Get this from MongoDB Atlas dashboard

---

### 3. `STORAGE_MODE`
**Required:** Recommended  
**Description:** Storage backend to use  
**Options:** `mongodb` or `json`  
**Default:** `mongodb`  
**Example:** `mongodb`  
**Note:** Use `mongodb` for production, `json` for development/testing

---

### 4. `NODE_ENV`
**Required:** Recommended  
**Description:** Environment mode  
**Options:** `production` or `development`  
**Default:** `development`  
**Example:** `production`  
**Note:** Set to `production` for deployed apps

---

## 🟡 Optional Variables (Recommended)

### 5. `PORT`
**Required:** No  
**Description:** Server port number  
**Default:** `5001`  
**Example:** `5001` or `10000` (Render uses 10000)  
**Note:** Render auto-assigns PORT, but you can set it

---

### 6. `JWT_EXPIRES_IN`
**Required:** No  
**Description:** JWT token expiration time  
**Default:** `7d`  
**Example:** `7d`, `24h`, `30d`  
**Format:** Number followed by unit (s, m, h, d)

---

### 7. `CLIENT_URL`
**Required:** No (for same-domain deployments)  
**Description:** Frontend URL for CORS  
**Example:** `https://your-app.onrender.com`  
**Note:** Only needed if frontend/backend are on different domains

---

## 🟢 Optional Variables (Email Notifications)

### 8. `EMAIL_HOST`
**Required:** No  
**Description:** SMTP server host  
**Example:** `smtp.gmail.com`  
**Note:** Only needed if you want email notifications

### 9. `EMAIL_PORT`
**Required:** No  
**Description:** SMTP server port  
**Default:** `587`  
**Example:** `587` (for TLS) or `465` (for SSL)

### 10. `EMAIL_USER`
**Required:** No  
**Description:** Email address for sending emails  
**Example:** `your-email@gmail.com`  
**Note:** Must match your email provider

### 11. `EMAIL_PASS`
**Required:** No  
**Description:** Email password or app password  
**Example:** `your-app-password`  
**Note:** For Gmail, use App Password (not regular password)

### 12. `EMAIL_SECURE`
**Required:** No  
**Description:** Use SSL/TLS  
**Default:** `false`  
**Example:** `true` or `false`  
**Note:** `true` for port 465, `false` for port 587

---

## 🔵 Optional Variables (Rate Limiting)

### 13. `RATE_LIMIT_WINDOW_MS`
**Required:** No  
**Description:** Rate limit time window in milliseconds  
**Default:** `900000` (15 minutes)  
**Example:** `900000`

### 14. `RATE_LIMIT_MAX_REQUESTS`
**Required:** No  
**Description:** Max requests per window  
**Default:** `100`  
**Example:** `100`

---

## 🟣 Optional Variables (QR Codes)

### 15. `QR_CODE_ERROR_CORRECTION`
**Required:** No  
**Description:** QR code error correction level  
**Default:** `M`  
**Options:** `L`, `M`, `Q`, `H`  
**Example:** `M`

### 16. `QR_CODE_SIZE`
**Required:** No  
**Description:** QR code size in pixels  
**Default:** `300`  
**Example:** `300`

---

## 🟠 Platform-Specific Variables

### 17. `RAILWAY_STATIC_URL`
**Required:** No  
**Description:** Railway static URL (if using Railway)  
**Note:** Only for Railway deployments

### 18. `RAILWAY_PUBLIC_DOMAIN`
**Required:** No  
**Description:** Railway public domain (if using Railway)  
**Note:** Only for Railway deployments

---

## 📝 Frontend Variables (Client-side)

### 19. `REACT_APP_API_URL`
**Required:** No (for production)  
**Description:** Backend API URL for development  
**Example:** `http://localhost:5001/api`  
**Note:** Only needed in development. Production uses relative URL.

---

## ✅ Minimum Required for Deployment

For a basic deployment, you only need:

```bash
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-key-min-32-characters-long
PORT=10000
```

---

## 📋 Complete Example for Render

```bash
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/msa-inventory?retryWrites=true&w=majority
JWT_SECRET=msa-inventory-2024-super-secret-key-minimum-32-characters-long-please
JWT_EXPIRES_IN=7d
PORT=10000
```

---

## 📋 Complete Example with Email (Optional)

```bash
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/msa-inventory?retryWrites=true&w=majority
JWT_SECRET=msa-inventory-2024-super-secret-key-minimum-32-characters-long-please
JWT_EXPIRES_IN=7d
PORT=10000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false
```

---

## 🔒 Security Notes

1. **Never commit** `.env` files to git
2. **JWT_SECRET** should be at least 32 characters
3. **MONGODB_URI** contains your database password - keep it secret
4. **EMAIL_PASS** should use app passwords, not your regular password

---

## 📝 Quick Copy-Paste for Render

Copy these into Render's Environment Variables:

```
NODE_ENV=production
STORAGE_MODE=mongodb
MONGODB_URI=your-mongodb-uri-here
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d
PORT=10000
```

Replace:
- `your-mongodb-uri-here` with your actual MongoDB connection string
- `your-secret-key-here-min-32-chars` with a random secret key (32+ characters)

---

## 🆘 Where to Get Values

**MONGODB_URI:**
1. Go to https://cloud.mongodb.com
2. Click your cluster → "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password

**JWT_SECRET:**
- Generate a random string (32+ characters)
- Can use: `openssl rand -base64 32` in terminal
- Or use any random string generator

---

## ✅ Checklist Before Deploying

- [ ] `JWT_SECRET` set (32+ characters)
- [ ] `MONGODB_URI` set (with correct password)
- [ ] `STORAGE_MODE=mongodb` set
- [ ] `NODE_ENV=production` set
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)



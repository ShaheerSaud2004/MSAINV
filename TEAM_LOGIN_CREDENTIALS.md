# 🔐 Team Login Credentials

**Last Updated:** October 28, 2025

All team logins are now **WORKING** ✅

## 🎯 7 Team Accounts

All teams have **full admin access** to the system.

| Team | Email | Password |
|------|-------|----------|
| 🌟 IAW | `iaw@msa.com` | `iaw123` |
| 💚 Hope | `hope@msa.com` | `hope123` |
| 📝 Submissions | `submissions@msa.com` | `submissions123` |
| ⚙️ EPT | `ept@msa.com` | `ept123` |
| 🪜 Ladders | `ladders@msa.com` | `ladders123` |
| 👥 Brothers Social | `brothers@msa.com` | `brothers123` |
| 👭 Sisters Social | `sisters@msa.com` | `sisters123` |
| 🎯 R2R | `r2r@msa.com` | `r2r123` |

## 🚀 How to Login

### Option 1: Quick Login Buttons (Recommended)
1. Go to the login page
2. Scroll down to "⚡ Quick Team Login"
3. Click the button for your team
4. You're instantly logged in!

### Option 2: Manual Login
1. Enter your team email (e.g., `iaw@msa.com`)
2. Enter your team password (e.g., `iaw123`)
3. Click "Login"

## 🛠️ Troubleshooting

### If login still doesn't work:

1. **Clear browser cache**: 
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Safari: `Cmd+Option+E`

2. **Restart the server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Verify server is running**:
   - Frontend should be on: `http://localhost:3021`
   - Backend should be on: `http://localhost:3022`

4. **Check if passwords were reset**:
   ```bash
   cd server
   node scripts/resetTeamPasswords.js
   ```

## ✨ What Each Team Can Do

All teams have the same permissions:
- ✅ View all items
- ✅ Create and edit items
- ✅ Checkout and return items
- ✅ Approve transactions
- ✅ View analytics and reports
- ✅ Manage settings
- ✅ Bulk import items

## 🔧 Password Reset Script

If you ever need to reset team passwords again, run:

```bash
cd server
node scripts/resetTeamPasswords.js
```

This will reset all team passwords to the values shown above.

## 📝 Notes

- All teams are separate - they can't see each other's data
- Each team has its own isolated storage
- All accounts are set to "active" status
- All passwords use secure bcrypt hashing

---

**Need Help?** If login issues persist, check:
- Server logs for errors
- Network tab in browser DevTools
- Make sure JWT_SECRET is set in .env file


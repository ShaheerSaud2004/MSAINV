# 📸 How to Upload Storage Visit Photos

## 🎯 Where to Find Photo Upload

### Option 1: From Transaction Detail Page (Main Way)

1. **Go to Transactions**
   - Dashboard → Transactions
   - OR navigate to: `http://localhost:3021/transactions`

2. **Click on Any Transaction**
   - Find a transaction (pending, active, or approved status)
   - Click on it to view details

3. **Look for "Upload Photos" Button**
   - On the transaction detail page
   - You'll see a section called **"Storage Visit Documentation"**
   - Click the blue **"Upload Photos"** button

4. **Upload Your Photos!**
   - Select up to 5 photos
   - Add visit type (Pickup, Return, Inspection, Maintenance)
   - Add location and notes
   - Submit!

---

## 📍 Direct URL Route

You can also go directly to the upload page:

```
http://localhost:3021/storage-visit/:transactionId
```

Replace `:transactionId` with the actual transaction ID.

**Example:**
```
http://localhost:3021/storage-visit/6721abc123def456789
```

---

## 🔍 Step-by-Step Visual Guide

### Step 1: Navigate to Transactions
```
Dashboard → Click "Transactions" in sidebar
```

### Step 2: Select a Transaction
```
Transactions List → Click on any transaction row
```

### Step 3: Upload Photos Section
```
Transaction Detail Page → Scroll to "Storage Visit Documentation" section
→ Click "Upload Photos" button
```

### Step 4: Upload Form
```
📸 Select Photos (up to 5)
📍 Choose Visit Type (Pickup/Return/Inspection/Maintenance)
📝 Add Location (optional)
💬 Add Notes (optional)
➡️ Click "Submit Photos"
```

---

## 🖼️ Photo Upload Page Features

### What You Can Do:
- ✅ Upload 1-5 photos per visit (JPG, PNG, GIF, WEBP)
- ✅ Max 10MB per photo
- ✅ Add captions to each photo
- ✅ Select visit type
- ✅ Specify storage location
- ✅ Add additional notes

### Preview Features:
- 👁️ Preview photos before uploading
- ❌ Remove photos you don't want
- ✏️ Edit captions for each photo

---

## 📱 When to Upload Photos

### Required Situations:
1. **Picking Up Items** - When you go to storage to get items (after approval)
2. **Returning Items** - When you bring items back to storage
3. **Inspection Visits** - Regular checks of storage area
4. **Maintenance** - Any maintenance work in storage

---

## 🔑 Who Can Upload Photos?

### Regular Users:
- ✅ Can upload photos for their own transactions
- ✅ See their own storage visit history

### Admins/Managers:
- ✅ Can upload photos for any transaction
- ✅ Can verify storage visits
- ✅ See all storage visit photos
- ✅ Access storage visit logs

---

## 🚫 Troubleshooting

### "Upload Photos" Button Not Showing?
**Possible reasons:**
1. Transaction status is "returned" or "cancelled" (can't upload after completion)
2. You're not the owner of the transaction (and not an admin)
3. Check you're logged in

### Can't Access Upload Page?
**Make sure:**
1. Server is running on port 3022
2. Frontend is running on port 3021
3. You're logged in
4. Transaction ID in URL is valid

### Photos Won't Upload?
**Check:**
1. File size < 10MB per photo
2. File type is JPG, PNG, GIF, or WEBP
3. You're uploading 5 or fewer photos
4. Internet connection is stable

---

## 🎬 Quick Demo Flow

### For Testing:

1. **Login as Regular User:**
   ```
   Email: user@test.com
   Password: password123
   ```

2. **Request a Checkout:**
   - Go to Items
   - Click any item
   - Click "Checkout"
   - Fill form and submit
   - **Status: Pending** (waiting for approval)

3. **Login as Admin:**
   ```
   Email: admin@test.com
   Password: password123
   ```

4. **Approve the Request:**
   - Go to Admin Panel
   - Find pending approval
   - Click "Approve"
   - **Status: Active**

5. **Back to Regular User:**
   - Go to Transactions
   - Click the approved transaction
   - Click **"Upload Photos"** button 📸
   - Upload photos of storage visit!

---

## 📂 File Structure

The photo upload feature consists of:

### Frontend:
```
client/src/pages/StorageVisitPhoto.js
└── Photo upload form component

client/src/pages/TransactionDetail.js
└── Shows "Upload Photos" button
└── Displays uploaded photos
```

### Backend:
```
server/routes/storageVisits.js
└── POST /api/storage-visits/:transactionId/upload-photo
└── GET  /api/storage-visits/:transactionId
└── GET  /api/storage-visits (admin only)

server/storage/uploads/storage-visits/
└── Where photos are stored
```

---

## 🌐 API Endpoints

### Upload Photos:
```
POST /api/storage-visits/:transactionId/upload-photo
Content-Type: multipart/form-data

Body:
- photos: File[] (max 5)
- visitType: string (pickup|return|inspection|maintenance)
- location: string
- notes: string
- caption: string[] (one per photo)
```

### Get Storage Visits:
```
GET /api/storage-visits/:transactionId
Authorization: Bearer <token>
```

### Admin - All Visits:
```
GET /api/storage-visits
Authorization: Bearer <admin-token>
```

---

## ✅ Testing Checklist

- [ ] Can access transaction detail page
- [ ] "Upload Photos" button is visible
- [ ] Can click button and reach upload page
- [ ] Can select photos from computer
- [ ] Can preview selected photos
- [ ] Can add captions
- [ ] Can select visit type
- [ ] Can submit form successfully
- [ ] Photos appear on transaction detail page
- [ ] Photos are clickable to view full size

---

## 🎨 UI Features

### Upload Button Appearance:
- Blue gradient button with camera icon
- Text: "Upload Photos"
- Located in "Storage Visit Documentation" section

### Upload Page Design:
- Modern card-based layout
- Drag-and-drop area for photos
- Photo preview grid
- Form fields for metadata
- Success/error messages

---

## 📞 Need Help?

If you can't find the upload button:
1. Make sure you're on a **Transaction Detail page**
2. Scroll down to **"Storage Visit Documentation"** section
3. Check transaction status (must be pending, active, or approved)
4. Verify you're logged in

**Quick Access:**
```
Dashboard → Transactions → Click Any Transaction → Scroll Down → Upload Photos Button
```

---

Happy uploading! 📸✨


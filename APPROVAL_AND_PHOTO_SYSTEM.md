# 🔐 Approval System & 📸 Storage Photo Documentation

## Overview

The MSA Inventory system now includes a **mandatory approval workflow** for all checkouts and a **photo documentation system** for storage visits to ensure safety, accountability, and proper tracking.

---

## ✅ Approval System

### How It Works

#### 1. **Checkout Process** (Requires Approval)
```
User → Request Checkout → Pending Status → Admin/Manager Approval → Active Status → Can Pick Up Item
```

**Key Features:**
- ✅ **ALL checkouts require approval** (safety first!)
- ✅ Users submit checkout requests with:
  - Item details
  - Quantity
  - Purpose
  - Expected return date
  - Destination
- ✅ Requests go to **pending** status automatically
- ✅ Admins/Managers receive notifications
- ✅ Admins can **approve** or **reject** with reasons
- ✅ Users receive email/in-app notifications of decision

#### 2. **Return Process** (No Approval Needed)
```
User → Return Item → Upload Return Photos → Item Returned → Quantity Updated
```

**Key Features:**
- ✅ Returns happen **immediately** (no approval needed)
- ✅ Users can return items anytime
- ✅ System automatically:
  - Updates item quantity
  - Marks transaction as "returned"
  - Calculates late fees if overdue
  - Sends confirmation notifications

### User Roles

#### Admin
- Approve/reject all checkout requests
- View all storage visit photos
- Verify storage visits
- Manage all transactions

#### Manager
- Approve/reject checkout requests
- View all storage visit photos
- Verify storage visits
- Manage transactions

#### Regular User
- Request item checkouts (pending approval)
- Return items (no approval needed)
- Upload storage visit photos
- View own transactions

---

## 📸 Storage Photo Documentation System

### Why Photos Are Required

1. **Safety Tracking** - Know who enters storage and when
2. **Accountability** - Visual proof of condition at pickup/return
3. **Security** - Audit trail for all storage access
4. **Inventory Verification** - Confirm items match records

### When to Upload Photos

#### Required Situations:
- ✅ **Picking up items** from storage (after approval)
- ✅ **Returning items** to storage
- ⚠️ **Inspection visits** to storage area
- 🔧 **Maintenance** activities in storage

### How to Upload Photos

#### Step 1: Navigate to Transaction
```
Dashboard → Transactions → Select Transaction → Upload Photos Button
```

#### Step 2: Upload Photos
- Click "Upload Photos" button
- Select up to **5 photos** (max 10MB each)
- Supported formats: JPG, PNG, GIF, WEBP

#### Step 3: Add Details
- **Visit Type**: Pickup, Return, Inspection, or Maintenance
- **Storage Location**: Building, room, shelf details
- **Photo Captions**: Optional description for each photo
- **Additional Notes**: Any relevant information

#### Step 4: Submit
- Photos are securely stored
- Visible to admins and transaction owner
- Cannot be deleted (audit trail)

---

## 🔄 Complete Workflow Examples

### Example 1: Regular User Checking Out Equipment

1. **Request Checkout**
   - User: "I need a MacBook Pro for project work"
   - System: Creates transaction with status "pending"
   - Notifications sent to all admins/managers

2. **Admin Reviews & Approves**
   - Admin: Reviews request in Admin Panel
   - Admin: Approves request
   - System: Changes status to "active"
   - User: Receives approval notification

3. **User Picks Up Item**
   - User: Goes to storage location
   - User: Takes photos of themselves and the item
   - User: Uploads photos with "Pickup" visit type
   - System: Records storage visit with timestamp

4. **User Returns Item**
   - User: Brings item back to storage
   - User: Takes photos showing item condition
   - User: Marks transaction as returned
   - User: Uploads photos with "Return" visit type
   - System: Updates inventory immediately (no approval needed)

### Example 2: Admin Rejecting a Request

1. **User Requests Item**
   - System: Creates pending transaction

2. **Admin Rejects**
   - Admin: Reviews and clicks "Reject"
   - Admin: Provides reason: "Item is reserved for another event"
   - System: Marks transaction as "rejected"
   - User: Receives rejection notification with reason

---

## 🖥️ Admin Panel Features

### Pending Approvals Section
- View all pending checkout requests
- See user details, item details, purpose
- One-click approve/reject buttons
- Add rejection reasons
- Filter by date, user, item

### Storage Visits Tracking
- View all storage visits across all transactions
- See photos from each visit
- Verify visits (mark as verified)
- Filter by visit type, date range, user
- Export visit logs for reports

### Dashboard Stats
- Pending approvals count (high priority)
- Total storage visits this month
- Unverified visits count
- Most frequent storage users

---

## 📊 Technical Implementation

### Database Schema

#### Transaction Model Extensions
```javascript
{
  approvalRequired: Boolean (always true now),
  requiresStoragePhoto: Boolean (always true),
  storagePhotoUploaded: Boolean,
  storageVisits: [{
    visitDate: Date,
    visitType: String (pickup|return|inspection|maintenance),
    userId: ObjectId,
    photos: [{
      url: String,
      caption: String,
      uploadDate: Date
    }],
    location: String,
    notes: String,
    verifiedBy: ObjectId,
    verifiedDate: Date
  }]
}
```

### API Endpoints

#### Storage Visits
```
POST   /api/storage-visits/:transactionId/upload-photo
GET    /api/storage-visits/:transactionId
GET    /api/storage-visits (admin only)
PUT    /api/storage-visits/:transactionId/:visitId/verify (admin only)
```

#### Transactions (Updated)
```
POST   /api/transactions/checkout (always creates pending)
POST   /api/transactions/:id/return (no approval needed)
POST   /api/transactions/:id/approve (admin/manager)
POST   /api/transactions/:id/reject (admin/manager)
```

---

## 🚀 Getting Started

### For Users

1. **Request a Checkout**
   - Go to Items → Select Item → Click "Checkout"
   - Fill in details and submit
   - Wait for admin approval (you'll get notified)

2. **Upload Photos**
   - After approval, go to Transactions
   - Find your transaction
   - Click "Upload Photos"
   - Take/select photos and submit

3. **Return Items**
   - Go to your active transaction
   - Click "Mark as Returned"
   - Upload return photos
   - Done! No approval needed

### For Admins

1. **Approve Requests**
   - Go to Admin Panel
   - See "Pending Approvals" section
   - Review details
   - Click Approve or Reject

2. **Monitor Storage Access**
   - Go to Admin Panel → Storage Visits
   - View all storage access logs
   - Check photos
   - Verify visits

---

## 🔒 Security & Privacy

✅ Photos stored securely on server  
✅ Only transaction owner and admins can view  
✅ Audit trail maintained (cannot delete)  
✅ All uploads logged with timestamps  
✅ Photo file size limits enforced (10MB)  
✅ Only image files accepted  

---

## 📱 Mobile Friendly

- ✅ Camera access for direct photo capture
- ✅ Upload multiple photos at once
- ✅ Responsive design for all devices
- ✅ Touch-friendly upload interface
- ✅ Preview photos before uploading

---

## ❓ FAQ

**Q: Can I checkout items without approval?**  
A: No, all checkouts require admin/manager approval for safety and tracking.

**Q: Do I need approval to return items?**  
A: No, returns are immediate and don't require approval.

**Q: How many photos can I upload?**  
A: Up to 5 photos per storage visit, max 10MB each.

**Q: Can I delete photos after uploading?**  
A: No, photos are part of the permanent audit trail for safety.

**Q: What if I forget to upload photos?**  
A: You'll be reminded, but it's your responsibility to document each visit.

**Q: Who can see my storage visit photos?**  
A: Only you and admins/managers can view your storage visit photos.

**Q: What happens if my request is rejected?**  
A: You'll receive a notification with the rejection reason from the admin.

---

## 📞 Support

For questions or issues:
1. Contact your system administrator
2. Check the Admin Panel for pending items
3. Review notification emails for updates

---

**Implemented:** October 2024  
**Version:** 2.0  
**Status:** ✅ Active


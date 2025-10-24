# MSA Inventory Management System

A comprehensive full-stack inventory management system with QR code integration, role-based access control, and real-time notifications.

## 🌟 Features

### Core Features
- **Item Management**: Track items with quantities, categories, locations, and custom specifications
- **Transaction Management**: Checkout, return, reserve, and cancel operations
- **User Management**: Role-based access control (Admin, Manager, User)
- **QR Code Integration**: Generate and scan QR codes for quick checkout/return
- **Notifications**: Multi-channel notifications (email, SMS, in-app)
- **Analytics Dashboard**: Real-time statistics and reports
- **Approval Workflow**: Configurable approval process for restricted items
- **Overdue Detection**: Automatic detection and notifications for overdue items
- **Extension Requests**: Request and approve return date extensions

### QR Code Features
- **Generate QR Codes**: Each item gets a unique QR code
- **Quick Checkout**: Scan QR code to checkout items instantly
- **Quick Return**: Scan QR code to return checked-out items
- **Reserve Items**: Scan QR code to reserve items for future use
- **Item Information**: Scan QR code to view item details

### Security Features
- JWT authentication with bcrypt password hashing
- Role-based permissions system
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration

### Business Logic
- **Checkout Workflow**: Availability checks, approval requirements, quantity management
- **Return Workflow**: Condition tracking, overdue penalties, automatic quantity restoration
- **Overdue Detection**: Background job checks for overdue items daily
- **Penalty System**: Automatic late fees for overdue returns
- **Extension Workflow**: Request and approve return date extensions

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js**: Server framework
- **MongoDB** (or JSON file storage): Database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **QRCode**: QR code generation
- **Nodemailer**: Email notifications
- **Node-cron**: Background job scheduling

### Frontend
- **React**: UI framework
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **react-qr-scanner**: QR code scanning
- **recharts**: Analytics charts

## 📦 Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB (optional - can use JSON storage)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5001
NODE_ENV=development

# For MongoDB (production)
MONGODB_URI=mongodb://localhost:27017/msa-inventory

# For JSON storage (demo)
# Leave MONGODB_URI empty or set STORAGE_MODE=json
STORAGE_MODE=json

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000

# Email configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
REACT_APP_API_URL=http://localhost:5001/api
```

4. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🗄️ Storage Options

### Option 1: MongoDB (Production)
- Full database with relationships
- Better performance for large datasets
- Supports advanced queries
- Set `MONGODB_URI` in `.env`

### Option 2: JSON File Storage (Demo/Development)
- No database installation required
- Perfect for demos and testing
- Data stored in `server/storage/data/`
- Set `STORAGE_MODE=json` in `.env`

## 👤 Default Users

After first run, create an admin user by registering and then manually updating the role in the database/JSON file.

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Items
- `GET /api/items` - Get all items (with filtering & pagination)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/adjust-quantity` - Adjust item quantity

### QR Codes
- `GET /api/qr/generate/:itemId` - Generate QR code for item
- `POST /api/qr/scan` - Process QR code scan (checkout/return/reserve)
- `GET /api/qr/item/:qrCode` - Get item by QR code

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions/checkout` - Checkout item
- `POST /api/transactions/:id/return` - Return item
- `POST /api/transactions/:id/approve` - Approve pending transaction
- `POST /api/transactions/:id/reject` - Reject pending transaction
- `POST /api/transactions/:id/extend` - Request extension

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/reset-password` - Reset user password

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/item-utilization` - Get item utilization rates
- `GET /api/analytics/user-activity` - Get user activity report
- `GET /api/analytics/overdue-patterns` - Get overdue patterns

## 🎯 Workflows

### Checkout Workflow
1. User selects item and quantity
2. System checks availability and permissions
3. If approval required → Transaction created with 'pending' status
4. If no approval → Transaction created with 'active' status, quantity reduced
5. Notifications sent to user and managers (if applicable)

### Return Workflow
1. User initiates return (via UI or QR scan)
2. System updates transaction status to 'returned'
3. Item quantity restored
4. If overdue → Penalty applied
5. Confirmation notification sent

### QR Code Workflow
1. Admin generates QR code for item
2. QR code printed and attached to physical item
3. User scans QR code with mobile device
4. User selects action (checkout/return/reserve/view)
5. System processes action and updates database
6. Confirmation shown on device

### Approval Workflow
1. User requests checkout for restricted item
2. Transaction created with 'pending' status
3. Managers/admins receive notification
4. Manager approves or rejects request
5. If approved → Quantity updated, user notified
6. If rejected → User notified with reason

## 📱 QR Code Integration

### Generating QR Codes
```javascript
// Generate QR code for an item
GET /api/qr/generate/:itemId

// Response includes QR code data URL
{
  "qrCode": "data:image/png;base64,...",
  "qrData": { "id": "...", "name": "...", "qrCode": "ITEM_..." }
}
```

### Scanning QR Codes
```javascript
// Scan QR code and perform action
POST /api/qr/scan
{
  "qrData": { "id": "...", "qrCode": "ITEM_..." },
  "action": "checkout", // or "return", "reserve", "view"
  "quantity": 1,
  "purpose": "Lab work",
  "expectedReturnDate": "2025-10-31"
}
```

## 🔐 Permissions

### User Roles
- **Admin**: Full access to everything
- **Manager**: Can manage items, approve requests, view analytics
- **User**: Can checkout and return items

### Permissions
- `canCheckout`: Checkout items
- `canReturn`: Return items
- `canApprove`: Approve/reject checkout requests
- `canManageItems`: Create/edit/delete items
- `canManageUsers`: Create/edit/delete users
- `canViewAnalytics`: View analytics and reports
- `canBulkImport`: Import items in bulk

## 📊 Analytics

The system provides comprehensive analytics:
- Total items and active checkout statistics
- Overdue items and pending approvals
- User activity reports
- Item utilization rates
- Transaction trends over time
- Category distribution
- Top checked-out items

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Ensure MongoDB is accessible (or use JSON storage)
3. Run `npm install`
4. Run `npm start`

### Frontend Deployment
1. Update `REACT_APP_API_URL` to production API URL
2. Run `npm run build`
3. Serve the `build` folder with a static server (Nginx, Apache, etc.)

### Docker Deployment (Coming Soon)
Docker configuration will be added for easy containerized deployment.

## 📝 License

MIT License - feel free to use this project for your organization.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please contact your system administrator or open an issue on GitHub.

## 🎓 Credits

Developed for MSA Inventory Management


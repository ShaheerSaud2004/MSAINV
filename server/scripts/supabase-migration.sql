-- MSA Inventory System - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  department VARCHAR(100) DEFAULT '',
  team VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  permissions JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  profile JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team VARCHAR(100) DEFAULT '',
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  qr_code VARCHAR(100) UNIQUE DEFAULT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) DEFAULT '',
  total_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'piece',
  location JSONB DEFAULT '{}',
  condition VARCHAR(50) DEFAULT 'good',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'lost')),
  is_checkoutable BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  cost JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  maintenance JSONB DEFAULT '{}',
  purchase_date TIMESTAMP WITH TIME ZONE,
  warranty_expiry TIMESTAMP WITH TIME ZONE,
  supplier JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  max_checkout_duration INTEGER DEFAULT 7,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team VARCHAR(100) DEFAULT '',
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  type VARCHAR(20) DEFAULT 'checkout' CHECK (type IN ('checkout', 'return', 'reserve', 'cancel', 'maintenance', 'adjustment')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'returned', 'overdue', 'cancelled', 'rejected')),
  quantity INTEGER DEFAULT 1,
  purpose TEXT DEFAULT '',
  expected_return_date TIMESTAMP WITH TIME ZONE,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  checkout_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  destination JSONB DEFAULT '{}',
  checkout_condition VARCHAR(50) DEFAULT 'good',
  return_condition VARCHAR(50) DEFAULT '',
  condition_on_return VARCHAR(50) DEFAULT '',
  notes TEXT DEFAULT '',
  return_notes TEXT DEFAULT '',
  approval_required BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_date TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT DEFAULT '',
  extensions JSONB DEFAULT '[]',
  penalties JSONB DEFAULT '[]',
  storage_visits JSONB DEFAULT '[]',
  penalty_amount DECIMAL(10, 2) DEFAULT 0,
  is_overdue BOOLEAN DEFAULT false,
  overdue_notification_sent BOOLEAN DEFAULT false,
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_date TIMESTAMP WITH TIME ZONE,
  requires_storage_photo BOOLEAN DEFAULT false,
  storage_photo_uploaded BOOLEAN DEFAULT false,
  checked_out_by UUID REFERENCES users(id) ON DELETE SET NULL,
  returned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  scanned_via_qr BOOLEAN DEFAULT false,
  qr_scan_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  channels JSONB DEFAULT '{}',
  delivery_status VARCHAR(50) DEFAULT 'pending',
  related_transaction UUID REFERENCES transactions(id) ON DELETE SET NULL,
  related_item UUID REFERENCES items(id) ON DELETE SET NULL,
  action_url VARCHAR(500) DEFAULT '',
  action_text VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest Requests Table
CREATE TABLE IF NOT EXISTS guest_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team VARCHAR(100) DEFAULT '',
  requester_name VARCHAR(100) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(20) DEFAULT '',
  item_name VARCHAR(200) NOT NULL,
  item_description TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  purpose TEXT DEFAULT '',
  expected_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_qr_code ON items(qr_code);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_guest_requests_team ON guest_requests(team);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_requests_updated_at BEFORE UPDATE ON guest_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using API key)
-- You may want to customize these based on your security needs
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON guest_requests FOR ALL USING (true);


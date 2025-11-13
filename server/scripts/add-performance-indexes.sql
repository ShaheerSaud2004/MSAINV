-- Performance Optimization Indexes for Supabase
-- Run this in Supabase SQL Editor to improve query performance

-- Additional indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_items_status_category ON items(status, category);
CREATE INDEX IF NOT EXISTS idx_items_name_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, is_read);

-- Composite index for common transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_item_status ON transactions(item_id, status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_date ON transactions(checkout_date);
CREATE INDEX IF NOT EXISTS idx_transactions_expected_return_date ON transactions(expected_return_date);

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE items;
ANALYZE transactions;
ANALYZE notifications;
ANALYZE guest_requests;






-- Reset Production Data for Supabase
-- This script clears all transaction history, notifications, and guest requests
-- while preserving users, items, and core system data

-- Clear all transactions
DELETE FROM transactions;

-- Clear all notifications
DELETE FROM notifications;

-- Clear all guest requests
DELETE FROM guest_requests;

-- Optional: Reset sequences if you want to start IDs from 1
-- ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE guest_requests_id_seq RESTART WITH 1;

-- Verify counts (should all be 0)
SELECT 
    (SELECT COUNT(*) FROM transactions) as transaction_count,
    (SELECT COUNT(*) FROM notifications) as notification_count,
    (SELECT COUNT(*) FROM guest_requests) as guest_request_count,
    (SELECT COUNT(*) FROM items) as item_count,
    (SELECT COUNT(*) FROM users) as user_count;


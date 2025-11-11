#!/bin/bash

echo "🚀 Supabase Setup Helper"
echo "========================"
echo ""
echo "This script will help you set up Supabase."
echo ""
echo "Step 1: You need to run the SQL migration manually:"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Click your project"
echo "  3. SQL Editor → New Query"
echo "  4. Copy from: server/scripts/supabase-migration.sql"
echo "  5. Paste and Run"
echo ""
read -p "Press Enter after you've run the SQL migration..."

echo ""
echo "Step 2: Checking tables..."
node server/scripts/setupSupabase.js


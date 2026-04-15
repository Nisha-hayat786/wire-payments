-- Add owner_id to merchants table to link with Supabase Auth
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use owner_id instead of wallet_address for more secure lookups
DROP POLICY IF EXISTS "Merchants can view their own profile" ON merchants;
CREATE POLICY "Merchants can view their own profile" ON merchants
    FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Merchants can view their own invoices" ON invoices;
CREATE POLICY "Merchants can view their own invoices" ON invoices
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_owner_id ON merchants(owner_id);

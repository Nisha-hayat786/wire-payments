-- Security Overhaul & Advanced Logic

-- 1. Enable pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Profiles for Admin/User roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update Merchants for Hashed Keys & Ownership
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS api_key_hash TEXT;
ALTER TABLE merchants DROP COLUMN IF EXISTS api_key; -- Removing plain text keys

-- 4. Update Invoices with Partial Payment support
-- First, drop the old constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
-- Add the new constraint
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'paid', 'partially_paid', 'expired', 'failed'));

-- 5. RLS Policies Hardening
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admins can see everything
CREATE POLICY "Admins have global access" ON merchants
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins have global access" ON invoices
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Merchants can see their own data
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Merchants can manage their own data" ON merchants
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Merchants can manage their own invoices" ON invoices
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. RPC for Key Verification
CREATE OR REPLACE FUNCTION verify_merchant_key(key_to_verify TEXT)
RETURNS UUID AS $$
DECLARE
    merchant_id UUID;
BEGIN
    SELECT id INTO merchant_id
    FROM merchants
    WHERE api_key_hash = crypt(key_to_verify, api_key_hash);
    
    RETURN merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

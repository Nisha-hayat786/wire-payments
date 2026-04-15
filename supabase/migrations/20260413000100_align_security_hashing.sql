-- Migration: 20260413000100_align_security_hashing.sql
-- Description: Standardize API key hashing to SHA-256 and fix webhook log permissions.

-- 1. Update verify_merchant_key RPC to use SHA-256 (matching Node.js lib/security.ts)
CREATE OR REPLACE FUNCTION verify_merchant_key(key_to_verify TEXT)
RETURNS UUID AS $$
DECLARE
    merchant_id UUID;
BEGIN
    SELECT id INTO merchant_id
    FROM merchants
    WHERE api_key_hash = encode(digest(key_to_verify, 'sha256'), 'hex');
    
    RETURN merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow INSERT on webhook_logs for authenticated merchants
-- (Used by dispatchWebhook when called from server routes with user context)
DROP POLICY IF EXISTS "Merchants can insert their own logs" ON webhook_logs;
CREATE POLICY "Merchants can insert their own logs" ON webhook_logs
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE owner_id = auth.uid()
        )
    );

-- 3. Ensure webhook_endpoints RLS allows secret read (for signing)
-- Usually only needed by the server, but if accessed via standard client:
DROP POLICY IF EXISTS "Merchants can manage their own endpoints" ON webhook_endpoints;
CREATE POLICY "Merchants can manage their own endpoints" ON webhook_endpoints
    FOR ALL USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE owner_id = auth.uid()
        )
    );

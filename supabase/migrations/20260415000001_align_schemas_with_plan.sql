-- Migration: Align database schema with Zod validation schemas from plan
-- This migration updates existing tables to match the schema definitions

-- ============================================================
-- 1. INVOICES TABLE - Add missing fields from plan
-- ============================================================

-- Add customer_email and customer_name for better invoice tracking
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add checkout_url for the payment page
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- Add paid_at timestamp for when payment was received
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Update status constraint to match plan (draft, pending, paid, expired, cancelled)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'pending', 'paid', 'expired', 'cancelled'));

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_status ON invoices(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_expires_at ON invoices(expires_at) WHERE status = 'pending';

-- ============================================================
-- 2. PAYMENTS TABLE - Align with plan's payment schema
-- ============================================================

-- Add currency field
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'WIRE';

-- Add status field (pending, confirming, confirmed, failed, expired)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'confirming', 'confirmed', 'failed', 'expired'));

-- Add confirmations count
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS confirmations INTEGER DEFAULT 0;

-- Add fee_amount for platform fees
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS fee_amount NUMERIC DEFAULT 0;

-- Add updated_at for consistency
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename amount_paid to amount for consistency (we'll add a new column)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- Migrate data from amount_paid to amount if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_paid') THEN
    UPDATE payments SET amount = amount_paid WHERE amount IS NULL;
  END IF;
END $$;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================
-- 3. MERCHANTS TABLE - Align with plan's merchant schema
-- ============================================================

-- Add business_email (separate from profile email)
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS business_email TEXT;

-- Add business_type (individual, company, nonprofit)
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'company'
  CHECK (business_type IN ('individual', 'company', 'nonprofit'));

-- Add settings JSONB for merchant preferences
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add website URL
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS website TEXT;

-- Add description
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- 4. WEBHOOK_ENDPOINTS TABLE - Use 'active' instead of 'is_active'
-- ============================================================

-- Add active column (keep is_active for now, we'll migrate)
ALTER TABLE webhook_endpoints
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Migrate data from is_active to active
UPDATE webhook_endpoints SET active = is_active WHERE active IS NULL;

-- Add last_triggered_at
ALTER TABLE webhook_endpoints
  ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- 5. CREATE API_KEYS TABLE (separate from merchants as per plan)
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,  -- First 12 chars for identification
  scopes TEXT[] DEFAULT ARRAY['read:invoices']::TEXT[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_merchant ON api_keys(merchant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- Enable RLS on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can manage their own API keys
CREATE POLICY "Merchants can manage their own api_keys"
  ON api_keys FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- Policy: Admins can see all API keys
CREATE POLICY "Admins can view all api_keys"
  ON api_keys FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Trigger for updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- 6. CREATE AUDIT_LOGS TABLE (from plan)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('api_key', 'user', 'system')),
  actor_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_merchant_created ON audit_logs(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_type, actor_id, created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can view their own audit logs
CREATE POLICY "Merchants can view own audit logs"
  ON audit_logs FOR SELECT
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- Policy: Service role full access
CREATE POLICY "Service role full access to audit logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 7. UPDATE WEBHOOK_LOGS to match plan
-- ============================================================

-- Add status enum to match plan
ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS http_status INTEGER;

-- Add attempt_count (rename from retry_count if exists)
ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Migrate retry_count to attempt_count
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'retry_count') THEN
    UPDATE webhook_logs SET attempt_count = retry_count WHERE attempt_count = 0;
  END IF;
END $$;

-- Add next_retry_at for retry logic
ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;

-- Add updated_at
ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update status constraint
ALTER TABLE webhook_logs
  ADD CONSTRAINT webhook_logs_status_check
  CHECK (status IN ('pending', 'sent', 'failed'));

-- ============================================================
-- 8. CREATE PROFILES TABLE if not exists (for auth integration)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- ============================================================
-- 9. HELPER FUNCTIONS
-- ============================================================

-- Function to expire old invoices
CREATE OR REPLACE FUNCTION expire_old_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'expired',
      updated_at = NOW()
  WHERE expires_at < NOW()
    AND status IN ('pending', 'draft');
END;
$$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_merchant_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_actor_type TEXT,
  p_actor_id TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_code TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    merchant_id, action, resource_type, resource_id,
    actor_type, actor_id, ip_address, user_agent,
    success, error_code, metadata
  ) VALUES (
    p_merchant_id, p_action, p_resource_type, p_resource_id,
    p_actor_type, p_actor_id, p_ip_address, p_user_agent,
    p_success, p_error_code, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. TRIGGERS for updated_at
-- ============================================================

-- Ensure webhook_logs has updated_at trigger
DROP TRIGGER IF EXISTS update_webhook_logs_updated_at ON webhook_logs;
CREATE TRIGGER update_webhook_logs_updated_at
  BEFORE UPDATE ON webhook_logs FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- NOTES FOR MIGRATION
-- ============================================================

-- After running this migration:
-- 1. Update API key usage to use new api_keys table
-- 2. Migrate any existing api_key_hash from merchants to api_keys table
-- 3. Update webhook endpoints to use 'active' instead of 'is_active'
-- 4. Update payment processing to set confirmations and status properly

-- Migration for existing API keys from merchants to api_keys table:
-- This will need to be done in application code as it requires generating key_prefix

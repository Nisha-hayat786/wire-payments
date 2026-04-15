-- Institutional Upgrade Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Add Branding Columns to Merchants
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS branding_color TEXT DEFAULT '#533afd',
ADD COLUMN IF NOT EXISTS branding_logo_url TEXT;

-- 2. Webhook Endpoints (Multi-endpoint support)
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] DEFAULT '{invoice.paid, invoice.failed}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Payouts Table (On-chain withdrawal tracking)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'WIRE',
    transaction_hash TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Update Webhook Logs to link to endpoints (Optional but recommended)
ALTER TABLE webhook_logs 
ADD COLUMN IF NOT EXISTS endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE SET NULL;

-- 5. RLS Policies
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage their own endpoints" ON webhook_endpoints
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE wallet_address = auth.uid()::text));

CREATE POLICY "Merchants can view their own payouts" ON payouts
    FOR SELECT USING (merchant_id IN (SELECT id FROM merchants WHERE wallet_address = auth.uid()::text));

-- 6. Triggers for Updated At
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

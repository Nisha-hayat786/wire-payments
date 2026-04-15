-- Migration: 20260413000000_fix_rls_policies.sql
-- Description: Align sub-table RLS with the owner_id transition.

-- 1. Webhook Endpoints
DROP POLICY IF EXISTS "Merchants can manage their own endpoints" ON webhook_endpoints;
CREATE POLICY "Merchants can manage their own endpoints" ON webhook_endpoints
    FOR ALL USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE owner_id = auth.uid()
        )
    );

-- 2. Payouts
DROP POLICY IF EXISTS "Merchants can view their own payouts" ON payouts;
CREATE POLICY "Merchants can view their own payouts" ON payouts
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE owner_id = auth.uid()
        )
    );

-- 3. Webhook Logs (Currently missing direct link to owner_id in policies)
DROP POLICY IF EXISTS "Merchants can view their own webhook logs" ON webhook_logs;
CREATE POLICY "Merchants can view their own webhook logs" ON webhook_logs
    FOR SELECT USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE owner_id = auth.uid()
        )
    );

-- 4. Payments
DROP POLICY IF EXISTS "Merchants can view their own payments" ON payments;
CREATE POLICY "Merchants can view their own payments" ON payments
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE merchant_id IN (
                SELECT id FROM merchants WHERE owner_id = auth.uid()
            )
        )
    );

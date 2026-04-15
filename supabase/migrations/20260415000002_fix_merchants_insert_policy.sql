-- Fix RLS policy for merchants table to allow inserts
-- The existing policy only had USING clause which doesn't work for INSERT

-- Drop the existing policy
DROP POLICY IF EXISTS "Merchants can manage their own data" ON merchants;

-- Create new policy with both USING and WITH CHECK
CREATE POLICY "Merchants can manage their own data" ON merchants
    FOR ALL
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Also ensure users can insert their own merchant record
CREATE POLICY "Users can insert their own merchant" ON merchants
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Ensure service role can do everything
CREATE POLICY "Service role full access to merchants" ON merchants
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config'

const supabaseAdmin = createClient(
  getConfig().NEXT_PUBLIC_SUPABASE_URL,
  getConfig().SUPABASE_SERVICE_ROLE_KEY
)

export async function verifyResourceOwnership(
  resourceType: string,
  resourceId: string,
  merchantId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from(resourceType)
      .select('merchant_id')
      .eq('id', resourceId)
      .single()

    if (error || !data) {
      return false
    }

    return data.merchant_id === merchantId
  } catch {
    return false
  }
}

export async function requireResourceOwnership(
  resourceType: string,
  resourceId: string,
  merchantId: string
): Promise<void> {
  const owns = await verifyResourceOwnership(resourceType, resourceId, merchantId)
  if (!owns) {
    throw new Error('FORBIDDEN')
  }
}

export function checkScope(scopes: string[], requiredScopes: string[]): boolean {
  if (scopes.includes('admin:all')) {
    return true
  }

  return requiredScopes.some(scope => scopes.includes(scope))
}

export function requireScope(scopes: string[], requiredScopes: string[]): void {
  if (!checkScope(scopes, requiredScopes)) {
    throw new Error('INSUFFICIENT_SCOPE')
  }
}

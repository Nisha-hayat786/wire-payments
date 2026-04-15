import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'
import { getConfig } from '../config'

const supabaseAdmin = createClient(
  getConfig().NEXT_PUBLIC_SUPABASE_URL,
  getConfig().SUPABASE_SERVICE_ROLE_KEY
)

export interface ApiKeyInfo {
  id: string
  merchantId: string
  name: string
  scopes: string[]
  active: boolean
  lastUsedAt: Date | null
}

const API_KEY_PREFIX = 'wp_'
const API_KEY_LENGTH = 32

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const random = randomBytes(API_KEY_LENGTH).toString('base64').slice(0, API_KEY_LENGTH)
  const key = `${API_KEY_PREFIX}${random}`
  const hash = hashApiKey(key)
  const prefix = key.slice(0, 12) // Store prefix for identification

  return { key, hash, prefix }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(API_KEY_PREFIX) && key.length > API_KEY_PREFIX.length
}

export async function verifyApiKey(key: string): Promise<ApiKeyInfo | null> {
  if (!isValidApiKeyFormat(key)) {
    return null
  }

  const hash = hashApiKey(key)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, merchant_id, name, scopes, active, last_used_at')
    .eq('key_hash', hash)
    .eq('active', true)
    .single()

  if (error || !data) {
    return null
  }

  // Update last used timestamp
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return {
    id: data.id,
    merchantId: data.merchant_id,
    name: data.name,
    scopes: data.scopes,
    active: data.active,
    lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : null,
  }
}

export function hasScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes('admin:all') || scopes.includes(requiredScope)
}

export async function createApiKey(
  merchantId: string,
  name: string,
  scopes: string[]
): Promise<{ key: string; prefix: string }> {
  const { key, hash, prefix } = generateApiKey()

  const { error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      merchant_id: merchantId,
      name,
      key_hash: hash,
      key_prefix: prefix,
      scopes,
      active: true,
    })

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`)
  }

  return { key, prefix }
}

export async function deleteApiKey(apiKeyId: string, merchantId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('api_keys')
    .delete()
    .eq('id', apiKeyId)
    .eq('merchant_id', merchantId)

  if (error) {
    throw new Error(`Failed to delete API key: ${error.message}`)
  }
}

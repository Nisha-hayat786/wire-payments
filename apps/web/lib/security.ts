import { randomBytes, createHash } from 'crypto';


import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';


/**
 * Generates a new secure API key with a prefix.
 * e.g., wp_live_3f7a...
 */
export function generateApiKey(): string {
  const bytes = randomBytes(24);
  const key = bytes.toString('hex');
  return `wp_live_${key}`;
}

/**
 * Hashes a raw API key using SHA-256 for database storage.
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Validates a merchant's API key.
 * This function handles the database lookup and hash comparison.
 */
export async function validateMerchantKey(rawKey: string): Promise<string | null> {
  const hash = hashApiKey(rawKey);
  
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('api_key_hash', hash)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

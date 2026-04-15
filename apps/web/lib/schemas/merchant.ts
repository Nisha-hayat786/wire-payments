import { z } from 'zod'

export const createMerchantSchema = z.object({
  business_name: z.string().min(2).max(200),
  business_email: z.string().email(),
  business_type: z.enum(['individual', 'company', 'nonprofit']).default('company'),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
})

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>

export const updateMerchantSchema = z.object({
  business_name: z.string().min(2).max(200).optional(),
  business_email: z.string().email().optional(),
  business_type: z.enum(['individual', 'company', 'nonprofit']).optional(),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>

export const merchantSchema = z.object({
  id: z.string().uuid(),
  business_name: z.string(),
  business_email: z.string().email(),
  business_type: z.enum(['individual', 'company', 'nonprofit']),
  website: z.string().nullable(),
  description: z.string().nullable(),
  settings: z.record(z.string(), z.unknown()).nullable(),
  api_key_prefix: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Merchant = z.infer<typeof merchantSchema>

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(['read:invoices', 'write:invoices', 'read:payments', 'admin:all'])),
})

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>

export const apiKeySchema = z.object({
  id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  name: z.string(),
  key_prefix: z.string(),
  scopes: z.array(z.string()),
  last_used_at: z.coerce.date().nullable(),
  expires_at: z.coerce.date().nullable(),
  active: z.boolean(),
  created_at: z.coerce.date(),
})

export type ApiKey = z.infer<typeof apiKeySchema>

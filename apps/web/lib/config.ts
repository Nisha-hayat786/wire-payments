import { z } from 'zod'

const EnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Wirefluid Network
  NEXT_PUBLIC_WIREFLUID_NETWORK_ID: z.string().transform(Number),
  NEXT_PUBLIC_WIREFLUID_RPC_URL: z.string().url(),

  // Webhook
  WEBHOOK_SECRET: z.string().min(32),
  WEBHOOK_SIGNING_KEY: z.string().min(32),

  // Redis (for rate limiting)
  REDIS_URL: z.string().url().optional(),
  REDIS_REST_API_URL: z.string().url().optional(),
  REDIS_REST_API_TOKEN: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof EnvSchema>

export function validateEnv(env = process.env): Env {
  try {
    return EnvSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('\n')
      throw new Error(`Configuration validation failed:\n${missing}`)
    }
    throw error
  }
}

// Validate config on import, but only in non-test environments
// In test environment, we'll validate explicitly in tests
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.BUN_TEST === '1'

let _config: Env | null = null
if (!isTestEnvironment) {
  try {
    _config = validateEnv()
  } catch (error) {
    // In development, show a helpful error but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error('Configuration validation failed:', error)
    }
    throw error
  }
}

export const getConfig = (): Env => {
  if (_config) return _config
  if (isTestEnvironment) {
    throw new Error('Cannot access config in test environment without explicit validation')
  }
  return validateEnv()
}

export const config = isTestEnvironment ? null : getConfig()

// Runtime config getters
export const isDevelopment = config?.NODE_ENV === 'development'
export const isProduction = config?.NODE_ENV === 'production'
export const isTest = config?.NODE_ENV === 'test'

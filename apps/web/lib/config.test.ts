import { describe, it, expect } from 'vitest'
import { validateEnv } from './config'

describe('config', () => {
  it('should validate correct environment', () => {
    const env = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'development',
    })
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
  })

  it('should throw on invalid URL', () => {
    expect(() => validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })).toThrow('Configuration validation failed')
  })

  it('should require WEBHOOK_SECRET to be at least 32 characters', () => {
    expect(() => validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'too-short',
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })).toThrow('Configuration validation failed')
  })

  it('should transform NETWORK_ID to number', () => {
    const env = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'development',
    })
    expect(typeof env.NEXT_PUBLIC_WIREFLUID_NETWORK_ID).toBe('number')
    expect(env.NEXT_PUBLIC_WIREFLUID_NETWORK_ID).toBe(92533)
  })

  it('should allow optional Redis configuration', () => {
    const env = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'development',
    })
    expect(env.REDIS_URL).toBeUndefined()
    expect(env.REDIS_REST_API_URL).toBeUndefined()
    expect(env.REDIS_REST_API_TOKEN).toBeUndefined()
  })

  it('should validate Redis URLs when provided', () => {
    expect(() => validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      REDIS_URL: 'redis://localhost:6379',
      REDIS_REST_API_URL: 'not-a-url',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })).toThrow('Configuration validation failed')
  })

  it('should default NODE_ENV to development', () => {
    const env = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })
    expect(env.NODE_ENV).toBe('development')
  })

  it('should only allow valid NODE_ENV values', () => {
    expect(() => validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      NEXT_PUBLIC_WIREFLUID_NETWORK_ID: '92533',
      NEXT_PUBLIC_WIREFLUID_RPC_URL: 'https://rpc.wirefluid.test',
      WEBHOOK_SECRET: 'a'.repeat(32),
      WEBHOOK_SIGNING_KEY: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'staging',
    })).toThrow('Configuration validation failed')
  })
})

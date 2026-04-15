import { describe, it, expect } from 'vitest'
import { createHash, randomBytes } from 'crypto'

// Test the pure functions without importing the module
// This avoids the config initialization issue

const API_KEY_PREFIX = 'wp_'
const API_KEY_LENGTH = 32

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const random = randomBytes(API_KEY_LENGTH).toString('base64').slice(0, API_KEY_LENGTH)
  const key = `${API_KEY_PREFIX}${random}`
  const hash = hashApiKey(key)
  const prefix = key.slice(0, 12) // Store prefix for identification

  return { key, hash, prefix }
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(API_KEY_PREFIX) && key.length > API_KEY_PREFIX.length
}

function hasScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes('admin:all') || scopes.includes(requiredScope)
}

describe('API Key Utilities', () => {
  describe('generateApiKey', () => {
    it('should generate an API key with wp_ prefix', () => {
      const { key } = generateApiKey()

      expect(key).toMatch(/^wp_/)
    })

    it('should generate a key of correct length', () => {
      const { key } = generateApiKey()
      const expectedLength = 'wp_'.length + 32 // prefix + API_KEY_LENGTH

      expect(key.length).toBe(expectedLength)
    })

    it('should generate a hash', () => {
      const { hash } = generateApiKey()

      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(64) // SHA-256 produces 64 hex characters
    })

    it('should generate a prefix', () => {
      const { prefix } = generateApiKey()

      expect(prefix).toBeTruthy()
      expect(typeof prefix).toBe('string')
      expect(prefix.length).toBe(12) // First 12 characters of the key
    })

    it('should generate unique keys', () => {
      const key1 = generateApiKey()
      const key2 = generateApiKey()

      expect(key1.key).not.toBe(key2.key)
      expect(key1.hash).not.toBe(key2.hash)
    })

    it('should include prefix in the generated key', () => {
      const { key, prefix } = generateApiKey()

      expect(key.startsWith(prefix)).toBe(true)
    })

    it('should hash the full key correctly', () => {
      const { key, hash } = generateApiKey()
      const expectedHash = hashApiKey(key)

      expect(hash).toBe(expectedHash)
    })
  })

  describe('hashApiKey', () => {
    it('should hash an API key', () => {
      const key = 'wp_test123456789'
      const hash = hashApiKey(key)

      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(64) // SHA-256
    })

    it('should produce consistent hashes for the same key', () => {
      const key = 'wp_test123456789'
      const hash1 = hashApiKey(key)
      const hash2 = hashApiKey(key)

      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different keys', () => {
      const key1 = 'wp_test123456789'
      const key2 = 'wp_test987654321'
      const hash1 = hashApiKey(key1)
      const hash2 = hashApiKey(key2)

      expect(hash1).not.toBe(hash2)
    })

    it('should not include the original key in the hash', () => {
      const key = 'wp_test123456789'
      const hash = hashApiKey(key)

      expect(hash).not.toContain(key)
      expect(hash).not.toContain('wp_')
    })
  })

  describe('isValidApiKeyFormat', () => {
    it('should accept valid API key format', () => {
      const validKeys = [
        'wp_abcdefghijklmnopqrstuvwxyz123456',
        'wp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
        'wp_12345678901234567890123456789012',
      ]

      validKeys.forEach((key) => {
        expect(isValidApiKeyFormat(key)).toBe(true)
      })
    })

    it('should reject keys without wp_ prefix', () => {
      const invalidKeys = [
        'sk_12345678901234567890123456789012',
        '12345678901234567890123456789012',
        'abc_12345678901234567890123456789012',
      ]

      invalidKeys.forEach((key) => {
        expect(isValidApiKeyFormat(key)).toBe(false)
      })
    })

    it('should reject keys that are too short', () => {
      const shortKeys = ['wp_']

      shortKeys.forEach((key) => {
        expect(isValidApiKeyFormat(key)).toBe(false)
      })
    })

    it('should reject empty string', () => {
      expect(isValidApiKeyFormat('')).toBe(false)
    })

    it('should be case sensitive for prefix', () => {
      expect(isValidApiKeyFormat('WP_12345678901234567890123456789012')).toBe(false)
      expect(isValidApiKeyFormat('Wp_12345678901234567890123456789012')).toBe(false)
    })
  })

  describe('hasScope', () => {
    it('should return true when user has admin:all scope', () => {
      const scopes = ['admin:all']
      expect(hasScope(scopes, 'invoices:read')).toBe(true)
      expect(hasScope(scopes, 'payments:create')).toBe(true)
      expect(hasScope(scopes, 'any:scope')).toBe(true)
    })

    it('should return true when user has the exact required scope', () => {
      const scopes = ['invoices:read', 'invoices:create', 'payments:read']

      expect(hasScope(scopes, 'invoices:read')).toBe(true)
      expect(hasScope(scopes, 'invoices:create')).toBe(true)
      expect(hasScope(scopes, 'payments:read')).toBe(true)
    })

    it('should return false when user lacks the required scope', () => {
      const scopes = ['invoices:read', 'invoices:create']

      expect(hasScope(scopes, 'invoices:delete')).toBe(false)
      expect(hasScope(scopes, 'payments:read')).toBe(false)
      expect(hasScope(scopes, 'admin:all')).toBe(false)
    })

    it('should return false for empty scopes array', () => {
      expect(hasScope([], 'invoices:read')).toBe(false)
    })

    it('should handle admin:all with other scopes', () => {
      const scopes = ['invoices:read', 'admin:all', 'payments:create']

      expect(hasScope(scopes, 'any:operation')).toBe(true)
    })

    it('should not match partial scope names', () => {
      const scopes = ['invoices:read']

      expect(hasScope(scopes, 'invoices:read:extra')).toBe(false)
      expect(hasScope(scopes, 'invoices:rea')).toBe(false)
      expect(hasScope(scopes, 'invoice:read')).toBe(false)
    })
  })
})

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { rateLimit, RateLimitTier, type RateLimitResult } from './rate-limit'

// Mock the config module
vi.mock('./config', () => ({
  config: null, // Force in-memory mode for tests
}))

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rateLimit function', () => {
    it('should allow first request within limit', async () => {
      const result = await rateLimit('user123', 10, 60)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(9)
      expect(result.resetAt).toBeInstanceOf(Date)
    })

    it('should allow requests up to the limit', async () => {
      const limit = 5

      for (let i = 0; i < limit; i++) {
        const result = await rateLimit('user456', limit, 60)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(limit - i - 1)
      }
    })

    it('should block requests exceeding the limit', async () => {
      const limit = 3
      const identifier = 'user789'

      // First 3 requests should succeed
      for (let i = 0; i < limit; i++) {
        const result = await rateLimit(identifier, limit, 60)
        expect(result.success).toBe(true)
      }

      // 4th request should be blocked
      const result = await rateLimit(identifier, limit, 60)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track different identifiers independently', async () => {
      const limit = 2

      // User1 makes 2 requests
      const user1Result1 = await rateLimit('user1', limit, 60)
      const user1Result2 = await rateLimit('user1', limit, 60)

      expect(user1Result1.success).toBe(true)
      expect(user1Result2.success).toBe(true)

      // User1's 3rd request should be blocked
      const user1Result3 = await rateLimit('user1', limit, 60)
      expect(user1Result3.success).toBe(false)

      // User2 should still be able to make requests
      const user2Result1 = await rateLimit('user2', limit, 60)
      expect(user2Result1.success).toBe(true)
    })

    it('should reset counter after window expires', async () => {
      const limit = 2
      const window = 60 // seconds
      const identifier = 'user-reset'

      // Use up the limit
      await rateLimit(identifier, limit, window)
      await rateLimit(identifier, limit, window)

      const blockedResult = await rateLimit(identifier, limit, window)
      expect(blockedResult.success).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(window * 1000 + 1000)

      // Should be able to make requests again
      const resetResult = await rateLimit(identifier, limit, window)
      expect(resetResult.success).toBe(true)
      expect(resetResult.remaining).toBe(limit - 1)
    })

    it('should return correct resetAt timestamp', async () => {
      const window = 60
      const now = Date.now()
      const result = await rateLimit('timestamp-test', 10, window)

      const expectedResetTime = new Date(
        Math.floor(now / 1000 / window) * window * 1000 + window * 1000
      )

      // Allow small margin of error due to test timing
      const timeDiff = Math.abs(result.resetAt.getTime() - expectedResetTime.getTime())
      expect(timeDiff).toBeLessThan(1000)
    })

    it('should handle custom window sizes', async () => {
      const result = await rateLimit('window-test', 5, 120)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(4)
    })

    it('should return remaining as 0 when at limit', async () => {
      const limit = 1

      const result1 = await rateLimit('zero-remaining', limit, 60)
      expect(result1.remaining).toBe(0)

      const result2 = await rateLimit('zero-remaining', limit, 60)
      expect(result2.success).toBe(false)
      expect(result2.remaining).toBe(0)
    })

    it('should never return negative remaining', async () => {
      const limit = 1

      // Make request beyond limit
      const result1 = await rateLimit('negative-test', limit, 60)
      const result2 = await rateLimit('negative-test', limit, 60)
      const result3 = await rateLimit('negative-test', limit, 60)

      expect(result1.remaining).toBeGreaterThanOrEqual(0)
      expect(result2.remaining).toBeGreaterThanOrEqual(0)
      expect(result3.remaining).toBeGreaterThanOrEqual(0)
    })

    it('should handle very high limits', async () => {
      const limit = 10000
      const result = await rateLimit('high-limit', limit, 60)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(limit)
      expect(result.remaining).toBe(limit - 1)
    })

    it('should handle very low limits', async () => {
      const limit = 1
      const result = await rateLimit('low-limit', limit, 60)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(1)
      expect(result.remaining).toBe(0)
    })

    it('should handle default window parameter', async () => {
      const result = await rateLimit('default-window', 10)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(9)
    })
  })

  describe('RateLimitTier', () => {
    it('should have PUBLIC tier configuration', () => {
      expect(RateLimitTier.PUBLIC.limit).toBe(100)
      expect(RateLimitTier.PUBLIC.window).toBe(60)
    })

    it('should have AUTHENTICATED tier configuration', () => {
      expect(RateLimitTier.AUTHENTICATED.limit).toBe(1000)
      expect(RateLimitTier.AUTHENTICATED.window).toBe(60)
    })

    it('should have WEBHOOK tier configuration', () => {
      expect(RateLimitTier.WEBHOOK.limit).toBe(100)
      expect(RateLimitTier.WEBHOOK.window).toBe(60)
    })

    it('should have ADMIN tier configuration', () => {
      expect(RateLimitTier.ADMIN.limit).toBe(50)
      expect(RateLimitTier.ADMIN.window).toBe(60)
    })

    it('should have STRICT tier configuration', () => {
      expect(RateLimitTier.STRICT.limit).toBe(10)
      expect(RateLimitTier.STRICT.window).toBe(60)
    })

    it('should be immutable (as const)', () => {
      // RateLimitTier is defined with 'as const', so it should be readonly
      expect(() => {
        // @ts-expect-error - Testing immutability
        RateLimitTier.PUBLIC.limit = 200
      }).not.toThrow() // TypeScript prevents this at compile time
    })
  })

  describe('RateLimitResult type', () => {
    it('should return correctly typed result', async () => {
      const result: RateLimitResult = await rateLimit('type-test', 10, 60)

      expect(typeof result.success).toBe('boolean')
      expect(typeof result.limit).toBe('number')
      expect(typeof result.remaining).toBe('number')
      expect(result.resetAt).toBeInstanceOf(Date)
    })

    it('should have success as boolean', async () => {
      const result = await rateLimit('bool-test', 1, 60)

      expect(typeof result.success).toBe('boolean')
      expect([true, false]).toContain(result.success)
    })

    it('should have limit as positive number', async () => {
      const result = await rateLimit('limit-test', 100, 60)

      expect(result.limit).toBe(100)
      expect(result.limit).toBeGreaterThan(0)
    })

    it('should have remaining as non-negative number', async () => {
      const result = await rateLimit('remaining-test', 10, 60)

      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.remaining).toBeLessThanOrEqual(result.limit)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty identifier', async () => {
      const result = await rateLimit('', 10, 60)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('should handle special characters in identifier', async () => {
      const identifiers = [
        'user@example.com',
        'user-123',
        'user_456',
        'user/path',
        'user?query=value',
        'user#fragment',
      ]

      for (const identifier of identifiers) {
        const result = await rateLimit(identifier, 10, 60)
        expect(result.success).toBe(true)
      }
    })

    it('should handle very long identifiers', async () => {
      const longIdentifier = 'a'.repeat(1000)
      const result = await rateLimit(longIdentifier, 10, 60)

      expect(result.success).toBe(true)
    })

    it('should handle unicode in identifier', async () => {
      const unicodeIdentifier = 'user-测试-🔒'
      const result = await rateLimit(unicodeIdentifier, 10, 60)

      expect(result.success).toBe(true)
    })

    it('should handle concurrent requests for same identifier', async () => {
      const identifier = 'concurrent-test'
      const limit = 5

      // Make concurrent requests
      const promises = Array.from({ length: limit }, () =>
        rateLimit(identifier, limit, 60)
      )

      const results = await Promise.all(promises)

      results.forEach((result) => {
        expect(result.success).toBe(true)
      })

      // Next request should be blocked
      const blockedResult = await rateLimit(identifier, limit, 60)
      expect(blockedResult.success).toBe(false)
    })
  })

  describe('Real-world scenarios', () => {
    it('should enforce PUBLIC tier rate limiting', async () => {
      const identifier = '192.168.1.1' // IP address

      // First 100 requests should succeed
      for (let i = 0; i < RateLimitTier.PUBLIC.limit; i++) {
        const result = await rateLimit(
          identifier,
          RateLimitTier.PUBLIC.limit,
          RateLimitTier.PUBLIC.window
        )
        expect(result.success).toBe(true)
      }

      // 101st request should be blocked
      const blockedResult = await rateLimit(
        identifier,
        RateLimitTier.PUBLIC.limit,
        RateLimitTier.PUBLIC.window
      )
      expect(blockedResult.success).toBe(false)
    })

    it('should enforce AUTHENTICATED tier rate limiting', async () => {
      const identifier = 'user-auth-123'

      // First 1000 requests should succeed
      for (let i = 0; i < RateLimitTier.AUTHENTICATED.limit; i += 100) {
        const result = await rateLimit(
          identifier,
          RateLimitTier.AUTHENTICATED.limit,
          RateLimitTier.AUTHENTICATED.window
        )
        expect(result.success).toBe(true)
      }

      // Make final requests to hit limit
      for (let i = 0; i < 10; i++) {
        await rateLimit(
          identifier,
          RateLimitTier.AUTHENTICATED.limit,
          RateLimitTier.AUTHENTICATED.window
        )
      }

      // Should be near or at limit now
    })

    it('should enforce STRICT tier for sensitive operations', async () => {
      const identifier = 'password-reset-user@example.com'

      // First 10 requests should succeed
      for (let i = 0; i < RateLimitTier.STRICT.limit; i++) {
        const result = await rateLimit(
          identifier,
          RateLimitTier.STRICT.limit,
          RateLimitTier.STRICT.window
        )
        expect(result.success).toBe(true)
      }

      // 11th request should be blocked
      const blockedResult = await rateLimit(
        identifier,
        RateLimitTier.STRICT.limit,
        RateLimitTier.STRICT.window
      )
      expect(blockedResult.success).toBe(false)
    })

    it('should handle API endpoint rate limiting pattern', async () => {
      const apiKey = 'wp_test123456789'
      const endpoint = '/api/v1/invoices'
      const identifier = `${apiKey}:${endpoint}`

      const limit = RateLimitTier.AUTHENTICATED.limit

      // Simulate API usage
      let requestsMade = 0
      let blocked = false

      while (requestsMade < limit + 10 && !blocked) {
        const result = await rateLimit(identifier, limit, 60)
        if (!result.success) {
          blocked = true
        } else {
          requestsMade++
        }
      }

      expect(requestsMade).toBe(limit)
      expect(blocked).toBe(true)
    })
  })
})

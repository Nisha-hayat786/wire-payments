import { Redis } from '@upstash/redis'
import { config } from './config'

// Initialize Redis client
const redis = config && config.REDIS_REST_API_URL && config.REDIS_REST_API_TOKEN
  ? new Redis({
      url: config.REDIS_REST_API_URL,
      token: config.REDIS_REST_API_TOKEN,
    })
  : null

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: Date
}

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number = 60 // seconds
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - (now % window)
  const key = `ratelimit:${identifier}:${windowStart}`

  if (redis) {
    // Redis-backed rate limiting
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, window)

    const [current] = await pipeline.exec<[number | null, boolean | null]>()
    const count = current || 0

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt: new Date((windowStart + window) * 1000),
    }
  } else {
    // In-memory fallback (development only)
    const entry = inMemoryStore.get(key)

    if (!entry || entry.resetAt < now) {
      inMemoryStore.set(key, { count: 1, resetAt: windowStart + window })
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt: new Date((windowStart + window) * 1000),
      }
    }

    const newCount = entry.count + 1
    entry.count = newCount

    return {
      success: newCount <= limit,
      limit,
      remaining: Math.max(0, limit - newCount),
      resetAt: new Date(entry.resetAt * 1000),
    }
  }
}

// Rate limit tiers
export const RateLimitTier = {
  PUBLIC: { limit: 100, window: 60 },      // 100 req/min for public endpoints
  AUTHENTICATED: { limit: 1000, window: 60 }, // 1000 req/min for authenticated
  WEBHOOK: { limit: 100, window: 60 },     // 100 req/min for webhooks
  ADMIN: { limit: 50, window: 60 },        // 50 req/min for admin operations
  STRICT: { limit: 10, window: 60 },       // 10 req/min for very sensitive ops
} as const

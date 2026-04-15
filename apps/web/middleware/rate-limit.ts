import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitTier } from '@/lib/rate-limit'
import { generateRequestId } from '@/lib/utils'

export function createRateLimitMiddleware(
  getIdentifier: (request: NextRequest) => string | Promise<string>,
  tier: keyof typeof RateLimitTier = 'AUTHENTICATED'
) {
  return async (request: NextRequest) => {
    const identifier = await getIdentifier(request)
    const config = RateLimitTier[tier]

    const result = await rateLimit(identifier, config.limit, config.window)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)} seconds.`,
            request_id: generateRequestId(),
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetAt.toISOString(),
            'Retry-After': Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString())

    return response
  }
}

// Helper extractors
export const extractIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export const extractApiKey = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}

import { NextRequest } from 'next/server'
import { verifyApiKey, hasScope } from '@/lib/auth'
import { getSession } from '@/lib/auth/session'

export type AuthContext = {
  type: 'api_key' | 'session'
  merchantId: string
  actorId: string
  scopes?: string[]
}

export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  // First try API key authentication
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
  if (apiKey) {
    const keyInfo = await verifyApiKey(apiKey)
    if (keyInfo) {
      return {
        type: 'api_key',
        merchantId: keyInfo.merchantId,
        actorId: keyInfo.id,
        scopes: keyInfo.scopes,
      }
    }
  }

  // Fall back to session authentication
  const session = await getSession()
  if (session && session.merchantId) {
    return {
      type: 'session',
      merchantId: session.merchantId,
      actorId: session.id,
    }
  }

  return null
}

export function requireScope(context: AuthContext, requiredScopes: string[]): boolean {
  if (context.type === 'session') {
    // Session users have full access within their merchant
    return true
  }

  if (context.scopes && hasScope(context.scopes, requiredScopes[0])) {
    return true
  }

  return false
}

export function extractAuthInfo(request: NextRequest): {
  ipAddress: string
  userAgent: string
} {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  }
}

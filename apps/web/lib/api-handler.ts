import { NextRequest, NextResponse } from 'next/server';
import { validateMerchantKey } from './security';
import { rateLimit, RateLimitTier } from './rate-limit';
import { supabaseAdmin } from './supabase-admin';

/**
 * API Handler Options
 */
export interface ApiHandlerOptions {
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;
  /** Rate limit tier (default: AUTHENTICATED) */
  rateLimitTier?: keyof typeof RateLimitTier;
  /** Custom rate limit (overrides tier if provided) */
  customRateLimit?: { limit: number; window: number };
  /** Log this request to audit logs (default: true) */
  auditLog?: boolean;
  /** CORS configuration */
  cors?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  };
}

/**
 * Auth context extracted from the request
 */
export interface AuthContext {
  merchantId: string;
  apiKey?: string;
}

/**
 * Handler function context
 */
export interface HandlerContext {
  req: NextRequest;
  auth?: AuthContext;
}

/**
 * Standard API response shape
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * HTTP method handler type
 */
export type ApiHandlerFn<T = any> = (
  req: NextRequest,
  context: HandlerContext
) => Promise<NextResponse<ApiResponse<T>>>;

/**
 * Creates a standardized API route handler with security middleware
 *
 * Features:
 * - Authentication via API key
 * - Rate limiting (Redis-backed with in-memory fallback)
 * - Security headers
 * - CORS support
 * - Audit logging
 * - Standardized error handling
 *
 * @example
 * ```ts
 * export const GET = withApiHandler(async (req, { auth }) => {
 *   const invoices = await getInvoices(auth.merchantId);
 *   return NextResponse.json({ data: invoices });
 * });
 * ```
 */
export function withApiHandler<T = any>(
  handler: ApiHandlerFn<T>,
  options: ApiHandlerOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  const {
    requireAuth = true,
    rateLimitTier = 'AUTHENTICATED',
    customRateLimit,
    auditLog = true,
    cors: corsConfig,
  } = options;

  return async (req: NextRequest) => {
    const startTime = Date.now();
    let authContext: AuthContext | undefined;
    let statusCode = 200;
    let errorMessage: string | undefined;

    // Extract IP address for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    try {
      // 1. Apply CORS headers
      const corsHeaders = buildCorsHeaders(corsConfig);
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
      }

      // 2. Authentication
      if (requireAuth) {
        const authResult = await authenticateRequest(req);
        if (!authResult.success) {
          statusCode = 401;
          errorMessage = authResult.error;
          await logAuditEvent(req, undefined, 'unauthorized', statusCode, authResult.error);
          return errorResponse(authResult.error || 'Unauthorized', 401, corsHeaders);
        }
        authContext = authResult.data;
      }

      // 3. Rate limiting
      const rateLimitConfig = customRateLimit || RateLimitTier[rateLimitTier];
      const rateLimitIdentifier = authContext
        ? `merchant:${authContext.merchantId}`
        : `ip:${ip}`;

      const rateLimitResult = await rateLimit(
        rateLimitIdentifier,
        rateLimitConfig.limit,
        rateLimitConfig.window
      );

      if (!rateLimitResult.success) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded';
        await logAuditEvent(req, authContext, 'rate_limited', statusCode);
        return errorResponse(
          'Rate limit exceeded. Please try again later.',
          429,
          corsHeaders,
          {
            'X-RateLimit-Limit': rateLimitConfig.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          }
        );
      }

      // 4. Execute the handler
      const response = await handler(req, { req, auth: authContext });

      // 5. Add security headers and rate limit info to successful response
      const securityHeaders = buildSecurityHeaders();
      const responseHeaders = new Headers(response.headers);

      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      Object.entries(securityHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      responseHeaders.set('X-RateLimit-Limit', rateLimitConfig.limit.toString());
      responseHeaders.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      responseHeaders.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString());

      // Clone response with new headers
      const duration = Date.now() - startTime;
      responseHeaders.set('X-Response-Time', `${duration}ms`);

      // 6. Audit logging
      if (auditLog) {
        await logAuditEvent(req, authContext, 'success', response.status || 200, undefined, duration);
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      statusCode = 500;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('[API Handler Error]', {
        path: req.nextUrl.pathname,
        method: req.method,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      await logAuditEvent(req, authContext, 'error', statusCode, errorMessage);

      return errorResponse(
        'Internal server error',
        500,
        buildCorsHeaders(corsConfig)
      );
    }
  };
}

/**
 * Authenticates a request using Bearer token
 */
async function authenticateRequest(
  req: NextRequest
): Promise<{ success: true; data: AuthContext } | { success: false; error: string }> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return { success: false, error: 'Missing Authorization header' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Invalid Authorization format. Expected: Bearer <api_key>' };
  }

  const apiKey = authHeader.slice(7);
  const merchantId = await validateMerchantKey(apiKey);

  if (!merchantId) {
    return { success: false, error: 'Invalid API key' };
  }

  return {
    success: true,
    data: { merchantId, apiKey },
  };
}

/**
 * Builds CORS headers based on configuration
 */
function buildCorsHeaders(corsConfig?: ApiHandlerOptions['cors']): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
  };

  if (corsConfig?.origin) {
    const origins = Array.isArray(corsConfig.origin)
      ? corsConfig.origin.join(', ')
      : corsConfig.origin;
    headers['Access-Control-Allow-Origin'] = origins;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  if (corsConfig?.methods) {
    headers['Access-Control-Allow-Methods'] = corsConfig.methods.join(', ');
  } else {
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
  }

  if (corsConfig?.headers) {
    headers['Access-Control-Allow-Headers'] = corsConfig.headers.join(', ');
  } else {
    headers['Access-Control-Allow-Headers'] =
      'Content-Type, Authorization, X-Requested-With';
  }

  return headers;
}

/**
 * Builds security headers for API responses
 */
function buildSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Creates a standardized error response
 */
function errorResponse(
  message: string,
  status: number,
  corsHeaders: Record<string, string> = {},
  additionalHeaders?: Record<string, string>
): NextResponse {
  const headers = { ...corsHeaders, ...buildSecurityHeaders(), ...additionalHeaders };

  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status, headers }
  );
}

/**
 * Logs an audit event to the database
 */
async function logAuditEvent(
  req: NextRequest,
  auth: AuthContext | undefined,
  outcome: 'success' | 'unauthorized' | 'rate_limited' | 'error',
  statusCode: number,
  errorMessage?: string,
  duration?: number
): Promise<void> {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = req.headers.get('user-agent') || undefined;

    await supabaseAdmin.from('api_audit_logs').insert([
      {
        merchant_id: auth?.merchantId || null,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        ip_address: ip,
        user_agent: userAgent,
        status_code: statusCode,
        outcome,
        error_message: errorMessage,
        response_time_ms: duration,
      },
    ]);
  } catch (error) {
    // Don't throw on audit log failures - just log to console
    console.error('[Audit Log Error]', error);
  }
}

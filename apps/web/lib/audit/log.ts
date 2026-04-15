import { supabaseAdmin } from '../supabase-admin'

export interface AuditLogOptions {
  merchantId: string
  action: string
  resourceType: string
  resourceId?: string
  actorType: 'api_key' | 'user' | 'system'
  actorId: string
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorCode?: string
  metadata?: Record<string, any>
}

export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        merchant_id: options.merchantId,
        action: options.action,
        resource_type: options.resourceType,
        resource_id: options.resourceId || null,
        actor_type: options.actorType,
        actor_id: options.actorId,
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || null,
        success: options.success ?? true,
        error_code: options.errorCode || null,
        metadata: options.metadata || {},
      })
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the application
    console.error('Failed to log audit event:', error)
  }
}

// Action constants for consistency
export const AuditAction = {
  // API Key actions
  API_KEY_CREATED: 'api_key.created',
  API_KEY_DELETED: 'api_key.deleted',
  API_KEY_ROTATED: 'api_key.rotated',
  API_KEY_USED: 'api_key.used',

  // Invoice actions
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_DELETED: 'invoice.deleted',
  INVOICE_VIEWED: 'invoice.viewed',

  // Payment actions
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  PAYMENT_FAILED: 'payment.failed',

  // Webhook actions
  WEBHOOK_CREATED: 'webhook.created',
  WEBHOOK_UPDATED: 'webhook.updated',
  WEBHOOK_DELETED: 'webhook.deleted',
  WEBHOOK_SENT: 'webhook.sent',
  WEBHOOK_FAILED: 'webhook.failed',

  // Auth actions
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  SESSION_REFRESHED: 'auth.session_refreshed',

  // Merchant actions
  MERCHANT_CREATED: 'merchant.created',
  MERCHANT_UPDATED: 'merchant.updated',

  // Admin actions
  WITHDRAWAL_INITIATED: 'withdrawal.initiated',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  WITHDRAWAL_FAILED: 'withdrawal.failed',
} as const

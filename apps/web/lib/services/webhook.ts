import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'
import { getConfig } from '../config'
import type { WebhookEndpoint, WebhookLog } from '../schemas'

const config = getConfig()

const supabaseAdmin = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY
)

export interface WebhookPayload {
  id: string
  event: string
  data: any
  timestamp: number
}

export async function sendWebhook(
  endpointId: string,
  event: string,
  data: any
): Promise<void> {
  // Get webhook endpoint
  const { data: endpoint, error: endpointError } = await supabaseAdmin
    .from('webhook_endpoints')
    .select()
    .eq('id', endpointId)
    .eq('active', true)
    .single()

  if (endpointError || !endpoint) {
    console.error('Webhook endpoint not found:', endpointId)
    return
  }

  // Create webhook payload
  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    data,
    timestamp: Date.now(),
  }

  // Generate signature
  const signature = generateSignature(payload, endpoint.secret)

  // Create webhook log entry
  const { data: log, error: logError } = await supabaseAdmin
    .from('webhook_logs')
    .insert({
      webhook_endpoint_id: endpointId,
      event_type: event,
      status: 'pending',
      attempt_count: 0,
      payload,
    })
    .select()
    .single()

  if (logError) {
    console.error('Failed to create webhook log:', logError)
    return
  }

  // Attempt delivery
  await deliverWebhook(log.id, endpoint.url, payload, signature)
}

async function deliverWebhook(
  logId: string,
  url: string,
  payload: WebhookPayload,
  signature: string
): Promise<void> {
  let attemptCount = 0
  const maxAttempts = 5
  let backoff = 1000 // Start with 1 second

  while (attemptCount < maxAttempts) {
    attemptCount++

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': payload.id,
          'X-Webhook-Event': payload.event,
          'User-Agent': `WirePayments-Webhook/1.0`,
        },
        body: JSON.stringify(payload),
      })

      // Update log
      if (response.ok) {
        await supabaseAdmin
          .from('webhook_logs')
          .update({
            status: 'sent',
            http_status: response.status,
            attempt_count: attemptCount,
          })
          .eq('id', logId)
        return
      }

      // Failed - schedule retry
      const nextRetryAt = new Date(Date.now() + backoff)
      await supabaseAdmin
        .from('webhook_logs')
        .update({
          status: 'pending',
          http_status: response.status,
          attempt_count: attemptCount,
          next_retry_at: nextRetryAt.toISOString(),
          response_body: (await response.text()).slice(0, 1000),
        })
        .eq('id', logId)

      backoff *= 2 // Exponential backoff

    } catch (error) {
      console.error('Webhook delivery failed:', error)

      // Network error - schedule retry
      const nextRetryAt = new Date(Date.now() + backoff)
      await supabaseAdmin
        .from('webhook_logs')
        .update({
          status: 'pending',
          attempt_count: attemptCount,
          next_retry_at: nextRetryAt.toISOString(),
        })
        .eq('id', logId)

      backoff *= 2
    }
  }

  // Max attempts reached - mark as failed
  await supabaseAdmin
    .from('webhook_logs')
    .update({
      status: 'failed',
      attempt_count: attemptCount,
    })
    .eq('id', logId)
}

export function generateSignature(payload: WebhookPayload, secret: string): string {
  const hmac = createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  return `sha256=${hmac.digest('hex')}`
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(JSON.parse(payload), secret)
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function getActiveWebhooks(
  merchantId: string,
  event: string
): Promise<WebhookEndpoint[]> {
  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .select()
    .eq('merchant_id', merchantId)
    .eq('active', true)
    .contains('events', [event])

  if (error) return []
  return data as WebhookEndpoint[]
}

export async function triggerWebhooks(
  merchantId: string,
  event: string,
  data: any
): Promise<void> {
  const endpoints = await getActiveWebhooks(merchantId, event)

  for (const endpoint of endpoints) {
    await sendWebhook(endpoint.id, event, data)
  }
}

// Retry failed webhooks (cron job)
export async function retryFailedWebhooks(): Promise<void> {
  const { data: logs } = await supabaseAdmin
    .from('webhook_logs')
    .select('id, webhook_endpoints!inner(url, secret)')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .limit(100)

  if (!logs) return

  for (const log of logs as any[]) {
    const endpoint = log.webhook_endpoints
    await deliverWebhook(
      log.id,
      endpoint.url,
      log.payload,
      generateSignature(log.payload, endpoint.secret)
    )
  }
}

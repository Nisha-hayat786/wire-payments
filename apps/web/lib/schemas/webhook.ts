import { z } from 'zod'

export const createWebhookEndpointSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum([
    'invoice.created',
    'invoice.paid',
    'invoice.expired',
    'payment.pending',
    'payment.confirmed',
    'payment.failed',
  ])).min(1, 'Select at least one event'),
  secret: z.string().min(1, 'Webhook secret required'),
  description: z.string().max(500).optional(),
})

export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>

export const updateWebhookEndpointSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
})

export type UpdateWebhookEndpointInput = z.infer<typeof updateWebhookEndpointSchema>

export const testWebhookSchema = z.object({
  webhook_id: z.string().uuid(),
  event: z.string(),
  test_data: z.record(z.string(), z.unknown()).optional(),
})

export type TestWebhookInput = z.infer<typeof testWebhookSchema>

export const webhookEndpointSchema = z.object({
  id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  url: z.string().url(),
  events: z.array(z.string()),
  description: z.string().nullable(),
  active: z.boolean(),
  last_triggered_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type WebhookEndpoint = z.infer<typeof webhookEndpointSchema>

export const webhookLogSchema = z.object({
  id: z.string().uuid(),
  webhook_endpoint_id: z.string().uuid(),
  event_type: z.string(),
  status: z.enum(['pending', 'sent', 'failed']),
  http_status: z.number().int().nullable(),
  attempt_count: z.number().int().default(0),
  next_retry_at: z.coerce.date().nullable(),
  response_body: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type WebhookLog = z.infer<typeof webhookLogSchema>

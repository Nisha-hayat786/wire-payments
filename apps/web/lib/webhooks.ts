import { createHmac, randomBytes } from 'crypto';
import { supabase } from './supabase';

/**
 * Generates a unique signing secret for a merchant's webhooks.
 */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`;
}

/**
 * Signs a JSON payload using HMAC-SHA256 with the merchant's secret.
 * This allows the merchant to verify that the webhook came from us.
 */
export function signWebhookPayload(payload: any, secret: string): string {
  const data = JSON.stringify(payload);
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Dispatches a webhook event to all registered and active endpoints for a merchant.
 */
export async function dispatchWebhook(invoiceId: string | null, eventType: string, payload: any, manualMerchantId?: string) {
  let merchant = null;

  if (invoiceId && invoiceId !== 'test_event') {
    // 1. Fetch Invoice & Merchant
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, merchants(*)')
      .eq('id', invoiceId)
      .single();
    
    if (invoice?.merchants) {
      merchant = invoice.merchants;
    }
  } else if (manualMerchantId) {
    const { data: m } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', manualMerchantId)
      .single();
    merchant = m;
  }

  if (!merchant) return;

  // 2. Fetch Active Webhook Endpoints for this merchant
  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true);

  if (!endpoints || endpoints.length === 0) return;

  // Filter endpoints based on event subscription, but ALWAYS allow 'ping' events for testing
  const targetEndpoints = endpoints.filter(ep => 
    eventType === 'ping' || (ep.events && ep.events.includes(eventType))
  );

  if (targetEndpoints.length === 0) return;

  const timestamp = Date.now();
  const eventId = `evt_${randomBytes(12).toString('hex')}`;

  // 3. Dispatch to each endpoint
  const results = await Promise.all(targetEndpoints.map(async (endpoint) => {
    const signature = signWebhookPayload({ ...payload, timestamp }, endpoint.secret);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WirePayments-Signature': signature,
          'X-WirePayments-Timestamp': timestamp.toString(),
          'X-WirePayments-Event-Id': eventId,
        },
        body: JSON.stringify({
          id: eventId,
          type: eventType,
          created: timestamp,
          data: payload
        }),
      });

      const responseText = await response.text();

      // Log result for this specific endpoint
      await supabase.from('webhook_logs').insert([{
        merchant_id: merchant.id,
        invoice_id: (invoiceId && invoiceId !== 'test_event') ? invoiceId : null,
        endpoint_id: endpoint.id,
        payload: { event_id: eventId, type: eventType, data: payload },
        response_code: response.status,
        response_body: responseText.slice(0, 1000), // Cap length
        status: response.ok ? 'succeeded' : 'failed'
      }]);

      return response.ok;
    } catch (err: any) {
      console.error(`[Webhook Error] Endpoint: ${endpoint.url}`, err);
      await supabase.from('webhook_logs').insert([{
        merchant_id: merchant.id,
        invoice_id: (invoiceId && invoiceId !== 'test_event') ? invoiceId : null,
        endpoint_id: endpoint.id,
        payload: { event_id: eventId, type: eventType, data: payload },
        status: 'failed',
        response_body: err.message || 'Network error / Timeout'
      }]);
      return false;
    }

  }));

  return results.every(Boolean);
}

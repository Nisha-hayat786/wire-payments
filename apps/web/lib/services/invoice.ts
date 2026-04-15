import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config'
import type { CreateInvoiceInput, ListInvoicesInput, Invoice } from '../schemas'

const config = getConfig()

const supabaseAdmin = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY
)

export async function createInvoice(
  input: CreateInvoiceInput,
  merchantId: string
): Promise<Invoice> {
  // Generate invoice ID and checkout URL
  const invoiceId = crypto.randomUUID()
  const checkoutUrl = `${config.NEXT_PUBLIC_APP_URL}/checkout/${invoiceId}`

  // Calculate expiration
  const expiresAt = new Date(Date.now() + input.expires_in_hours * 60 * 60 * 1000)

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      id: invoiceId,
      merchant_id: merchantId,
      amount: input.amount,
      currency: input.currency,
      description: input.description || null,
      metadata: input.metadata || {},
      customer_email: input.customer_email || null,
      customer_name: input.customer_name || null,
      checkout_url: checkoutUrl,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`)
  }

  return data as Invoice
}

export async function getInvoice(
  invoiceId: string,
  merchantId?: string
): Promise<Invoice | null> {
  let query = supabaseAdmin
    .from('invoices')
    .select()
    .eq('id', invoiceId)

  if (merchantId) {
    query = query.eq('merchant_id', merchantId)
  }

  const { data, error } = await query.single()

  if (error) return null
  return data as Invoice
}

export async function listInvoices(
  input: ListInvoicesInput,
  merchantId: string
): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
  let query = supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchantId)

  // Apply filters
  if (input.status) {
    query = query.eq('status', input.status)
  }
  if (input.customer_email) {
    query = query.eq('customer_email', input.customer_email)
  }
  if (input.from_date) {
    query = query.gte('created_at', input.from_date.toISOString())
  }
  if (input.to_date) {
    query = query.lte('created_at', input.to_date.toISOString())
  }

  // Apply pagination
  const from = (input.page - 1) * input.limit
  const to = from + input.limit - 1

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`)
  }

  return {
    invoices: (data || []) as Invoice[],
    total: count || 0,
    page: input.page,
    limit: input.limit,
  }
}

export async function updateInvoice(
  invoiceId: string,
  merchantId: string,
  updates: Partial<CreateInvoiceInput>
): Promise<Invoice> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('merchant_id', merchantId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update invoice: ${error.message}`)
  }

  return data as Invoice
}

export async function cancelInvoice(
  invoiceId: string,
  merchantId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('invoices')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('merchant_id', merchantId)

  if (error) {
    throw new Error(`Failed to cancel invoice: ${error.message}`)
  }
}

export async function markInvoicePaid(
  invoiceId: string,
  transactionHash: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (error) {
    throw new Error(`Failed to mark invoice as paid: ${error.message}`)
  }
}

export async function expireOldInvoices(): Promise<void> {
  const { error } = await supabaseAdmin
    .from('invoices')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .lt('expires_at', new Date().toISOString())
    .in('status', ['pending', 'draft'])

  if (error) {
    console.error('Failed to expire old invoices:', error)
  }
}

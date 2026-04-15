import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config'
import type { VerifyPaymentInput, Payment } from '../schemas'
import { markInvoicePaid, getInvoice } from './invoice'

const config = getConfig()

const supabaseAdmin = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY
)

export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<Payment> {
  // Get invoice
  const invoice = await getInvoice(input.invoice_id, '')
  if (!invoice) {
    throw new Error('INVOICE_NOT_FOUND')
  }

  if (invoice.status === 'paid') {
    throw new Error('INVOICE_ALREADY_PAID')
  }

  if (invoice.status === 'expired' || invoice.status === 'cancelled') {
    throw new Error('INVOICE_INVALID')
  }

  // Check if payment already exists for this transaction
  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select()
    .eq('transaction_hash', input.transaction_hash)
    .single()

  if (existingPayment) {
    return existingPayment as Payment
  }

  // Verify payment on blockchain (placeholder - implement actual blockchain verification)
  const isValid = await verifyOnChainPayment(
    invoice.amount,
    invoice.currency,
    input.transaction_hash
  )

  if (!isValid) {
    throw new Error('PAYMENT_VERIFICATION_FAILED')
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      invoice_id: input.invoice_id,
      merchant_id: invoice.merchant_id,
      amount: invoice.amount,
      currency: invoice.currency,
      status: 'confirmed',
      transaction_hash: input.transaction_hash,
      block_number: input.block_number,
      confirmations: 1,
    })
    .select()
    .single()

  if (paymentError) {
    throw new Error(`Failed to create payment: ${paymentError.message}`)
  }

  // Mark invoice as paid
  await markInvoicePaid(input.invoice_id, input.transaction_hash)

  return payment as Payment
}

async function verifyOnChainPayment(
  amount: number,
  currency: string,
  transactionHash: string
): Promise<boolean> {
  // TODO: Implement actual blockchain verification
  // This would connect to the Wirefluid RPC and verify the transaction
  // For now, return true as a placeholder
  return true
}

export async function getPayment(
  paymentId: string,
  merchantId: string
): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select()
    .eq('id', paymentId)
    .eq('merchant_id', merchantId)
    .single()

  if (error) return null
  return data as Payment
}

export async function listPayments(
  merchantId: string,
  options: {
    invoiceId?: string
    status?: string
    page?: number
    limit?: number
  } = {}
): Promise<{ payments: Payment[]; total: number }> {
  let query = supabaseAdmin
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchantId)

  if (options.invoiceId) {
    query = query.eq('invoice_id', options.invoiceId)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }

  const page = options.page || 1
  const limit = options.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to list payments: ${error.message}`)
  }

  return {
    payments: (data || []) as Payment[],
    total: count || 0,
  }
}

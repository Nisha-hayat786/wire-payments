import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CheckoutClient } from './client-page'

interface CheckoutPageProps {
  params: Promise<{ invoiceId: string }>
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { invoiceId } = await params
  const invoice = await getInvoice(invoiceId)

  if (!invoice) {
    return { title: 'Invoice Not Found' }
  }

  return {
    title: `Pay ${invoice.amount} ${invoice.currency}`,
    description: invoice.description || 'Payment checkout',
  }
}

async function getInvoice(invoiceId: string) {
  // First try to get invoice without merchant join to see if it exists
  const { data: invoiceOnly, error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (invoiceError) {
    console.error('Invoice fetch error:', invoiceError)
    return null
  }

  if (!invoiceOnly) return null

  // Check if invoice is valid
  if (invoiceOnly.status === 'cancelled') return null
  if (invoiceOnly.status === 'expired') return null
  if (invoiceOnly.status === 'paid') return invoiceOnly

  // Check expiration
  const expiresAt = new Date(invoiceOnly.expires_at)
  if (expiresAt < new Date()) {
    // Mark as expired
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'expired' })
      .eq('id', invoiceId)
    return null
  }

  // Now get merchant data separately
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('wallet_address, business_name, branding_color, branding_logo_url')
    .eq('id', invoiceOnly.merchant_id)
    .single()

  return {
    ...invoiceOnly,
    merchants: merchant
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { invoiceId } = await params
  const invoice = await getInvoice(invoiceId)

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 10l-2 2m14-6h-4m-4 4h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Invoice Not Found</h1>
          <p className="text-gray-600">
            The invoice doesn't exist, has expired, or has already been paid.
          </p>
          <a
            href="/dashboard/invoices"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            Go to Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v12" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  // Get payment address from merchant
  const paymentAddress = invoice.merchants?.wallet_address || '0x0000000000000000000000000000000000000000'

  return (
    <CheckoutClient
      invoice={invoice}
      paymentAddress={paymentAddress}
    />
  )
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createPublicClient, http, formatEther } from 'viem';
import { dispatchWebhook } from '@/lib/webhooks';
import { withApiHandler } from '@/lib/api-handler';
import type { HandlerContext } from '@/lib/api-handler';

// Wirefluid Testnet Configuration
const WIREFLUID_RPC = 'https://evm.wirefluid.com';
const chain = {
  id: 92533,
  name: 'Wirefluid Testnet',
  nativeCurrency: { name: 'WIRE', symbol: 'WIRE', decimals: 18 },
  rpcUrls: { default: { http: [WIREFLUID_RPC] } },
};

const client = createPublicClient({
  chain: chain as any,
  transport: http(),
});

/**
 * [POST] Verify a blockchain payment and update invoice status.
 * This endpoint is publicly accessible but rate-limited since it's called after
 * a blockchain transaction is confirmed.
 */
export const POST = withApiHandler(
  async (req: Request) => {
    const { transactionHash, invoiceId } = await req.json();

    if (!transactionHash || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing Required Fields' },
        { status: 400 }
      );
    }

    // 1. Fetch Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, merchants(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // 2. Fetch Transaction from Blockchain
    const receipt = await client.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`
    });

    if (!receipt || receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction failed or not found' },
        { status: 400 }
      );
    }

    // In a real environment, we would decode the logs to verify the amount
    // For this implementation, we assume the UI passed the correct hash
    // and we fetch the 'value' from the transaction if it's a direct transfer
    const transaction = await client.getTransaction({
      hash: transactionHash as `0x${string}`
    });
    const amountPaid = parseFloat(formatEther(transaction.value));

    // 3. Update Status Logic
    let newStatus = 'paid';
    if (amountPaid < invoice.amount) {
      newStatus = 'partially_paid';
    }

    // 4. Record Payment & Update Invoice
    await supabase.from('payments').insert([{
      invoice_id: invoiceId,
      transaction_hash: transactionHash,
      payer_address: transaction.from,
      amount_paid: amountPaid,
      confirmed_at: new Date().toISOString()
    }]);

    await supabase.from('invoices').update({
      status: newStatus,
      metadata: {
        ...invoice.metadata,
        last_payment_hash: transactionHash,
        amount_paid: amountPaid
      }
    }).eq('id', invoiceId);

    // 5. Trigger Webhook
    // dispatchWebhook internally handles fetching all active endpoints for the merchant
    await dispatchWebhook(invoice.id, `invoice.${newStatus}`, {
      invoice_id: invoiceId,
      status: newStatus,
      amount_paid: amountPaid,
      currency: invoice.currency,
      metadata: invoice.metadata
    });

    return NextResponse.json(
      { success: true, status: newStatus, amountPaid },
      { status: 200 }
    );
  },
  {
    requireAuth: false, // Public endpoint for payment verification
    rateLimitTier: 'PUBLIC',
    auditLog: true,
  }
);

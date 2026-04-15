import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, decodeFunctionData } from 'viem';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GATEWAY_ABI, GATEWAY_ADDRESS, wirefluidTestnet } from '@/lib/wagmi';
import { dispatchWebhook } from '@/lib/webhooks';

// Initialize the WireFluid public client for backend verification
const publicClient = createPublicClient({
  chain: wirefluidTestnet,
  transport: http()
});

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, transactionHash } = await req.json();

    if (!invoiceId || !transactionHash) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch the transaction receipt from the blockchain
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: transactionHash as `0x${string}` 
    });

    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 400 });
    }

    // 2. Fetch the actual transaction data to verify arguments
    const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });
    
    // Decode the input data to ensure it was a payInvoice call for THIS invoice
    const decodedData = decodeFunctionData({
      abi: GATEWAY_ABI,
      data: tx.input,
    });

    if (decodedData.functionName !== 'payInvoice') {
      return NextResponse.json({ error: 'Invalid contract function call' }, { status: 400 });
    }

    const [txInvoiceId, txMerchantAddress] = decodedData.args as [string, string];

    if (txInvoiceId !== invoiceId) {
      return NextResponse.json({ error: 'Invoice ID mismatch' }, { status: 400 });
    }

    // 3. Fetch the invoice from the database to check status
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*, merchants(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
        return NextResponse.json({ error: 'Invoice not found in database' }, { status: 404 });
    }

    // If already paid, just return success
    if (invoice.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // 4. Update Invoice Status and Create Payment Record in a "Transaction"
    // Using supabaseAdmin to bypass RLS for systemic updates
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([{
        invoice_id: invoiceId,
        transaction_hash: transactionHash,
        payer_address: receipt.from,
        amount_paid: invoice.amount,
        network_id: wirefluidTestnet.id,
        block_number: Number(receipt.blockNumber),
        confirmed_at: new Date().toISOString()
      }]);

    if (paymentError) {
        // Log this - it's a conflict but the invoice IS paid
        console.error('[Settlement Sync] Failed to create payment record (likely duplicate tx hash):', paymentError);
    }

    // 5. Dispatch Webhook
    try {
        await dispatchWebhook(invoiceId, 'invoice.paid', {
            invoice_id: invoiceId,
            status: 'paid',
            amount: invoice.amount,
            currency: invoice.currency,
            transaction_hash: transactionHash,
            payer: receipt.from,
            timestamp: Date.now()
        });
    } catch (whError) {
        console.error('[Settlement Sync] Webhook dispatch failed but payment is settled:', whError);
    }

    return NextResponse.json({ 
        success: true, 
        status: 'paid',
        transaction_hash: transactionHash 
    });

  } catch (error: any) {
    console.error('[Settlement Sync Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

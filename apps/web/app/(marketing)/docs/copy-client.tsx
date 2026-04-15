'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyClient() {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || 'https://wirepayments.com' : 'https://wirepayments.com');

  const apiUrl = `${baseUrl}/api/v1`;

  const handleCopy = () => {
    const content = `You are an expert developer integrating WirePayments API.

## Quick Start
1. Get your API key from ${baseUrl}/dashboard/developers
2. Use Base URL: ${apiUrl}
3. Auth: Authorization: Bearer wp_live_your_key

## Core Endpoints
POST ${apiUrl}/invoices - Create payment invoice
GET ${apiUrl}/invoices/{id} - Get invoice status
GET ${apiUrl}/invoices - List all invoices
GET ${apiUrl}/merchants/stats - Get account stats

## Webhook Events
payment.received - Payment detected on-chain
payment.confirmed - Payment confirmed (12 blocks)

## Integration Flow
1. Create invoice → Get checkout_url
2. Redirect user to checkout
3. Receive payment.confirmed webhook
4. Verify signature, fulfill order

Full docs: ${baseUrl}/docs/api-reference`;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-3 px-6 py-4 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      {copied ? 'Copied!' : 'Copy Quick Start'}
    </button>
  );
}

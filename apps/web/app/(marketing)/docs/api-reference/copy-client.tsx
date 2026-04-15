'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { config } from '@/lib/config';

export function CopyClient() {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || 'https://wirepayments.com' : 'https://wirepayments.com');

  const apiUrl = `${baseUrl}/api/v1`;

  const handleCopy = () => {
    const content = `# WirePayments API Documentation

## Base URL
${apiUrl}

## Authentication
All API requests require an API key in the header:
Authorization: Bearer wp_live_your_api_key_here

## Endpoints

### 1. Create Invoice
POST /v1/invoices
{
  "amount": 100.50,
  "currency": "WIRE",
  "description": "Payment for services",
  "redirect_url": "${baseUrl}/success",
  "metadata": {
    "order_id": "12345"
  }
}

### 2. Get Invoice
GET /v1/invoices/{id}

### 3. List Invoices
GET /v1/invoices?limit=20&offset=0&status=pending

### 4. Get Merchant Stats
GET /v1/merchants/stats

## Webhook Events
- payment.received: Payment detected on-chain
- payment.confirmed: Payment confirmed (12 blocks)

## Integration Flow
1. Create invoice → Get checkout_url
2. Redirect user to checkout
3. Receive payment.confirmed webhook
4. Verify signature, fulfill order
`;

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
      {copied ? 'Copied!' : 'Copy Prompt'}
    </button>
  );
}

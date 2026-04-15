'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Code2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function WebhooksPage() {
  return (
    <div className="space-y-16 pb-32">
      {/* Header */}
      <div className="space-y-6">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
           <Badge variant="outline" className="text-stripe-purple border-stripe-purple/20 bg-stripe-purple/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase">
             Integration Guide
           </Badge>
           <h1 className="text-6xl font-light tracking-tighter text-deep-navy mt-6">Webhooks</h1>
           <p className="text-lg text-slate mt-4 max-w-2xl">
             Receive real-time payment notifications on your server with secure signature verification.
           </p>
        </motion.div>
      </div>

      {/* Setup */}
      <section className="space-y-8">
        <h2 className="text-2xl font-light text-deep-navy">Setup</h2>
        <div className="bg-slate-50 rounded-2xl p-8 space-y-4">
          <Step num={1} title="Configure Webhook URL" desc="Set your webhook URL in Dashboard → Developers" />
          <Step num={2} title="Verify Signatures" desc="Use HMAC-SHA256 to verify incoming webhooks" />
          <Step num={3} title="Handle Events" desc="Process payment.received and payment.confirmed events" />
        </div>
      </section>

      {/* Signature Verification */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy flex items-center gap-3">
          <Shield className="w-6 h-6 text-stripe-purple" />
          Signature Verification
        </h2>
        <div className="bg-deep-navy rounded-2xl p-8 overflow-hidden">
          <div className="flex items-center gap-2 text-white/60 mb-6">
            <Code2 className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Node.js Example</span>
          </div>
          <pre className="text-sm font-mono text-white/80 leading-relaxed overflow-x-auto">
{`import { createHmac } from 'crypto';

const verifySignature = (payload, signature, secret) => {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expected;
};

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-wirepayments-signature'];
  const isValid = verifySignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process the event
  const { event, data } = req.body;
  if (event === 'payment.confirmed') {
    // Fulfill the order
  }

  res.json({ received: true });
});`}
          </pre>
        </div>
      </section>

      {/* Events */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Events</h2>
        <div className="space-y-4">
          <EventCard
            name="payment.received"
            desc="Fired when payment is first detected on-chain"
            color="blue"
          />
          <EventCard
            name="payment.confirmed"
            desc="Fired when payment is confirmed (12 block confirmations)"
            color="green"
          />
        </div>
      </section>

      {/* Payload Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Webhook Payload</h2>
        <div className="bg-slate-50 rounded-2xl p-6">
          <pre className="text-sm font-mono text-slate overflow-x-auto">
{`{
  "event": "payment.confirmed",
  "timestamp": "2024-04-15T10:30:00Z",
  "data": {
    "invoice_id": "uuid-here",
    "amount": "100.50",
    "currency": "WIRE",
    "transaction_hash": "0x...",
    "confirmations": 12
  },
  "signature": "hmac_sha256_signature_here"
}`}
          </pre>
        </div>
      </section>

      {/* Back to Docs */}
      <div className="pt-8">
        <Link href="/docs" className="inline-flex items-center gap-2 text-stripe-purple hover:text-[#4434d4] font-medium">
          ← Back to Documentation
        </Link>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-stripe-purple text-white flex items-center justify-center text-sm font-bold shrink-0">
        {num}
      </div>
      <div>
        <h4 className="font-medium text-deep-navy">{title}</h4>
        <p className="text-sm text-slate mt-1">{desc}</p>
      </div>
    </div>
  );
}

function EventCard({ name, desc, color }: { name: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5" />
        <code className="text-sm font-bold">{name}</code>
      </div>
      <p className="text-sm mt-2 opacity-80">{desc}</p>
    </div>
  );
}

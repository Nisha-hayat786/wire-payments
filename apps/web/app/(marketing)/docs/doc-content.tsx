import Link from 'next/link';
import { Code2, Shield, Globe, ChevronRight } from 'lucide-react';

export function DocContent() {
  return (
    <>
      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-6">
        <DocCard
          href="/docs/api-reference"
          icon={Code2}
          title="API Reference"
          desc="Complete API documentation with all endpoints, parameters, and responses."
          color="purple"
        />
        <DocCard
          href="/docs/webhooks"
          icon={Shield}
          title="Webhooks"
          desc="Secure event delivery with HMAC signature verification."
          color="green"
        />
      </div>

      {/* Quick Start */}
      <section className="space-y-8">
        <h2 className="text-2xl font-light text-deep-navy">Quick Start</h2>
        <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
          <Step num={1} title="Get API Key" desc="Navigate to Dashboard → Developers → API Keys" />
          <Step num={2} title="Create Invoice" desc="POST /v1/invoices with amount and description" />
          <Step num={3} title="Redirect User" desc="Send customer to the returned checkout_url" />
          <Step num={4} title="Receive Payment" desc="Listen for payment.confirmed webhook event" />
        </div>
      </section>

      {/* Code Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Integration Example</h2>
        <div className="bg-deep-navy rounded-2xl p-8 overflow-hidden">
          <div className="flex items-center gap-2 text-white/60 mb-6">
            <Code2 className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Create Invoice</span>
          </div>
          <pre className="text-sm font-mono text-white/80 leading-relaxed overflow-x-auto">
{`const response = await fetch('/api/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wp_live_your_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100.50,
    currency: 'WIRE',
    description: 'Order #12345'
  })
});

const { checkout_url } = await response.json();
// Redirect user to checkout_url`}
          </pre>
        </div>
      </section>

      {/* Links */}
      <div className="flex items-center justify-between p-8 rounded-2xl bg-slate-50">
        <div>
          <h3 className="font-medium text-deep-navy">Need full API documentation?</h3>
          <p className="text-sm text-slate mt-1">Complete endpoint reference with all responses and error codes.</p>
        </div>
        <Link href="/docs/api-reference" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-deep-navy hover:border-stripe-purple transition-all">
          View API Reference <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}

function DocCard({ href, icon: Icon, title, desc, color }: { href: string; icon: any; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    purple: 'text-stripe-purple bg-stripe-purple/10 border-stripe-purple/20',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <Link href={href} className="group">
      <div className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all h-full">
        <div className={`w-12 h-12 rounded-xl ${colors[color]} border flex items-center justify-center mb-6`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-medium text-deep-navy mb-2 group-hover:text-stripe-purple transition-colors">{title}</h3>
        <p className="text-sm text-slate">{desc}</p>
      </div>
    </Link>
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

import { Code2, ArrowRight, AlertTriangle, Terminal, Shield, Zap, Globe } from 'lucide-react';

export function DocsContent() {
  return (
    <>
      {/* Endpoints */}
      <section id="invoices" className="space-y-12">
        <h2 className="text-2xl font-light text-deep-navy">API Endpoints</h2>

        <EndpointCard
          method="POST"
          endpoint="/v1/invoices"
          title="Create Invoice"
          description="Generate a new payment invoice with custom amount and metadata."
          params={[
            { name: "amount", type: "number", required: true, desc: "Payment amount (e.g., 100.50)" },
            { name: "currency", type: "string", required: false, desc: "Currency code (default: WIRE)" },
            { name: "description", type: "string", required: false, desc: "Invoice description" },
            { name: "redirect_url", type: "string", required: false, desc: "Post-payment redirect URL" },
            { name: "metadata", type: "object", required: false, desc: "Custom key-value pairs" },
            { name: "expires_in_seconds", type: "number", required: false, desc: "TTL (default: 86400)" },
          ]}
          response={{ id: "uuid", amount: 100.50, currency: "WIRE", status: "pending", checkout_url: "..." }}
          outcomes={[
            { code: "201", status: "success", desc: "Invoice created successfully" },
            { code: "400", status: "error", desc: "Invalid amount (must be > 0)" },
            { code: "401", status: "error", desc: "Unauthorized - invalid API key" },
            { code: "429", status: "error", desc: "Rate limit exceeded" },
          ]}
        />

        <EndpointCard
          method="GET"
          endpoint="/v1/invoices/{id}"
          title="Get Invoice"
          description="Retrieve details of a specific invoice by ID."
          params={[]}
          response={{ id: "uuid", amount: 100.50, currency: "WIRE", status: "pending", created_at: "2024-01-15T00:00:00Z" }}
          outcomes={[
            { code: "200", status: "success", desc: "Invoice found" },
            { code: "404", status: "error", desc: "Invoice not found" },
          ]}
        />

        <EndpointCard
          method="GET"
          endpoint="/v1/invoices"
          title="List Invoices"
          description="List all invoices with pagination and filtering."
          params={[
            { name: "limit", type: "number", required: false, desc: "Results per page (default: 20)" },
            { name: "offset", type: "number", required: false, desc: "Pagination offset" },
            { name: "status", type: "string", required: false, desc: "Filter by status" },
          ]}
          response={{ data: [], pagination: { total: 100, limit: 20, offset: 0 } }}
          outcomes={[
            { code: "200", status: "success", desc: "Invoices retrieved" },
          ]}
        />

        <EndpointCard
          method="GET"
          endpoint="/v1/merchants/stats"
          title="Merchant Stats"
          description="Get aggregated statistics for your account."
          params={[]}
          response={{ total_invoices: 150, total_paid: 120, total_revenue: "15000.00", pending_payout: "2500.00" }}
          outcomes={[
            { code: "200", status: "success", desc: "Stats retrieved" },
          ]}
        />
      </section>

      {/* Invoice Status Flow */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Invoice Status Flow</h2>
        <div className="flex items-center justify-center gap-4 py-8">
          <StatusBadge status="pending" />
          <ArrowRight className="w-6 h-6 text-slate-300" />
          <StatusBadge status="paid" />
          <ArrowRight className="w-6 h-6 text-slate-300 rotate-90 ml-8" />
          <StatusBadge status="expired" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <StatusCard status="pending" color="amber" desc="Awaiting payment" />
          <StatusCard status="paid" color="green" desc="Payment confirmed" />
          <StatusCard status="expired" color="slate" desc="Time expired" />
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks" className="space-y-8">
        <h2 className="text-2xl font-light text-deep-navy">Webhook Events</h2>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <p className="text-sm text-slate mb-4">Webhooks are sent to your configured URL when payment events occur. Verify signatures using HMAC-SHA256.</p>
          <WebhookEventCard
            event="payment.received"
            desc="Fired when payment is first detected on-chain"
            payload={{ event: "payment.received", invoice_id: "uuid", amount: "100.50", transaction_hash: "0x..." }}
          />
          <WebhookEventCard
            event="payment.confirmed"
            desc="Fired when payment is confirmed (12 block confirmations)"
            payload={{ event: "payment.confirmed", invoice_id: "uuid", amount: "100.50", confirmations: 12 }}
          />
        </div>
      </section>

      {/* Errors */}
      <section id="errors" className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Error Codes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ErrorCard code="400" desc="Bad Request - Invalid parameters" />
          <ErrorCard code="401" desc="Unauthorized - Invalid API key" />
          <ErrorCard code="404" desc="Not Found - Resource doesn't exist" />
          <ErrorCard code="429" desc="Too Many Requests - Rate limit exceeded" />
          <ErrorCard code="500" desc="Internal Server Error" />
        </div>
      </section>

      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Integration Example</h2>
        <div className="bg-deep-navy rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">User Flow</span>
          </div>
          <div className="space-y-3 text-sm text-white/80 font-mono">
            <FlowStep num={1} text="Create invoice via POST /v1/invoices" />
            <FlowStep num={2} text="Redirect user to checkout_url" />
            <FlowStep num={3} text="User completes payment with wallet" />
            <FlowStep num={4} text="Receive payment.confirmed webhook" />
            <FlowStep num={5} text="Verify signature, fulfill order" />
          </div>
        </div>
      </section>
    </>
  );
}

interface EndpointCardProps {
  method: string;
  endpoint: string;
  title: string;
  description: string;
  params: Array<{ name: string; type: string; required: boolean; desc: string }>;
  response: any;
  outcomes: Array<{ code: string; status: string; desc: string }>;
}

function EndpointCard({ method, endpoint, title, description, params, response, outcomes }: EndpointCardProps) {
  const methodColor = method === 'POST' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
      <div className="flex items-center gap-4">
        <span className={`${methodColor} text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase`}>{method}</span>
        <code className="text-sm font-mono text-deep-navy">{endpoint}</code>
      </div>
      <div>
        <h3 className="text-xl font-medium text-deep-navy">{title}</h3>
        <p className="text-sm text-slate mt-1">{description}</p>
      </div>

      {params.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Parameters</h4>
          <div className="space-y-2">
            {params.map((param) => (
              <div key={param.name} className="flex items-start gap-3 text-sm">
                <code className="font-mono text-stripe-purple min-w-[100px]">{param.name}</code>
                <span className="text-slate flex-1">{param.desc}</span>
                {param.required && <span className="text-red-500 text-xs">required</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Response</h4>
        <pre className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate overflow-x-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Possible Outcomes</h4>
        <div className="space-y-2">
          {outcomes.map((outcome) => (
            <div key={outcome.code} className="flex items-center gap-3 text-sm">
              <span className={`font-mono min-w-[50px] ${outcome.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {outcome.code}
              </span>
              <span className="text-slate">{outcome.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    expired: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function StatusCard({ status, color, desc }: { status: string; color: string; desc: string }) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    slate: 'bg-slate-50 border-slate-100 text-slate-700',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-sm font-bold uppercase">{status}</p>
      <p className="text-xs opacity-70 mt-1">{desc}</p>
    </div>
  );
}

function WebhookEventCard({ event, desc, payload }: { event: string; desc: string; payload: any }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 mb-3">
      <div className="flex items-center justify-between mb-2">
        <code className="text-sm font-bold text-deep-navy">{event}</code>
      </div>
      <p className="text-xs text-slate mb-3">{desc}</p>
      <pre className="bg-slate-50 p-3 rounded-lg text-[10px] font-mono text-slate overflow-x-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

function ErrorCard({ code, desc }: { code: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl border border-red-100 bg-red-50">
      <p className="text-lg font-bold text-red-600">{code}</p>
      <p className="text-xs text-red-500 mt-1">{desc}</p>
    </div>
  );
}

function FlowStep({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-stripe-purple font-bold">{num}.</span>
      <span className="text-white/70">{text}</span>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Globe,
  Lock,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stripe-purple/10 selection:text-stripe-purple overflow-x-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#533afd 1px, transparent 1px)', backgroundSize: '64px 64px' }} 
      />

      <section className="relative pt-48 pb-32 px-8 z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
          >
            <Badge variant="outline" className="text-stripe-purple border-stripe-purple/10 bg-stripe-purple/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
              Global Pricing
            </Badge>
            <h1 className="text-[56px] md:text-[96px] leading-[0.85] font-light tracking-tighter text-deep-navy">
              Institutional <span className="text-stripe-purple italic">growth</span>, <br />
              fully automated.
            </h1>
            <p className="text-xl text-slate/70 font-light leading-relaxed max-w-2xl mx-auto">
              Simple, transparent pricing for teams scaling on-chain. No hidden fees, no middleman, just pure technical clarity.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mt-32 px-4">
           <TierCard 
             tier="Standard" 
             fee="0.5%" 
             desc="Perfect for startups and small teams processing their first global payments."
             features={[
               "Native WIRE Settlement",
               "Standard HMAC Webhooks",
               "Metadata API Access",
               "Community Support"
             ]}
           />
           <TierCard 
             tier="Growth" 
             fee="0.3%" 
             highlight
             desc="Designed for expanding businesses requiring higher priority and custom L2 routes."
             features={[
               "Priority Network Routing",
               "Custom L2 Gateway Support",
               "Advanced Churn Analytics",
               "Dedicated Integration Manager"
             ]}
           />
           <TierCard 
             tier="Enterprise" 
             fee="Custom" 
             desc="Tailored liquidity endpoints and direct contract support for Tier-1 institutions."
             features={[
               "Sovereign Node Deployment",
               "Volume-based Rebates",
               "Direct Technical Support",
               "Private RPC Endpoints"
             ]}
           />
        </div>
      </section>

      {/* Global Coverage Section */}
      <section className="py-48 px-8 border-y border-slate/10 bg-slate-50 relative z-10">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 text-left">
               <div className="space-y-6">
                  <Badge className="bg-success-green/10 text-success-green hover:bg-success-green/20 border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">Network Reach</Badge>
                  <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-deep-navy leading-[1.1]">Transparent <br/><span className="text-stripe-purple italic">infrastructure</span>.</h2>
                  <p className="text-xl text-slate font-light leading-relaxed max-w-lg">
                     We charge a flat settlement fee. There are no maintenance costs, storage fees, or hidden percentages. You stay in control of your capital.
                  </p>
               </div>

               <div className="grid gap-10">
                  <FeatureDetail icon={Globe} title="50+ Jurisdictions" text="Standardized fee across all supported regions and currencies." />
                  <FeatureDetail icon={Zap} title="Instant Rebates" text="Volume discounts are calculated and applied in real-time." />
                  <FeatureDetail icon={Lock} title="Non-Custodial" text="We never touch your revenue. Fees are settled atomic-block." />
               </div>
            </div>

            {/* Dashboard Stats Visual */}
            <div className="relative">
               <div className="absolute -inset-4 bg-stripe-purple/5 blur-[80px] rounded-full" />
               <div className="relative border border-slate-200 bg-white rounded-[40px] p-12 space-y-10 shadow-2xl">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-40">Monthly Savings</p>
                     <div className="p-2 rounded-lg bg-success-green/10 text-success-green">
                        <TrendingUp className="w-5 h-5" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-6xl font-light font-mono text-deep-navy tracking-tighter">42,500 <span className="text-stripe-purple italic text-3xl">WIRE</span></p>
                     <p className="text-xs font-medium text-slate opacity-60">Estimated savings vs. custodial processors</p>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate uppercase">Effective Fee</p>
                        <p className="text-2xl font-light text-deep-navy">0.32%</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate uppercase">Settled This Month</p>
                        <p className="text-2xl font-light text-deep-navy">12.4M</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 bg-white text-center z-10">
         <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-deep-navy leading-none">Ready to <span className="text-stripe-purple italic">scale</span> globally?</h2>
            <div className="flex justify-center gap-6">
               <Link href="/signup">
                  <Button size="lg" className="h-14 px-10 bg-stripe-purple text-white rounded-full font-medium shadow-lg shadow-stripe-purple/20 transition-all hover:-translate-y-0.5">Contact Sales</Button>
               </Link>
               <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-14 px-10 border-slate/10 text-deep-navy rounded-full font-medium bg-white shadow-none">Review Documentation</Button>
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}

function TierCard({ tier, fee, desc, features, highlight }: any) {
  return (
    <div className={`p-10 rounded-[40px] border flex flex-col justify-between text-left space-y-10 transition-all ${highlight ? 'bg-white border-stripe-purple shadow-2xl scale-105 z-20' : 'bg-slate-50 border-slate/10 shadow-sm opacity-80'}`}>
       <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-bold text-deep-navy uppercase tracking-tight">{tier}</h3>
             {highlight && <Badge className="bg-stripe-purple text-white uppercase text-[8px] tracking-[0.2em] px-2">Most Popular</Badge>}
          </div>
          <p className="text-base text-slate font-medium leading-relaxed opacity-60">{desc}</p>
          <div className="pt-4">
             <p className="text-5xl font-light text-deep-navy tracking-tight">{fee}</p>
             <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest mt-1">Settlement Fee</p>
          </div>
       </div>

       <div className="space-y-12">
          <ul className="space-y-4">
             {features.map((f: string) => (
               <li key={f} className="flex items-center gap-3 text-sm font-medium text-deep-navy">
                  <CheckCircle2 className="w-4 h-4 text-stripe-purple" />
                  {f}
               </li>
             ))}
          </ul>
          <Button className={`w-full h-14 rounded-2xl font-bold uppercase text-[11px] tracking-widest ${highlight ? 'bg-stripe-purple text-white' : 'bg-white border border-slate-200 text-deep-navy hover:bg-slate-50'}`}>
             Choose {tier}
          </Button>
       </div>
    </div>
  );
}

function FeatureDetail({ icon: Icon, title, text }: any) {
   return (
      <div className="flex gap-6">
         <div className="w-12 h-12 shrink-0 rounded-2xl border border-slate-100 flex items-center justify-center bg-white text-stripe-purple shadow-sm">
            <Icon className="w-5 h-5" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-deep-navy uppercase tracking-tight">{title}</h4>
            <p className="text-sm text-slate font-medium leading-relaxed opacity-60">{text}</p>
         </div>
      </div>
   );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stripe-purple/10 selection:text-stripe-purple overflow-x-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#533afd 1px, transparent 1px)', backgroundSize: '64px 64px' }} 
      />

      <section className="relative pt-48 pb-32 px-8 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
            >
              <Badge variant="outline" className="text-stripe-purple border-stripe-purple/10 bg-stripe-purple/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                Checkout Infrastructure
              </Badge>
              <h1 className="text-[56px] md:text-[84px] leading-[0.9] font-light tracking-tighter text-deep-navy">
                Invoices built for <span className="text-stripe-purple italic">mobile</span> first.
              </h1>
              <p className="text-xl text-slate/70 font-light leading-relaxed max-w-xl">
                Tamper-proof, QR-optimized checkout experiences powered by the EIP-681 standard. Ensure every payment is accurate, intent-driven, and instant.
              </p>
            </motion.div>

            <div className="grid gap-10">
               <FeatureRow 
                 icon={QrCode} 
                 title="EIP-681 Verified" 
                 text="Standardized payment requests that prevent users from modifying amount or destination."
               />
               <FeatureRow 
                 icon={ShieldCheck} 
                 title="Non-Custodial Flow" 
                 text="Merchant capital is settled directly on-chain. No third-party holdings."
               />
               <FeatureRow 
                 icon={Smartphone} 
                 title="Mobile Native" 
                 text="Optimized for MetaMask, Rainbow, and Trust Wallet with deep-link support."
               />
            </div>
          </div>

          {/* Invoice Mockup Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
             <div className="relative aspect-4/5 w-full max-w-[480px] mx-auto rounded-[40px] border border-slate/10 bg-white shadow-2xl p-12 space-y-12 flex flex-col justify-between">
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-stripe-purple">
                         <Zap className="w-6 h-6" />
                      </div>
                      <Badge className="bg-success-green/10 text-success-green border-0 uppercase text-[10px] tracking-widest px-3">Awaiting Payment</Badge>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[11px] font-bold text-slate/40 uppercase tracking-[0.2em]">Platform Invoice</p>
                     <h2 className="text-5xl font-light font-mono text-deep-navy tracking-tighter">2,750 <span className="text-stripe-purple italic text-3xl">WIRE</span></h2>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-6 py-8 border-y border-slate/5">
                   <div className="w-48 h-48 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative">
                      <QrCode className="w-24 h-24 text-deep-navy" strokeWidth={1} />
                   </div>
                   <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest">Scan with any mobile wallet</p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-base">
                      <span className="text-slate font-medium">Network</span>
                      <span className="text-deep-navy font-bold">Wirefluid Mainnet</span>
                   </div>
                   <div className="flex items-center justify-between text-base">
                      <span className="text-slate font-medium">Protocol Fee</span>
                      <span className="text-deep-navy font-bold">0.5% (13.75 WIRE)</span>
                   </div>
                </div>
             </div>

             {/* Floating Support Tag */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-8 top-1/2 p-4 rounded-2xl bg-success-green text-white shadow-xl flex items-center gap-3 z-20"
             >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Verified Merchant</span>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 bg-slate-50 border-t border-slate/10 text-center z-10">
         <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-deep-navy leading-none">Ready to automate your <span className="text-stripe-purple italic">cashflow</span>?</h2>
            <div className="flex justify-center gap-6">
               <Link href="/signup">
                  <Button size="lg" className="h-14 px-10 bg-stripe-purple text-white rounded-full font-medium">Sign up for Free</Button>
               </Link>
               <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-14 px-10 border-slate/10 text-deep-navy rounded-full font-medium bg-white shadow-none">Documentation</Button>
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, text }: any) {
   return (
      <div className="flex gap-6">
         <div className="w-12 h-12 shrink-0 rounded-2xl border border-slate/10 flex items-center justify-center bg-white text-stripe-purple shadow-sm">
            <Icon className="w-5 h-5" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-deep-navy uppercase tracking-tight">{title}</h4>
            <p className="text-sm text-slate font-medium leading-relaxed opacity-60">{text}</p>
         </div>
      </div>
   );
}

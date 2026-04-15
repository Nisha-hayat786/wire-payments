'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { 
  ArrowRight, 
  Globe, 
  TrendingUp,
  ChevronRight,
  UserCheck2,
  LockKeyhole,
  ArrowRightLeft,
  CircleDot,
  Server,
  Zap,
  Shield,
  Activity,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const targetRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div 
      ref={targetRef} 
      className="min-h-screen bg-white font-sans selection:bg-stripe-purple/10 selection:text-stripe-purple overflow-x-hidden relative"
    >
      
      {/* Structural Background (Minimal) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#533afd 1px, transparent 1px)', backgroundSize: '64px 64px' }} 
      />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {mounted && <ProtocolFlow />}
      </div>

      {/* Global Background Grid (Fixed) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8 flex flex-col items-center text-center z-10">
        <div className="max-w-5xl space-y-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="text-stripe-purple border-stripe-purple/10 bg-stripe-purple/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                Enterprise Infrastructure
              </Badge>
              <div className="h-px w-8 bg-slate/10" />
              <span className="text-[10px] font-bold text-slate/40 uppercase tracking-[0.2em]">Institutional Grade</span>
            </div>
            
            <h1 className="text-[64px] md:text-[112px] leading-[0.85] font-light tracking-tighter text-deep-navy">
              Simple. Private. <br />
              <span className="text-stripe-purple italic">Permissionless</span> payments.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate/70 font-light leading-relaxed max-w-2xl mx-auto">
              The non-custodial operating system for global commerce. Scale with zero friction, instant settlement, and hardware-grade security.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-12 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-full text-lg font-medium group border-0 shadow-lg shadow-stripe-purple/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                  Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="h-16 px-12 text-deep-navy border-slate/10 bg-white rounded-full text-lg font-medium hover:bg-slate/5 transition-colors">
                  Documentation <ChevronRight className="w-5 h-5 ml-1 opacity-50" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Enterprise Card Visual - Clean & Focused */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-32 relative z-10 w-full max-w-5xl px-8"
        >
           <div className="relative aspect-video w-full rounded-[40px] border border-slate/10 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-br from-white to-slate-50/50" />
              
              {/* Mockup Invoice Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute left-1/2 top-1/2 -translate-x-full -translate-y-1/2 w-80 p-8 rounded-3xl bg-white border border-slate/10 shadow-2xl z-20"
              >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 rounded-xl bg-stripe-purple/10 flex items-center justify-center text-stripe-purple">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <Badge className="bg-success-green/10 text-success-green border-0 uppercase text-[9px]">Settle</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Amount Due</p>
                      <p className="text-3xl font-light font-mono text-deep-navy">1,450.00 <span className="text-stripe-purple italic text-xl">WIRE</span></p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate/50">Recipient</span>
                       <span className="text-[10px] font-mono font-bold text-deep-navy">0x71C...4f9</span>
                    </div>
                  </div>
              </motion.div>

              {/* Success Confirmation Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute left-1/2 top-1/2 translate-x-12 -translate-y-1/3 w-72 p-6 rounded-2xl bg-deep-navy text-white shadow-2xl z-30"
              >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-success-green/20 flex items-center justify-center text-success-green">
                      <UserCheck2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Settlement Status</p>
                      <p className="text-sm font-medium">Payment Confirmed</p>
                      <p className="text-[10px] font-mono text-white/30">tx: 0xf2...dc1</p>
                    </div>
                  </div>
              </motion.div>

              <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#533afd 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
           </div>
        </motion.div>
      </section>

      {/* Trust & Velocity Section */}
      <section className="relative z-10 border-y border-slate/10 bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <MetricItem label="Settlement Speed" value="< 2.4s" trend="+12% efficiency" />
            <MetricItem label="Network Uptime" value="99.99%" trend="Last 365 days" />
            <MetricItem label="Protocol Volume" value="842M+" trend="On-chain WIRE" />
            <MetricItem label="Global Nodes" value="1,240+" trend="Distributed edge" />
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: GLOBAL NETWORK MAP */}
      <section className="py-48 px-8 md:px-16 bg-slate-50 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <Badge className="bg-stripe-purple/10 text-stripe-purple border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">Global Reach</Badge>
              <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-deep-navy leading-[1.1]">Global infrastructure, <br/><span className="text-stripe-purple italic">local</span> settlement.</h2>
              <p className="text-xl text-slate font-light leading-relaxed max-w-lg">
                Deploy liquidity across 50+ jurisdictions with sub-3 second finality. Our distributed node network ensures high availability and regulatory compliance at every edge.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
              <FeatureItem title="Dynamic Routing" text="Optimized paths for lowest latency settlement via L2 bridge nodes." />
              <FeatureItem title="Regional Compliance" text="Automatic geo-fencing and AML filtering based on destination jurisdiction." />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-stripe-purple/10 blur-[100px] rounded-full opacity-50" />
            <GlobalNetworkVisual />
          </div>
        </div>
      </section>

      {/* Infrastructure Bento Grid */}
      <section className="py-48 px-8 md:px-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-left space-y-4">
            <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-deep-navy">The <span className="text-stripe-purple italic">foundation</span> for scale.</h2>
            <p className="text-xl text-slate/70 font-light leading-relaxed max-w-2xl">
              Clean API primitives and secure-by-default architecture, engineered for extreme reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[340px]">
            <BentoCard 
              className="md:col-span-2"
              title="Settlement Engine" 
              desc="Real-time P2P settlement directly between counter-parties. Non-custodial, 100% finality."
              icon={Zap}
            />
            <BentoCard 
              title="Universal Connect" 
              desc="Support for 50+ chains through a single unified gateway."
              icon={Globe}
            />
            <BentoCard 
              title="Compliance API" 
              desc="Programmable AML/KYC filters that run pre-settlement."
              icon={Shield}
            />
            <BentoCard 
              className="md:col-span-2"
              title="HMAC Webhooks" 
              desc="Verify event integrity with hardware-grade standard signatures."
              icon={Activity}
              visual={mounted ? <BentoVisualHash /> : null}
            />
          </div>
        </div>
      </section>

      {/* NEW SECTION 2: DEVELOPER SDK */}
      <section className="py-48 px-8 md:px-16 bg-deep-navy relative z-10 overflow-hidden">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
               <Badge className="bg-white/10 text-white border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">Developer SDK</Badge>
               <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-white leading-none">Integrated in <span className="text-stripe-purple italic underline decoration-white/20 underline-offset-[12px]">minutes</span>.</h2>
               <p className="text-xl text-white/60 font-light leading-relaxed max-w-lg">
                  Our SDK provides institutional-grade primitives for invoice creation, metadata tracking, and real-time webhook management.
               </p>
               <div className="flex items-center gap-6">
                  <Button className="h-12 px-8 bg-stripe-purple text-white rounded-full font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-stripe-purple/20 transition-all hover:-translate-y-0.5">View Documentation</Button>
                  <Button variant="ghost" className="text-white hover:text-stripe-purple hover:bg-transparent text-[10px] font-bold uppercase tracking-widest px-0">API Reference</Button>
               </div>
            </div>

            <div className="relative">
               <div className="absolute -inset-20 bg-stripe-purple/20 blur-[120px] rounded-full opacity-30" />
               <CodeMockup />
            </div>
         </div>
      </section>

      {/* NEW SECTION 3: ASSET SECURITY PILLAR */}
      <section className="py-48 px-8 md:px-16 bg-white relative z-10">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <Badge variant="outline" className="text-success-green border-success-green/20 bg-success-green/5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Security Standard</Badge>
               <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-deep-navy leading-[1.1]">Uncompromising <span className="text-stripe-purple italic">protection</span>.</h2>
               <p className="text-xl text-slate font-light leading-relaxed max-w-2xl mx-auto">
                  We eliminate counterparty risk by moving capital strictly on-chain. Funds are never held, mixed, or managed by WirePayments.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
               <SecurityComparisonBlock 
                  type="legacy" 
                  title="Legacy Custodial" 
                  items={["Funds held in centralized vaults", "3-5 day settlement latency", "Counterparty insolvency risk", "Opaque fee structures"]}
               />
               <SecurityComparisonBlock 
                  type="wire"
                  title="WirePayments"
                  items={["Atomic P2P settlement", "Instant sub-3s finality", "100% Non-custodial assets", "Transparent 0.5% protocol fee"]}
               />
            </div>
         </div>
      </section>

      {/* Institutional FAQ */}
      <section className="py-48 px-8 md:px-16 bg-slate-50 relative z-10 border-t border-slate/10">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-deep-navy leading-none">Technical Due Diligence.</h2>
            <p className="text-slate/40 font-bold tracking-widest text-[11px] uppercase">Compliance & Infrastructure</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <FAQItem 
              value="security" 
              question="How is merchant capital secured?" 
              answer="WirePayments is strictly non-custodial. Funds move directly from the customer's wallet to the merchant's vault. We never hold, manage, or have access to merchant private keys."
            />
            <FAQItem 
              value="fees" 
              question="What is the fee structure?" 
              answer="We offer a flat 0.5% settlement fee. Enterprise clients processing over $10M monthly qualify for custom volume-based rebates."
            />
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-48 px-8 bg-white border-t border-slate/10 text-center z-10">
         <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-8xl font-light tracking-tighter text-deep-navy leading-none">Ready to <span className="text-stripe-purple italic">build</span>?</h2>
            <div className="flex justify-center gap-6">
               <Link href="/signup">
                  <Button size="lg" className="h-16 px-12 bg-stripe-purple text-white rounded-full font-medium">Get Started</Button>
               </Link>
               <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-16 px-12 border-slate/10 text-deep-navy rounded-full font-medium shadow-none">Documentation</Button>
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}

function MetricItem({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="space-y-2 text-center md:text-left">
      <p className="text-[10px] font-bold text-slate uppercase tracking-[0.2em] opacity-40">{label}</p>
      <p className="text-4xl font-light text-deep-navy tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-success-green uppercase tracking-wider">{trend}</p>
    </div>
  );
}

function BentoCard({ title, desc, icon: Icon, visual, className }: any) {
  return (
    <div className={`group relative p-10 rounded-[40px] border border-slate/10 bg-white overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl hover:border-slate-200 ${className}`}>
      <div className="relative z-10 space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-stripe-purple">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-deep-navy uppercase tracking-tight">{title}</h3>
          <p className="text-base text-slate font-medium leading-relaxed max-w-[320px] opacity-60">{desc}</p>
        </div>
      </div>
      {visual && (
        <div className="absolute inset-0 z-0 opacity-40 flex items-end justify-end translate-y-8 group-hover:translate-y-4 transition-transform duration-700">
          {visual}
        </div>
      )}
    </div>
  );
}

function BentoVisualHash() {
  const [hashes, setHashes] = useState<string[]>([]);
  useEffect(() => {
    setHashes([...Array(20)].map(() => (Math.random().toString(36).substring(2, 40))));
  }, []);

  return (
    <div className="relative w-full h-full p-10 font-mono text-[9px] text-stripe-purple/10 overflow-hidden select-none">
      {hashes.map((h, i) => (
        <div key={i} className="whitespace-nowrap truncate opacity-30">
          {h}
        </div>
      ))}
    </div>
  );
}

function ProtocolFlow() {
  const [particles, setParticles] = useState<{delay: number, y1: string, y2: string}[]>([]);
  useEffect(() => {
    setParticles([...Array(20)].map((_, i) => ({
      delay: i * 2,
      y1: `${Math.random() * 100}vh`,
      y2: `${Math.random() * 100}vh`
    })));
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <svg className="absolute w-full h-full opacity-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#533afd" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill="transparent" />
        {[...Array(8)].map((_, i) => (
          <motion.path 
            key={i}
            d={`M -200 ${150 * i} L 1200 ${150 * i}`}
            stroke="url(#lineGrad)"
            strokeWidth="0.5"
            fill="transparent"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
      {particles.map((p, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.2, 0],
            scale: [0, 1, 0],
            x: ["-10vw", "110vw"],
            y: [p.y1, p.y2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-stripe-purple rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
}

function FAQItem({ value, question, answer }: { value: string; question: string; answer: string }) {
  return (
    <AccordionItem value={value} className="border-slate/10 py-6">
      <AccordionTrigger className="text-xl font-light text-deep-navy hover:text-stripe-purple hover:no-underline transition-colors text-left">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-slate text-base font-light leading-relaxed pt-4">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

function FeatureItem({ title, text }: { title: string; text: string }) {
   return (
      <div className="space-y-2">
         <h4 className="text-sm font-bold text-deep-navy uppercase tracking-tight">{title}</h4>
         <p className="text-sm text-slate font-medium opacity-60 leading-relaxed">{text}</p>
      </div>
   );
}

function GlobalNetworkVisual() {
   return (
      <div className="relative w-full aspect-square max-w-[500px] mx-auto">
         <svg className="w-full h-full opacity-[0.08] text-stripe-purple" viewBox="0 0 100 100">
            <path d="M10,50 Q25,25 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M10,40 Q30,10 60,40 T90,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M10,60 Q30,90 60,60 T90,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
         </svg>
         
         {[ 
            { top: "20%", left: "30%", delay: 0 },
            { top: "45%", left: "65%", delay: 1 },
            { top: "70%", left: "40%", delay: 2 },
            { top: "35%", left: "85%", delay: 3 },
            { top: "60%", left: "15%", delay: 4 },
         ].map((p, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: [0, 1, 0.5], scale: [0, 1, 0.8] }}
               transition={{ duration: 3, repeat: Infinity, delay: p.delay }}
               className="absolute w-3 h-3 rounded-full bg-stripe-purple flex items-center justify-center"
               style={{ top: p.top, left: p.left }}
            >
               <div className="w-full h-full rounded-full bg-stripe-purple animate-ping opacity-30" />
            </motion.div>
         ))}
      </div>
   );
}

function CodeMockup() {
   return (
      <div className="w-full max-w-[580px] mx-auto rounded-3xl bg-black border border-white/5 shadow-2xl overflow-hidden font-mono text-[13px] leading-relaxed">
         <div className="h-10 bg-white/5 flex items-center px-6 gap-2 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <span className="ml-4 text-[10px] text-white/30 tracking-widest uppercase">main.ts</span>
         </div>
         <div className="p-10 space-y-1">
            <p><span className="text-purple-400">import</span> {'{'} <span className="text-yellow-200">WirePayments</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-300">'wirepayments-js'</span>;</p>
            <p className="opacity-40">&nbsp;</p>
            <p><span className="text-purple-400">const</span> wp = <span className="text-purple-400">new</span> <span className="text-yellow-200">WirePayments</span>(process.env.<span className="text-white">API_KEY</span>);</p>
            <p className="opacity-40">&nbsp;</p>
            <p><span className="text-purple-400">const</span> invoice = <span className="text-purple-400">await</span> wp.invoices.<span className="text-yellow-200 font-bold">create</span>({'{'}</p>
            <p>&nbsp;&nbsp;<span className="text-white/70">amount</span>: <span className="text-orange-300">1450.00</span>,</p>
            <p>&nbsp;&nbsp;<span className="text-white/70">currency</span>: <span className="text-green-300">'WIRE'</span>,</p>
            <p>&nbsp;&nbsp;<span className="text-white/70">metadata</span>: {'{'} user_id: <span className="text-green-300">'usr_123'</span> {'}'}</p>
            <p>{'}'});</p>
            <p className="opacity-40">&nbsp;</p>
            <p><span className="text-white/40">// Instant settlement on-chain</span></p>
            <p><span className="text-purple-400">console</span>.<span className="text-yellow-200">log</span>(invoice.<span className="text-white">checkout_url</span>);</p>
         </div>
      </div>
   );
}

function SecurityComparisonBlock({ type, title, items }: { type: 'legacy' | 'wire'; title: string; items: string[] }) {
   const isWire = type === 'wire';
   return (
      <div className={`p-12 rounded-[40px] border transition-all ${isWire ? 'bg-stripe-purple/5 border-stripe-purple/20 shadow-2xl shadow-stripe-purple/5' : 'bg-slate-50 border-slate-100'}`}>
         <div className="space-y-8">
            <div className="space-y-2">
               <p className={`text-[10px] font-bold uppercase tracking-widest ${isWire ? 'text-stripe-purple' : 'text-slate/40'}`}>{isWire ? 'Protocol Standard' : 'Internal Framework'}</p>
               <h3 className="text-2xl font-bold text-deep-navy uppercase tracking-tight">{title}</h3>
            </div>
            <ul className="space-y-4">
               {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-medium text-deep-navy">
                     <div className={`w-1.5 h-1.5 rounded-full ${isWire ? 'bg-stripe-purple shadow-[0_0_8px_rgba(83,58,253,0.4)]' : 'bg-slate-300'}`} />
                     {item}
                  </li>
               ))}
            </ul>
         </div>
      </div>
   );
}

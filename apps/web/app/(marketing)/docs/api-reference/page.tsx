import React from 'react';
import { CopyClient } from './copy-client';
import { DocsContent } from './docs-content';
import { config } from '@/lib/config';

export default function ApiReferencePage() {
  const baseUrl = config?.NEXT_PUBLIC_APP_URL || 'https://wirepayments.com';
  const apiUrl = `${baseUrl}/api/v1`;

  return (
    <div className="space-y-16 pb-32">
      {/* Header */}
      <div className="space-y-8">
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase bg-stripe-purple/5 text-stripe-purple border border-stripe-purple/20">
             Developer Resources
           </div>
           <div className="flex items-center justify-between">
             <div className="space-y-4">
               <h1 className="text-6xl font-light tracking-tighter text-deep-navy">API Reference</h1>
               <p className="text-lg text-slate opacity-70 max-w-xl">
                 Complete API documentation for integrating WirePayments into your application.
               </p>
             </div>
             <CopyClient />
           </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-4 gap-4">
        <QuickLink href="#authentication" title="Authentication" />
        <QuickLink href="#invoices" title="Invoices" />
        <QuickLink href="#webhooks" title="Webhooks" />
        <QuickLink href="#errors" title="Errors" />
      </div>

      {/* Base URL */}
      <section id="authentication" className="space-y-6">
        <h2 className="text-2xl font-light text-deep-navy">Configuration</h2>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <code className="text-sm font-mono text-deep-navy">Base URL: {apiUrl}</code>
        </div>
        <AuthSection />
      </section>

      <DocsContent />
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-stripe-purple hover:bg-stripe-purple/5 transition-all group">
      <span className="w-4 h-4 rounded-full bg-stripe-purple/20 flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-stripe-purple" />
      </span>
      <span className="text-sm font-medium text-deep-navy group-hover:text-stripe-purple">{title}</span>
    </a>
  );
}

function AuthSection() {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <h3 className="text-sm font-bold text-deep-navy mb-4">Authentication</h3>
      <code className="text-xs font-mono bg-white px-3 py-2 rounded-lg block text-slate">
        Authorization: Bearer wp_live_your_api_key_here
      </code>
    </div>
  );
}

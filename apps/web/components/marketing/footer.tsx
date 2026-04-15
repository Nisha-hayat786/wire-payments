'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="py-32 px-8 border-t border-slate/10 bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="WirePayments" className="h-8 w-auto" />
            <span className="font-bold text-lg uppercase tracking-widest text-deep-navy">WirePayments</span>
          </div>
          <p className="text-sm text-slate font-medium leading-relaxed max-w-xs italic opacity-60">
            Global crypto payment infrastructure designed for permissionless scalability. Institutional security meets blockchain transparency.
          </p>
        </div>
        
        <FooterGroup 
          title="Product" 
          links={[
            { name: 'Invoices', href: '/invoices' },
            { name: 'Billing', href: '/billing' },
            { name: 'Docs', href: '/docs' },
            { name: 'Dashboard', href: '/dashboard' }
          ]} 
        />
        
        <FooterGroup 
          title="Developers" 
          links={[
            { name: 'API Reference', href: '/docs/api' },
            { name: 'Contract Deployment', href: '/docs/contracts' },
            { name: 'Webhooks', href: '/docs/webhooks' },
            { name: 'Security', href: '/docs/security' }
          ]} 
        />
        
        <FooterGroup 
          title="Privacy" 
          links={[
            { name: 'Philosophy', href: '/docs/architecture' },
            { name: 'Policy', href: '#' },
            { name: 'Terms', href: '#' },
            { name: 'Integrity', href: '#' }
          ]} 
        />
      </div>
      
      <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-soft-blue flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-xs text-slate/60 font-medium tracking-tight whitespace-nowrap">&copy; 2026 WirePayments Protocol. Institutional Settlement Gateway.</p>
         <div className="flex gap-8">
            <Link href="/docs" className="text-[10px] font-bold text-slate uppercase tracking-widest hover:text-deep-navy transition-colors">Documentation</Link>
            <Link href="#" className="text-[10px] font-bold text-slate uppercase tracking-widest hover:text-deep-navy transition-colors">Infrastructure</Link>
         </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-bold text-slate uppercase tracking-widest">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              href={link.href} 
              className="text-sm font-medium text-slate hover:text-deep-navy transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

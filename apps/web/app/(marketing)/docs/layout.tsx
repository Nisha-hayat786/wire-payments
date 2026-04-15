'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Book,
  Code2,
  Webhook,
  ChevronRight,
} from 'lucide-react';

const docsNavigation = [
  {
    title: 'Documentation',
    items: [
      { name: 'Overview', href: '/docs', icon: Book },
      { name: 'API Reference', href: '/docs/api-reference', icon: Code2 },
    ],
  },
  {
    title: 'Guides',
    items: [
      { name: 'Webhooks', href: '/docs/webhooks', icon: Webhook },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-32 flex gap-12">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:block space-y-10">
          <div className="px-4 py-6 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-2">
            <p className="text-[10px] font-bold text-slate/40 uppercase tracking-widest leading-none">SDK Version</p>
            <p className="text-sm font-bold text-deep-navy">v1.2.4 (Latest)</p>
          </div>
          
          {docsNavigation.map((section) => (
            <div key={section.title} className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-40 px-4">
                {section.title}
              </h5>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all group",
                      pathname === item.href 
                        ? "bg-stripe-purple/10 text-stripe-purple" 
                        : "text-slate hover:bg-slate-50 hover:text-deep-navy"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      pathname === item.href ? "text-stripe-purple" : "text-slate/40 group-hover:text-deep-navy"
                    )} />
                    {item.name}
                    {pathname === item.href && (
                      <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl overflow-hidden pt-1">
          {children}
        </main>
      </div>
    </div>
  );
}

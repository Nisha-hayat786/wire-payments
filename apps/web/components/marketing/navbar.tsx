'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MarketingNavbar() {
  const { scrollY } = useScroll();
  const navbarBg = useTransform(scrollY, [0, 50], ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)']);
  const navbarBorder = useTransform(scrollY, [0, 50], ['rgba(229, 237, 245, 0)', 'rgba(229, 237, 245, 1)']);
  const navbarBlur = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(12px)']);

  return (
    <motion.nav 
      style={{ 
        backgroundColor: navbarBg,
        borderBottomColor: navbarBorder,
        backdropFilter: navbarBlur
      }}
      className="fixed top-0 w-full h-20 flex items-center justify-between px-8 md:px-16 z-50 border-b border-transparent transition-colors"
    >
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="WirePayments" className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-tight text-deep-navy uppercase">WirePayments</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: 'Invoices', href: '/invoices' },
            { name: 'Billing', href: '/billing' },
            { name: 'Docs', href: '/docs' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-[11px] font-bold text-slate hover:text-deep-navy transition-colors uppercase tracking-[0.2em]"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/signup">
          <Button className="bg-stripe-purple hover:bg-[#4434d4] text-white rounded-full px-8 text-[11px] font-bold uppercase tracking-widest transition-transform active:scale-95 group border-0 shadow-none">
            Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}

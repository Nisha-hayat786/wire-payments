'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Zap, Globe, ArrowUpRight, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'accent';
  external?: boolean;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

const defaultActions: QuickAction[] = [
  {
    title: 'New Payment Link',
    description: 'Create a new invoice payment link',
    icon: <Plus className="w-5 h-5" />,
    href: '/dashboard/invoices/new',
    variant: 'primary',
  },
  {
    title: 'View Invoices',
    description: 'Manage and track all invoices',
    icon: <Receipt className="w-5 h-5" />,
    href: '/dashboard/invoices',
    variant: 'secondary',
  },
  {
    title: 'Manage Webhooks',
    description: 'Configure webhook endpoints',
    icon: <Globe className="w-5 h-5" />,
    href: '/dashboard/developers/webhooks',
    variant: 'secondary',
  },
  {
    title: 'API Documentation',
    description: 'Explore API reference and guides',
    icon: <ExternalLink className="w-5 h-5" />,
    href: '/docs',
    variant: 'accent',
    external: true,
  },
];

export function QuickActions({ actions = defaultActions, className }: QuickActionsProps) {
  return (
    <div className={cn('grid sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {actions.map((action, index) => {
        const content = (
          <Card className={cn(
            'border-soft-blue shadow-xs bg-white overflow-hidden group hover:border-stripe-purple/20 transition-all cursor-pointer h-full',
            action.variant === 'primary' && 'border-stripe-purple/30 shadow-lg shadow-stripe-purple/5'
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  action.variant === 'primary' ? 'bg-stripe-purple/10 text-stripe-purple' :
                  action.variant === 'accent' ? 'bg-orange-50/50 text-orange-500' :
                  'bg-blue-50/50 text-blue-500'
                )}>
                  {action.icon}
                </div>
                {action.variant === 'primary' && (
                  <div className="w-2 h-2 rounded-full bg-success-green animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                )}
              </div>
              <h3 className={cn(
                'font-bold mb-1',
                action.variant === 'primary' ? 'text-stripe-purple' : 'text-deep-navy'
              )}>
                {action.title}
              </h3>
              <p className="text-xs text-slate font-medium opacity-60 leading-relaxed">
                {action.description}
              </p>
              <div className={cn(
                'mt-4 flex items-center gap-1 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all',
                action.variant === 'primary' ? 'text-stripe-purple' : 'text-slate'
              )}>
                {action.external ? 'Open Docs' : 'Continue'}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        );

        if (action.external) {
          return (
            <a key={index} href={action.href} target="_blank" rel="noopener noreferrer" className="block">
              {content}
            </a>
          );
        }

        return (
          <Link key={index} href={action.href} className="block">
            {content}
          </Link>
        );
      })}
    </div>
  );
}

interface NetworkStatusProps {
  latency?: string;
  status?: 'synced' | 'syncing' | 'error';
  nodeStatus?: string;
}

export function NetworkStatus({ latency = '14ms', status = 'synced', nodeStatus = 'ENFORCED' }: NetworkStatusProps) {
  return (
    <div className="bg-white border border-soft-blue rounded-3xl p-8 space-y-6 shadow-xs">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center text-stripe-purple border border-soft-blue shadow-inner shrink-0">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <p className="text-[10px] font-black text-deep-navy uppercase tracking-[0.2em] leading-none mb-2">Network Sync</p>
          <p className={cn(
            'text-[11px] font-black flex items-center gap-2 uppercase tracking-widest',
            status === 'synced' ? 'text-success-green' :
            status === 'syncing' ? 'text-yellow-600' :
            'text-red-500'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              status === 'synced' ? 'bg-success-green' :
              status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            )} />
            Latency: {latency}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-slate leading-relaxed font-bold opacity-60 uppercase tracking-widest">
        Alpha Node is fully synced with the Wirefluid Distributed Ledger. Cross-node verification is currently <span className="text-stripe-purple">{nodeStatus}</span>.
      </p>
      <Button variant="outline" className="w-full border-soft-blue text-[10px] font-black uppercase tracking-[0.2em] h-12 group bg-[#fcfdfe] rounded-2xl">
        Node Status <ExternalLink className="w-4 h-4 ml-2 opacity-30 group-hover:opacity-100 transition-opacity" />
      </Button>
    </div>
  );
}

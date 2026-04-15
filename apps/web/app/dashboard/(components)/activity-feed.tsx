'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Activity, Coins, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  type: string;
  amount?: number;
  currency?: string;
  time: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  badge?: string | number;
  error?: string;
  href?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  showFooter?: boolean;
  footerHref?: string;
  footerText?: string;
  className?: string;
  maxHeight?: string;
}

export function ActivityFeed({
  events,
  title = 'Real-Time Event Stream',
  emptyTitle = 'Idle Stream',
  emptyDescription = 'The protocol indexer is ready. Real-time events will populate as soon as your institutional node detects activity.',
  emptyIcon,
  showFooter = true,
  footerHref = '/dashboard/developers/logs',
  footerText = 'Expand Institutional Audit',
  className,
  maxHeight = '480px',
}: ActivityFeedProps) {
  return (
    <Card className={cn('border-soft-blue shadow-xs bg-white overflow-hidden rounded-2xl', className)}>
      <CardHeader className="border-b border-soft-blue bg-deep-navy text-white flex flex-row items-center justify-between py-5 px-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-success-green animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] italic">{title}</CardTitle>
        </div>
        <Badge variant="outline" className="text-[9px] border-white/20 text-white/50 font-black uppercase tracking-widest px-3 h-6">
          NODE-ID: ALPHA
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn('divide-y divide-soft-blue overflow-y-auto custom-scrollbar min-h-[340px] flex flex-col')} style={{ maxHeight }}>
          {events.length > 0 ? (
            events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-10 py-6 hover:bg-muted/5 transition-colors group flex items-start gap-8 relative"
              >
                <div className="mt-1.5 shrink-0">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    event.status === 'SUCCESS' ? 'bg-success-green shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                    event.status === 'FAILED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.4)]' :
                    'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                  )} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-deep-navy uppercase tracking-[0.1em]">
                      {event.type.replace(/\./g, ' // ')}
                    </p>
                    <span className="text-[10px] text-slate font-black uppercase opacity-30 tracking-widest tabular-nums">
                      {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-[10px] font-bold text-slate uppercase tracking-widest">
                    {event.amount && (
                      <span className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-stripe-purple" />
                        {event.amount} {event.currency}
                      </span>
                    )}
                    <span className="flex items-center gap-2 opacity-50">
                      <Hash className="w-3.5 h-3.5" />
                      {event.id.slice(0, 10).toUpperCase()}
                    </span>
                    <Badge className={cn(
                      'text-[9px] font-black',
                      event.status === 'SUCCESS' ? 'bg-green-50 text-success-green border-green-100' :
                      event.status === 'FAILED' ? 'bg-red-50 text-red-500 border-red-100' :
                      'bg-yellow-50 text-yellow-600 border-yellow-100'
                    )} variant="outline">
                      {event.badge ?? event.status}
                    </Badge>
                    {event.error && (
                      <span className="text-[9px] font-medium text-red-400 normal-case italic ml-2">
                        Error: {event.error}
                      </span>
                    )}
                  </div>
                </div>
                {event.href ? (
                  <Link href={event.href}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-white hover:shadow-sm mt-0.5">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-white hover:shadow-sm mt-0.5">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center text-slate/20">
                {emptyIcon || <Activity className="w-10 h-10" />}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-deep-navy uppercase tracking-[0.2em]">{emptyTitle}</p>
                <p className="text-[10px] text-slate font-medium opacity-50 leading-relaxed max-w-xs mx-auto italic uppercase tracking-widest">
                  {emptyDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter className="bg-muted/10 border-t border-soft-blue py-5 px-10 flex justify-center">
          <Link href={footerHref}>
            <Button variant="ghost" className="text-[10px] font-black text-stripe-purple uppercase tracking-[0.2em] hover:bg-stripe-purple/10 h-10 px-8 transition-all">
              {footerText}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

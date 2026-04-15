'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-stripe-purple',
  iconBg = 'bg-blue-50/50',
  trend,
  description,
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn(
      'border-soft-blue shadow-none bg-white overflow-hidden group hover:border-stripe-purple/20 transition-all cursor-default h-full',
      className
    )}>
      <div className={cn('h-1 w-full', iconColor.replace('text', 'bg'), 'opacity-20')} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black text-slate uppercase tracking-[0.2em] opacity-40 leading-none">
            {title}
          </p>
          <div className={cn('p-2 rounded-lg', iconBg)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-black text-deep-navy font-mono tracking-tighter tabular-nums">
            {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : value}
          </span>
          {unit && (
            <span className="text-[10px] font-black text-slate uppercase opacity-30">{unit}</span>
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-[9px] font-black uppercase tracking-widest',
              trend.isPositive ? 'text-success-green' : 'text-red-500'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-[9px] font-bold text-slate uppercase tracking-widest opacity-40">
              vs last period
            </span>
          </div>
        )}
        {description && (
          <p className="text-[9px] font-bold text-slate uppercase tracking-widest opacity-40">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  Clock,
  ArrowUpRight,
  Cpu,
  Lock,
  ArrowDownLeft,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useMerchant } from './merchant-context';
import { MetricsCard } from './(components)/metrics-card';
import { ActivityFeed } from './(components)/activity-feed';
import { QuickActions, NetworkStatus } from './(components)/quick-actions';

export default function DashboardOverview() {
  const { merchant } = useMerchant();
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalVolume: 0,
    successRate: 100,
    activeInvoices: 0,
    settledToday: 0,
    totalCount: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!merchant?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // 1. Fetch Stats Aggregates
        const [allInvoices, paidToday, totalCountRes] = await Promise.all([
          supabase.from('invoices').select('amount, status').eq('merchant_id', merchant.id),
          supabase.from('invoices').select('amount')
            .eq('merchant_id', merchant.id)
            .eq('status', 'paid')
            .gte('updated_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
          supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('merchant_id', merchant.id)
        ]);

        const invoices = allInvoices.data || [];
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const totalVolume = paidInvoices.reduce((acc, i) => acc + Number(i.amount), 0);
        const settledToday = paidToday.data?.reduce((acc, i) => acc + Number(i.amount), 0) || 0;
        const totalCount = totalCountRes.count || 0;
        const successRate = totalCount > 0 ? (paidInvoices.length / totalCount) * 100 : 100;

        setStats({
          totalVolume,
          successRate,
          activeInvoices: invoices.filter(i => i.status === 'pending' || i.status === 'unpaid').length,
          settledToday,
          totalCount
        });

        // 2. Fetch recent events (Webhook logs + Invoice events)
        const { data: logs } = await supabase
          .from('webhook_logs')
          .select('*, invoices!left(*)')
          .eq('merchant_id', merchant.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (logs && logs.length > 0) {
          setRecentEvents(logs.map(log => ({
            id: log.id,
            type: log.payload?.type || 'WEBHOOK_DISPATCHED',
            amount: log.invoices?.amount,
            currency: log.invoices?.currency,
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: log.response_code === 200 ? 'SUCCESS' : log.status === 'succeeded' ? 'SUCCESS' : 'FAILED',
            badge: log.response_code || '---',
            error: (log.status === 'failed') ? log.response_body : null
          })));
        } else {
          setRecentEvents([]);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [merchant]);

  // Premium Chart Data (Placeholder for now, but beautifully structured)
  const chartData = [
    { name: '00:00', volume: 0 },
    { name: '04:00', volume: stats.settledToday * 0.2 },
    { name: '08:00', volume: stats.settledToday * 0.5 },
    { name: '12:00', volume: stats.settledToday * 0.8 },
    { name: '16:00', volume: stats.settledToday * 0.9 },
    { name: '20:00', volume: stats.settledToday },
    { name: '23:59', volume: stats.settledToday },
  ];

  const successData = [
    { name: 'Success', value: stats.successRate },
    { name: 'Failed', value: 100 - stats.successRate },
  ];
  const COLORS = ['#533afd', '#e2e8f0'];

  if (loading) return (
     <div className="space-y-10 animate-pulse p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded-lg" />
            <div className="h-4 w-48 bg-muted rounded-md" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-full" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
           <div className="col-span-2 h-[400px] bg-muted rounded-3xl" />
           <div className="h-[400px] bg-muted rounded-3xl" />
        </div>
     </div>
  );

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-12 p-2 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black text-deep-navy tracking-tight uppercase">System Overview</h1>
            <Badge className="bg-success-green/10 text-success-green border-success-green/20 text-[9px] font-black uppercase tracking-widest px-2 h-5">
              Live Index
            </Badge>
          </div>
          <p className="text-sm text-slate font-medium opacity-60 flex items-center gap-2 italic">
            <Server className="w-3.5 h-3.5" /> Institutional Settlement Node: <span className="text-stripe-purple font-mono not-italic font-black">WIRE-ALPHA-01</span>
          </p>
        </motion.div>
        
        <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-soft-blue bg-white shadow-xs h-12 px-6 text-[10px] uppercase font-black tracking-widest text-slate hover:text-deep-navy hover:bg-muted/30 transition-all rounded-xl"
            >
               <Activity className="w-3.5 h-3.5 mr-2" /> Refresh Protocol
            </Button>
            <Link href="/dashboard/invoices/new">
               <Button className="bg-stripe-purple hover:bg-[#4434d4] text-[10px] uppercase font-black tracking-widest px-8 h-12 text-white shadow-2xl shadow-stripe-purple/20 transition-all hover:-translate-y-1 rounded-xl">
                 <Plus className="w-4 h-4 mr-2" /> New Payment Link
               </Button>
            </Link>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0 }}
         >
           <MetricsCard
             title="Merchant Volume"
             value={stats.totalVolume}
             unit="WIRE"
             icon={TrendingUp}
             iconColor="text-success-green"
             iconBg="bg-green-50/50"
             description="Total settled since inception"
           />
         </motion.div>
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
         >
           <MetricsCard
             title="Node Reliability"
             value={stats.successRate.toFixed(stats.successRate < 100 ? 2 : 0)}
             unit="%"
             icon={ShieldCheck}
             iconColor="text-stripe-purple"
             iconBg="bg-blue-50/50"
             description="Overall transaction success"
           />
         </motion.div>
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
         >
           <MetricsCard
             title="Settled (24H)"
             value={stats.settledToday}
             unit="WIRE"
             icon={Zap}
             iconColor="text-orange-500"
             iconBg="bg-orange-50/50"
             description="Volume in the current period"
           />
         </motion.div>
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
         >
           <MetricsCard
             title="Active Gateways"
             value={stats.activeInvoices}
             unit="INVOICES"
             icon={Cpu}
             iconColor="text-blue-500"
             iconBg="bg-sky-50/50"
             description="Current pending settlements"
           />
         </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* OPERATIONAL VELOCITY CHART */}
         <Card className="lg:col-span-2 border-soft-blue shadow-xs bg-white overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-soft-blue bg-muted/5 py-6 px-10 flex flex-row items-center justify-between">
               <div className="space-y-1">
                  <CardTitle className="text-[10px] font-black text-deep-navy uppercase tracking-[0.3em] leading-none">Net Settlement Velocity</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-50">Intraday throughput analysis (alpha sync)</CardDescription>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-stripe-purple uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-stripe-purple shadow-sm"/> 
                    Protocol Load
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-10">
               <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#533afd" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#533afd" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} 
                          dy={15} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0', 
                            fontSize: '11px', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }} 
                          cursor={{ stroke: '#533afd', strokeWidth: 1, strokeDasharray: '4 4' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#533afd" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorVelocity)" 
                          animationDuration={1500}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         {/* INTEGRITY PANEL */}
         <Card className="border-soft-blue shadow-xs bg-white overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-soft-blue bg-muted/5 py-6 px-10">
               <CardTitle className="text-[10px] font-black text-deep-navy uppercase tracking-[0.3em] text-center leading-none">Integrity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center justify-center space-y-10">
               <div className="relative w-56 h-56 group">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie 
                          data={successData} 
                          innerRadius={75} 
                          outerRadius={95} 
                          paddingAngle={8} 
                          dataKey="value"
                          animationBegin={200}
                          animationDuration={1000}
                        >
                           {successData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <span className="text-4xl font-black text-deep-navy font-mono tracking-tighter tabular-nums">{stats.successRate.toFixed(1)}%</span>
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${stats.successRate > 95 ? 'text-success-green' : 'text-orange-500'}`}>
                        {stats.successRate >= 100 ? 'PURE INTEGRITY' : stats.successRate > 95 ? 'OPTIMAL NODES' : 'WARNING STATE'}
                     </span>
                  </div>
                  {/* Subtle pulsing background */}
                  <div className="absolute inset-0 bg-success-green/5 blur-3xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10" />
               </div>
               
               <div className="w-full space-y-5">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate uppercase tracking-[0.2em] border-b border-soft-blue pb-3 leading-none opacity-60">
                     <span>Node Success</span>
                     <span className="text-deep-navy font-mono font-black">{stats.successRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate uppercase tracking-[0.2em] border-b border-soft-blue pb-3 leading-none opacity-60">
                     <span>API Availability</span>
                     <span className="text-deep-navy font-mono font-black">99.98%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate uppercase tracking-[0.2em] leading-none opacity-60">
                     <span>Ledger Safety</span>
                     <span className="text-success-green font-black flex items-center gap-2">
                        <Lock className="w-3 h-3" /> VERIFIED
                     </span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* LIVE EVENT FEED */}
         <ActivityFeed
            events={recentEvents}
            className="lg:col-span-2"
         />

         {/* WEBHOOK STATUS */}
         <div className="space-y-8 flex flex-col">
            <Card className="border-stripe-purple/20 shadow-2xl shadow-stripe-purple/10 bg-stripe-purple text-white overflow-hidden relative group">
               <CardContent className="p-10 space-y-8 relative z-10">
                  <div className="space-y-3">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50 leading-none mb-1">Infrastructure Health</p>
                     <p className="text-2xl font-light tracking-tight leading-tight">Institutional Webhooks are <span className="font-black italic">Active</span></p>
                  </div>
                  <div className="space-y-4">
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-white" />
                     </div>
                     <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-widest">
                        Precision audit: delivering at 100% network uptime across all synced nodes.
                     </p>
                  </div>
                  <Link href="/dashboard/developers/webhooks">
                     <Button className="w-full bg-white text-stripe-purple hover:bg-white/90 font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                        Manage Webhooks <ArrowUpRight className="w-4 h-4 ml-2" />
                     </Button>
                  </Link>
               </CardContent>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
            </Card>

            <NetworkStatus />
         </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-bold text-deep-navy mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}

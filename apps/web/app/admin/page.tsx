'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  Search,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    merchants: 0,
    invoices: 0,
    volume: 0,
    activeWebhooks: 0
  });
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch Merchants count
      const { count: merchantCount } = await supabase.from('merchants').select('*', { count: 'exact', head: true });
      
      // Fetch Invoices count
      const { count: invoiceCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
      
      // Fetch All Invoices for volume calculation (In production, use an RPC for this)
      const { data: invoices } = await supabase.from('invoices').select('amount').eq('status', 'paid');
      const totalVolume = invoices?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;

      setStats({
        merchants: merchantCount || 0,
        invoices: invoiceCount || 0,
        volume: totalVolume,
        activeWebhooks: merchantCount || 0 // Assuming each merchant has one
      });

      // Fetch Recent Merchants
      const { data: recentMerchants } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setMerchants(recentMerchants || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f9fc] p-8 md:p-12 space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-deep-navy flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-stripe-purple" />
            Global Control Center
          </h1>
          <p className="text-slate text-sm mt-1">Platform-wide infrastructure monitoring and management.</p>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-64 bg-white border border-soft-blue rounded-md px-4 flex items-center gap-2 text-slate shadow-sm focus-within:border-stripe-purple transition-all">
            <Search className="w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search merchants or tx..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <button className="h-10 w-10 flex items-center justify-center bg-white border border-soft-blue rounded-md text-slate hover:text-deep-navy transition-colors shadow-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Merchants', value: stats.merchants, icon: Users, color: 'text-blue-500' },
          { label: 'Global Volume', value: `${stats.volume} WIRE`, icon: BarChart3, color: 'text-stripe-purple' },
          { label: 'Active Invoices', value: stats.invoices, icon: CreditCard, color: 'text-green-500' },
          { label: 'Platform Health', value: '100%', icon: Activity, color: 'text-orange-500' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-soft-blue shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-1">{item.label}</p>
                    <div className="text-2xl font-light text-deep-navy font-mono">{item.value}</div>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Merchant Registry */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Global Merchant Registry</h3>
           <Badge variant="outline" className="border-soft-blue text-stripe-purple font-bold">LIVE UPDATES ACTIVE</Badge>
        </div>

        <Card className="border-soft-blue shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold text-slate px-8 py-4">Merchant</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate px-8 py-4">Wallet Address</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate px-8 py-4">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate px-8 py-4 text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="h-16 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : merchants.map((merchant) => (
                <TableRow key={merchant.id} className="cursor-pointer hover:bg-muted/10 transition-colors group">
                  <TableCell className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-deep-navy">{merchant.business_name || 'Unnamed Merchant'}</span>
                      <span className="text-xs text-slate opacity-60">ID: {merchant.id.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-4 font-mono text-xs text-slate">
                    {merchant.wallet_address}
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <Badge className="bg-success-green/10 text-success-green border-success-green/20 text-[10px] uppercase font-bold py-0 h-5">Active</Badge>
                  </TableCell>
                  <TableCell className="px-8 py-4 text-right text-xs text-slate font-mono">
                    {new Date(merchant.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

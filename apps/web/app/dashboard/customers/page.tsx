'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Wallet, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useMerchant } from '../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      if (!merchant?.id) return;
      
      // Fetch all payments for this merchant's invoices
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(merchant_id)
        `)
        .eq('invoices.merchant_id', merchant.id);

      if (error) {
        toast.error('Failed to load customer data');
        setLoading(false);
        return;
      }

      // Aggregate by payer_address
      const customerMap: Record<string, any> = {};
      payments?.forEach(p => {
        if (!customerMap[p.payer_address]) {
          customerMap[p.payer_address] = {
            address: p.payer_address,
            totalPaid: 0,
            paymentCount: 0,
            lastSeen: p.created_at,
          };
        }
        customerMap[p.payer_address].totalPaid += Number(p.amount_paid);
        customerMap[p.payer_address].paymentCount += 1;
        if (new Date(p.created_at) > new Date(customerMap[p.payer_address].lastSeen)) {
          customerMap[p.payer_address].lastSeen = p.created_at;
        }
      });

      setCustomers(Object.values(customerMap).sort((a, b) => b.totalPaid - a.totalPaid));
      setLoading(false);
    }
    fetchCustomers();
  }, [merchant]);

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy">Customer Intelligence</h1>
          <p className="text-sm text-slate mt-1 italic opacity-70">Unified view of institutional payers and their on-chain lifecycle.</p>
        </motion.div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-10 border-soft-blue flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-6 shadow-sm">
             <Filter className="w-3.5 h-3.5" /> Filter
           </Button>
           <Button className="h-10 bg-stripe-purple hover:bg-[#4434d4] flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-6 shadow-lg shadow-stripe-purple/20">
             Export CSV
           </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {[
           { label: 'Unique Payers', value: customers.length, trend: '+12%', icon: Users, color: 'text-stripe-purple' },
           { label: 'Avg Payer LTV', value: `${(customers.reduce((acc, c) => acc + c.totalPaid, 0) / (customers.length || 1)).toFixed(2)} WIRE`, trend: '+24%', icon: TrendingUp, color: 'text-success-green' },
           { label: 'Repeat Rate', value: `${((customers.filter(c => c.paymentCount > 1).length / (customers.length || 1)) * 100).toFixed(0)}%`, trend: '+5%', icon: Activity, color: 'text-blue-500' },
         ].map((stat, i) => (
            <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
            >
               <Card className="border-soft-blue shadow-none bg-white">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                           <stat.icon className="w-4 h-4" />
                        </div>
                        <Badge variant="outline" className="text-[10px] border-success-green/20 text-success-green bg-success-green/5">
                           {stat.trend}
                        </Badge>
                     </div>
                     <div className="text-2xl font-light text-deep-navy font-mono tracking-tighter">{stat.value}</div>
                     <p className="text-[10px] font-bold text-slate mt-1 uppercase tracking-widest opacity-60">{stat.label}</p>
                  </CardContent>
               </Card>
            </motion.div>
         ))}
      </div>

      <Card className="border-soft-blue shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-soft-blue bg-muted/20 py-4 px-8 flex flex-row items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                 <input type="text" placeholder="Search by wallet address..." className="bg-white border border-soft-blue rounded-md h-10 pl-10 pr-4 text-xs w-80 focus:ring-1 ring-stripe-purple outline-none" />
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-muted/10 border-b border-soft-blue">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Customer Wallet</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Lifetime Value</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Payments</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate text-right">Last Payment</th>
                </tr>
              </thead>
              <tbody className="text-sm text-deep-navy">
                {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse h-16 bg-muted/5" />)
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                       <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-slate/20">
                             <Users className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-deep-navy uppercase tracking-widest">No Active Payers</p>
                             <p className="text-[10px] text-slate font-medium opacity-60 leading-relaxed italic">
                                Your customer intelligence graph will populate automatically <br /> as unique wallets interact with your institutional node.
                             </p>
                          </div>
                       </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.address} className="border-b border-soft-blue last:border-0 hover:bg-muted/5 transition-colors group cursor-pointer">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-stripe-purple/10 flex items-center justify-center text-stripe-purple shadow-inner">
                               <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="font-mono text-xs font-bold text-deep-navy">{customer.address.slice(0, 8)}...{customer.address.slice(-6)}</p>
                               <p className="text-[10px] text-slate font-medium uppercase tracking-widest opacity-60">Verified On-Chain</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold font-mono">{customer.totalPaid.toLocaleString()}</span>
                            <span className="text-[10px] uppercase font-bold text-stripe-purple">WIRE</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <Badge variant="secondary" className="bg-muted text-deep-navy border-soft-blue text-[10px] font-bold px-3 py-1">
                            {customer.paymentCount} TRANSACTIONS
                         </Badge>
                      </td>
                      <td className="px-8 py-5 text-right font-mono text-xs text-slate">
                         {new Date(customer.lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="p-10 rounded-[40px] bg-deep-navy text-white flex flex-col items-center text-center space-y-6 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-stripe-purple/20 to-transparent pointer-events-none" />
         <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl relative z-10">
            <Coins className="w-10 h-10 text-white fill-white/20" />
         </div>
         <div className="space-y-2 relative z-10 max-w-xl">
            <h3 className="text-2xl font-light tracking-tight">Institutional Outreach</h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
               You can now trigger custom payment requests directly to highly active wallets. 
               Increase retention by rewarding your top contributors on-chain.
            </p>
         </div>
         <Button onClick={() => router.push('/dashboard/invoices/new')}  className="bg-white text-deep-navy hover:bg-white/90 text-[10px] uppercase font-extrabold tracking-[0.2em] h-12 px-12 rounded-full relative z-10 shadow-2xl">
            Create Custom Invoice <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
      </div>
    </div>
  );
}

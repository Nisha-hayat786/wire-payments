'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

import { useMerchant } from '../merchant-context';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      if (!merchant?.id) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        toast.error('Failed to load institutional invoices');
      } else {
        setInvoices(data || []);
      }
      setLoading(false);
    }
    fetchInvoices();
  }, [merchant]);

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success-green/10 text-success-green border-success-green/20';
      case 'partially_paid': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'expired': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const copyPaymentLink = (id: string) => {
    const link = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Payment link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy tracking-tight">Invoice Management</h1>
          <p className="text-sm text-slate mt-1 italic opacity-70">Monitor institutional settlement request cycles.</p>
        </motion.div>
        
        <div className="flex gap-3">
          <Link href="/dashboard/invoices/new">
             <Button className="bg-stripe-purple hover:bg-[#4434d4] text-[10px] uppercase font-bold tracking-widest px-8 h-10 text-white shadow-lg shadow-stripe-purple/20 transition-all hover:-translate-y-0.5">
               <Plus className="w-4 h-4 mr-2" /> Create Invoice
             </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Invoiced', value: invoices.length, icon: FileText, color: 'text-stripe-purple' },
           { label: 'Settled', value: invoices.filter(i => i.status === 'paid').length, icon: CheckCircle2, color: 'text-success-green' },
           { label: 'In-Flight', value: invoices.filter(i => i.status === 'pending').length, icon: Clock, color: 'text-blue-500' },
           { label: 'Settlement Rate', value: invoices.length ? `${Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100)}%` : '0%', icon: TrendingUp, color: 'text-deep-navy' },
         ].map(stat => (
            <Card key={stat.label} className="border-soft-blue shadow-none bg-white">
               <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate uppercase tracking-widest opacity-60">{stat.label}</p>
                     <p className="text-xl font-light text-deep-navy font-mono tracking-tighter">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center ${stat.color} opacity-40`}>
                     <stat.icon className="w-4 h-4" />
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>

      <Card className="border-soft-blue shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-0 border-b border-soft-blue">
          <div className="flex items-center px-8 h-16 gap-6">
            <Search className="w-4 h-4 text-slate opacity-40" />
            <input 
               className="flex-1 bg-transparent border-none outline-none text-sm text-deep-navy placeholder:text-slate/40 placeholder:font-medium"
               placeholder="Filter by Invoice ID or Business Logic Meta..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="h-9 w-9 border border-soft-blue bg-[#f8f9fc] hover:bg-white">
                  <Filter className="w-3.5 h-3.5 text-slate" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-soft-blue">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Invoice ID</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Amount</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Expiration</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                   [1,2,3,4,5].map(i => (
                     <tr key={i} className="animate-pulse bg-muted/5 h-16 border-b border-soft-blue last:border-0" />
                   ))
                ) : filteredInvoices.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-slate/20">
                               <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-deep-navy uppercase tracking-widest">No Invoices Found</p>
                               <p className="text-[10px] text-slate font-medium opacity-60 leading-relaxed italic">
                                  Your institutional ledger is currently empty. <br /> Create your first settlement request to begin.
                               </p>
                            </div>
                            <Link href="/dashboard/invoices/new">
                               <Button variant="outline" className="h-8 border-soft-blue text-[9px] uppercase font-bold tracking-widest text-stripe-purple hover:bg-stripe-purple/5">
                                  Initialize First Invoice
                               </Button>
                            </Link>
                         </div>
                      </td>
                   </tr>
                ) : (
                  filteredInvoices.map((inv, index) => (
                    <motion.tr 
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-soft-blue last:border-0 hover:bg-muted/5 transition-colors group"
                    >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <span className="font-bold text-deep-navy font-mono text-xs">{inv.id.slice(0, 12)}...</span>
                            <Badge variant="outline" className="text-[8px] bg-muted/30 border-soft-blue uppercase tracking-tighter">ID</Badge>
                         </div>
                         <p className="text-[10px] text-slate font-medium truncate max-w-[180px] mt-1 italic">{inv.description || "No description"}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="font-mono text-sm font-bold text-deep-navy">{inv.amount} <span className="text-[10px] text-slate opacity-40">{inv.currency}</span></p>
                      </td>
                      <td className="px-8 py-6">
                         <Badge className={`text-[9px] uppercase font-bold tracking-[0.15em] px-3 py-1 rounded-full border shadow-xs ${getStatusStyle(inv.status)}`}>
                           {inv.status}
                         </Badge>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate font-medium">
                         <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 opacity-30" />
                            {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : 'No expiration'}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 text-stripe-purple hover:bg-stripe-purple/10"
                               onClick={() => copyPaymentLink(inv.id)}
                            >
                               {copiedId === inv.id ? <CheckCircle2 className="w-4 h-4 text-success-green" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Link href={`/checkout/${inv.id}`} target="_blank">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate hover:text-deep-navy hover:bg-muted/30">
                                  <ExternalLink className="w-4 h-4" />
                               </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate">
                               <ChevronRight className="w-4 h-4" />
                            </Button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  MoreHorizontal, 
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react';


import { useMerchant } from '../merchant-context';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF } from '@/lib/pdf';

export default function PaymentsPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  useEffect(() => {
    async function fetchInvoices() {
      if (!merchant?.id) return;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'partially_paid': return <Layers className="w-3 h-3 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      default: return <AlertCircle className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-8 selection:bg-stripe-purple/10 selection:text-stripe-purple">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy tracking-tight">Payments Ledger</h1>
          <p className="text-sm text-slate mt-1 italic opacity-70">Unified transaction history for {merchant?.business_name}.</p>
        </motion.div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 border-soft-blue bg-white shadow-sm text-xs font-bold uppercase tracking-widest text-slate hover:text-deep-navy px-4">
             <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
          <Button variant="outline" className="h-10 border-soft-blue bg-white shadow-sm text-xs font-bold uppercase tracking-widest text-slate hover:text-deep-navy px-4">
             <Download className="w-3.5 h-3.5 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-soft-blue shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-0 border-b border-soft-blue">
            <div className="flex items-center px-8 h-16 gap-4">
              <Search className="w-4 h-4 text-slate opacity-40" />
              <input 
                 className="flex-1 bg-transparent border-none outline-none text-sm text-deep-navy placeholder:text-slate/40 placeholder:font-medium"
                 placeholder="Search by Invoice ID or Description..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-soft-blue">
                    <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Invoice ID</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Amount</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Currency</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate text-center">Status</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate text-right">Created</th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="text-sm text-deep-navy">
                  <AnimatePresence>
                    {loading ? (
                       [1,2,3,4,5].map(i => (
                         <tr key={i} className="animate-pulse bg-muted/5 h-16 border-b border-soft-blue last:border-0" />
                       ))
                    ) : filteredInvoices.map((inv, index) => (
                      <motion.tr 
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-soft-blue last:border-0 hover:bg-muted/10 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-5">
                           <p className="font-bold text-deep-navy font-mono text-xs">{inv.id}</p>
                           <p className="text-[10px] text-slate font-medium truncate max-w-[200px] mt-0.5">{inv.description || "Digital Asset Settlement"}</p>
                        </td>
                        <td className="px-8 py-5 font-mono text-sm font-bold text-deep-navy">
                           {Number(inv.amount).toFixed(2)}
                        </td>
                        <td className="px-8 py-5 font-bold text-xs text-slate opacity-60">
                           {inv.currency}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <Badge className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border shadow-sm ${getStatusStyle(inv.status)}`}>
                              <span className="flex items-center">
                                {getStatusIcon(inv.status)}
                                {inv.status}
                              </span>
                            </Badge>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-mono text-xs text-slate font-medium">
                           {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex justify-end gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className={`h-8 w-8 transition-colors ${copiedId === inv.id ? 'text-success-green' : 'text-stripe-purple hover:bg-stripe-purple/10'}`}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(inv.id);
                                 }}
                              >
                                 {copiedId === inv.id ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                              </Button>
                              <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-stripe-purple hover:bg-stripe-purple/10 transition-colors"

                                 onClick={(e) => {
                                    e.stopPropagation();
                                    generateInvoicePDF(inv.id);
                                 }}
                              >
                                 <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate opacity-40 hover:opacity-100 transition-opacity">
                                 <MoreHorizontal className="w-4 h-4" />
                              </Button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {!loading && filteredInvoices.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-8 py-24 text-center">
                           <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-slate/20">
                                 <Receipt className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-deep-navy uppercase tracking-widest">No Payment Records</p>
                                 <p className="text-[10px] text-slate font-medium opacity-60 leading-relaxed italic">
                                    Unified settlement history will populate as soon as your <br /> institutional node confirms its first protocol payment.
                                 </p>
                              </div>
                           </div>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {!loading && filteredInvoices.length > 0 && (
             <div className="bg-muted/10 border-t border-soft-blue py-4 px-8 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-60 italic">Showing {filteredInvoices.length} transactions</p>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-7 text-[10px] border-soft-blue font-bold tracking-widest text-slate opacity-40 bg-white" disabled>Previous</Button>
                   <Button variant="outline" size="sm" className="h-7 text-[10px] border-soft-blue font-bold tracking-widest text-slate opacity-40 bg-white" disabled>Next</Button>
                </div>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
}

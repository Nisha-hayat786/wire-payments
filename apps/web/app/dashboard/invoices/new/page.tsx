'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { MetadataBuilder } from '@/components/metadata-builder';
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Wallet, 
  DollarSign, 
  FileText,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import Link from 'next/link';


export default function NewInvoicePage() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('WIRE');
  const [description, setDescription] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const supabase = createClient();


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return toast.error('Amount is required');
    setLoading(true);

    try {
      // 1. Get Current Merchant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();


      if (merchantError || !merchant) {
         throw new Error('Merchant profile not found. Please complete institutional onboarding.');
      }

      // 2. Insert Invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert([{
          merchant_id: merchant?.id,
          amount: parseFloat(amount),
          currency,
          description,
          redirect_url: redirectUrl,
          metadata,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

        }])
        .select()
        .single();

      if (error) throw error;

      setSuccessId(invoice.id);
      toast.success('Invoice generated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!successId) return;
    const url = `${window.location.origin}/checkout/${successId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="min-h-screen bg-[#f6f9fc] p-8 md:p-12 selection:bg-stripe-purple/10 selection:text-stripe-purple font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate hover:text-deep-navy transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-deep-navy">Create new invoice</h1>
            <p className="text-slate text-sm mt-1">Generate a secure payment link for your customer.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate uppercase tracking-widest bg-white border border-soft-blue px-3 py-1.5 rounded-md shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-stripe-purple" /> On-chain settlement
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleCreate} className="grid md:grid-cols-[1fr,300px] gap-8 items-start">
            <Card className="border-soft-blue shadow-xl bg-white overflow-hidden">
               <CardHeader className="border-b border-soft-blue bg-muted/20">
                  <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-stripe-purple" />
                     <CardTitle className="text-sm font-bold text-deep-navy uppercase tracking-widest">General Information</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-widest">Payment Amount</label>
                    <div className="flex gap-4">
                       <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                          <Input 
                             type="number" 
                             step="0.01" 
                             placeholder="0.00"
                             className="pl-10 h-12 text-lg border-soft-blue bg-white focus:ring-stripe-purple font-mono"
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             required
                          />
                       </div>
                       <div className="w-32 h-12 border border-soft-blue rounded-md flex items-center justify-center font-bold text-deep-navy bg-muted/30">
                          WIRE
                       </div>
                    </div>
                  </div>

                   <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-widest">Post-Payment Redirect URL</label>
                    <Input 
                       placeholder="https://yourdomain.com/thanks"
                       className="h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                       value={redirectUrl}
                       onChange={(e) => setRedirectUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-widest">Public Description</label>
                    <Input 
                       placeholder="e.g. Premium Subscription Plan"
                       className="h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>


                  <div className="pt-4 border-t border-soft-blue border-dashed">
                     <MetadataBuilder onChange={setMetadata} />
                  </div>
               </CardContent>
            </Card>

            <div className="space-y-6">
               <Card className="border-soft-blue shadow-lg bg-white overflow-hidden">
                  <CardHeader className="pb-4">
                     <CardTitle className="text-xs font-bold text-deep-navy uppercase tracking-widest italic">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate">Subtotal</span>
                        <span className="font-mono text-deep-navy">{amount || '0.00'}</span>
                     </div>
                     <div className="flex justify-between text-sm font-bold pt-4 border-t border-soft-blue">
                        <span className="text-deep-navy">Total Due</span>
                        <span className="text-stripe-purple">{amount || '0.00'} WIRE</span>
                     </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 p-4 border-t border-soft-blue">
                     <Button 
                       type="submit" 
                       disabled={loading}
                       className="w-full h-11 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-md shadow-lg shadow-stripe-purple/20 transition-all font-bold uppercase tracking-widest text-[10px]"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Invoice'}
                     </Button>
                  </CardFooter>
               </Card>

               <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Developer tip</p>
                  <p className="text-[11px] text-blue-600/80 leading-relaxed italic">
                    You can also generate invoices via <Link href="/docs" className="underline font-bold">API</Link> for automated order fulfillment workflows.
                  </p>
               </div>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {successId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-deep-navy/20 backdrop-blur-sm"
            >
              <Card className="w-full max-w-lg border-soft-blue shadow-2xl bg-white overflow-hidden">
                <CardHeader className="text-center pt-10 pb-6 border-b border-soft-blue/30">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                    <Check className="w-8 h-8 text-success-green" />
                  </div>
                  <CardTitle className="text-2xl font-light text-deep-navy">Invoice generated</CardTitle>
                  <CardDescription>Your payment link is ready to be shared.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-widest leading-none">Shareable Link</label>
                    <div className="flex gap-2">
                       <Input 
                         readOnly 
                         value={`${window.location.origin}/checkout/${successId}`}
                         className="font-mono text-xs h-11 bg-muted/30 border-soft-blue"
                       />
                       <Button 
                         onClick={copyLink}
                         className={`h-11 px-4 transition-all ${copied ? 'bg-success-green hover:bg-success-green' : 'bg-stripe-purple hover:bg-[#4434d4] text-white shadow-lg shadow-stripe-purple/20'}`}
                       >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 border border-soft-blue rounded-lg flex items-center justify-between text-xs">
                     <span className="text-slate font-medium">Invoice ID: <span className="text-deep-navy font-mono">{successId}</span></span>
                     <span className="font-bold text-stripe-purple">{amount} WIRE</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-muted/10 border-t border-soft-blue flex gap-3">
                   <Button 
                      variant="outline" 
                      className="flex-1 h-11 border-soft-blue font-bold uppercase tracking-widest text-[10px]"
                      onClick={() => setSuccessId(null)}
                   >
                     Create Another
                   </Button>
                   <Button 
                      className="flex-1 h-11 bg-deep-navy hover:bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px]"
                      onClick={() => router.push('/dashboard/payments')}
                   >
                     View Ledger
                   </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

  );
}

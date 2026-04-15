'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Webhook, 
  Trash2, 
  Copy, 
  Check, 
  RotateCw, 
  ExternalLink,
  Shield,
  Activity,
  Globe,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { useMerchant } from '../../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { randomBytes } from 'crypto';

export default function WebhooksPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchEndpoints = async () => {
    if (!merchant?.id) return;
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load endpoints');
    } else {
      setEndpoints(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEndpoints();
  }, [merchant]);

  const handleCreateEndpoint = async () => {
    if (!newUrl) return;
    setAddingLoading(true);
    try {
      const secret = `whsec_${Buffer.from(randomBytes(24)).toString('hex')}`;
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .insert([{
          merchant_id: merchant.id,
          url: newUrl,
          secret: secret,
          events: ['invoice.paid', 'invoice.failed', 'invoice.expired']
        }])
        .select()
        .single();

      if (error) throw error;
      
      setEndpoints([data, ...endpoints]);
      setNewUrl('');
      setIsAdding(false);
      toast.success('Webhook endpoint created');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingLoading(false);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEndpoints(endpoints.filter(e => e.id !== id));
      toast.success('Endpoint deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    toast.success('Secret copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestEndpoint = async (id: string) => {
    setTestingId(id);
    try {
      const resp = await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointId: id, merchantId: merchant.id })
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      
      toast.success('Test event delivered successfully');
    } catch (err: any) {
      toast.error(`Delivery Failed: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy">Webhook Endpoints</h1>
          <p className="text-sm text-slate mt-1">Manage delivery URLs for automated payment orchestration.</p>
        </motion.div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-stripe-purple hover:bg-[#4434d4] text-[10px] uppercase font-bold tracking-widest px-6 h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-2" /> 
          Add Endpoint
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-stripe-purple/20 bg-stripe-purple/2 shadow-sm">
              <CardContent className="p-8 flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">URL to receive events</Label>
                  <Input 
                    placeholder="https://api.yourdomain.com/webhooks" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                  />
                </div>
                <Button 
                  onClick={handleCreateEndpoint}
                  disabled={addingLoading || !newUrl}
                  className="h-11 bg-stripe-purple min-w-[140px]"
                >
                  {addingLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Create Endpoint'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-xl" />)
        ) : endpoints.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-soft-blue rounded-2xl bg-muted/5">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-soft-blue">
                <Globe className="w-8 h-8 text-slate opacity-20" />
             </div>
             <p className="text-sm font-medium text-slate">No endpoints configured for this environment.</p>
             <p className="text-[10px] text-slate opacity-60 uppercase tracking-widest mt-2 cursor-pointer hover:text-stripe-purple" onClick={() => setIsAdding(true)}>Configure your first URL</p>
          </div>
        ) : (
          endpoints.map((endpoint, i) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-soft-blue group hover:border-stripe-purple/30 transition-all shadow-none bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/10 border-b border-soft-blue/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-soft-blue flex items-center justify-center shadow-sm">
                      <Webhook className="w-5 h-5 text-stripe-purple" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-deep-navy">{endpoint.url}</CardTitle>
                      <CardDescription className="text-[10px] font-mono opacity-60">{endpoint.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-widest ${endpoint.is_active ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-slate/10 text-slate border-slate/20'}`}>
                      {endpoint.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-stripe-purple" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate opacity-60">Subscribed Events</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.events.map((ev: string) => (
                          <Badge key={ev} variant="outline" className="text-[10px] font-medium bg-muted/30 border-soft-blue py-1 px-3">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-stripe-purple" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate opacity-60">Signing Secret</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-muted/20 border border-soft-blue rounded-md h-10 px-4 flex items-center font-mono text-[11px] text-deep-navy overflow-hidden">
                          {endpoint.secret.slice(0, 16)}••••••••••••••••
                        </div>
                        <Button 
                          variant="outline" 
                          className="h-10 px-4 border-soft-blue hover:bg-muted/50 transition-colors"
                          onClick={() => copySecret(endpoint.id, endpoint.secret)}
                        >
                          {copiedId === endpoint.id ? <Check className="w-4 h-4 text-success-green" /> : <Copy className="w-4 h-4 text-slate" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="py-3 px-8 bg-muted/5 border-t border-soft-blue/50 flex justify-between">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate uppercase tracking-widest opacity-40">
                         <div className="w-1.5 h-1.5 rounded-full bg-success-green" />
                         Last Success: N/A
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Button 
                         variant="ghost" 
                         className="text-[10px] font-bold text-stripe-purple uppercase tracking-widest h-8 px-3 hover:bg-stripe-purple/10"
                         onClick={() => handleTestEndpoint(endpoint.id)}
                         disabled={testingId === endpoint.id}
                      >
                         {testingId === endpoint.id ? <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Activity className="w-3.5 h-3.5 mr-2" />}
                         Send Test Event
                      </Button>
                      <Link href={`/dashboard/developers/logs?endpoint=${endpoint.id}`}>
                         <Button variant="ghost" className="text-[10px] font-bold text-stripe-purple uppercase tracking-widest h-8 px-3 hover:bg-stripe-purple/10">
                            View Logs <ExternalLink className="w-3.5 h-3.5 ml-2" />
                         </Button>
                      </Link>
                   </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-8 rounded-2xl bg-deep-navy text-white flex items-center justify-between overflow-hidden relative group">
         <div className="space-y-2 relative z-10">
            <h3 className="text-lg font-light tracking-tight">Need to test your integration?</h3>
            <p className="text-sm text-white/60 font-medium">Use the test button above to trigger test events directly to your endpoints.</p>
         </div>
         <Link href="/docs">
            <Button className="bg-white text-deep-navy hover:bg-white/90 text-[10px] uppercase font-bold tracking-widest relative z-10 h-10 px-12 rounded-full">
               View Documentation
            </Button>
         </Link>
         <div className="absolute top-0 right-0 w-64 h-64 bg-stripe-purple/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-stripe-purple/30 transition-all duration-700" />
      </div>

      <Card className="border-orange-100 bg-orange-50/10">
         <CardContent className="p-6 flex gap-4">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
            <div className="space-y-1">
               <p className="text-xs font-bold text-deep-navy">HMAC Verification Required</p>
               <p className="text-[11px] text-slate leading-relaxed">
                  For security, we recommend verifying the <code>X-WirePayments-Signature</code> on all incoming requests. 
                  View our <span className="text-stripe-purple font-bold hover:underline cursor-pointer">Security Guide</span> for implementation details.
               </p>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

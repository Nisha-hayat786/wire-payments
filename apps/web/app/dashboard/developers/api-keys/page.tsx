'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  Shield, 
  RefreshCw, 
  Loader2,
  Lock,
  Key,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useMerchant } from '../../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { rotateMerchantApiKey } from '@/app/actions/merchant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ApiKeysPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateKey = async () => {
    if (!confirm('This will invalidate any existing API key. This action cannot be undone. Proceed?')) return;
    
    setGenerating(true);
    try {
      const result = await rotateMerchantApiKey(merchant.id);

      if (result.success && result.key) {
        setRawKey(result.key);
        setApiKey(result.key);
        toast.success('New API key generated. Please save it securely!');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };


  const copyToClipboard = () => {
    if (!rawKey && apiKey.includes('•')) {
        toast.error('Generate a new key to view and copy.');
        return;
    }
    navigator.clipboard.writeText(rawKey || apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="space-y-10 max-w-5xl selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-light text-deep-navy tracking-tight">API Infrastructure</h1>
        <p className="text-sm text-slate opacity-70 italic font-medium">Manage institutional credentials for the Wirefluid integration layer.</p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-8 items-start">
        <div className="space-y-8">
           <Card className="border-soft-blue shadow-none bg-white overflow-hidden relative group">
              <CardHeader className="border-b border-soft-blue bg-muted/5 py-6 px-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stripe-purple/10 flex items-center justify-center text-stripe-purple">
                       <Key className="w-5 h-5" />
                    </div>
                    <div>
                       <CardTitle className="text-sm font-bold text-deep-navy uppercase tracking-widest leading-none mb-1">Secret live key</CardTitle>
                       <CardDescription className="text-[10px] font-medium opacity-60">Authentication for institutional API requests</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <Label className="text-[10px] font-bold text-slate uppercase tracking-[0.2em] leading-none">Credential string</Label>
                       {rawKey && (
                          <Badge variant="outline" className="text-[9px] font-bold bg-orange-50 text-orange-600 border-orange-200 uppercase tracking-widest px-3 py-1">
                             Copy now - shown only once
                          </Badge>
                       )}
                    </div>
                    <div className="flex gap-3">
                       <div className="flex-1 bg-muted/10 rounded-xl border border-soft-blue px-6 h-14 flex items-center font-mono text-sm text-deep-navy overflow-hidden">
                          {apiKey}
                       </div>
                       <Button 
                          variant="outline" 
                          className="h-14 w-14 border-soft-blue rounded-xl hover:bg-muted/50 transition-all active:scale-95 shadow-sm"
                          onClick={copyToClipboard}
                       >
                          {copied ? <Check className="w-5 h-5 text-success-green" /> : <Copy className="w-5 h-5 text-slate" />}
                       </Button>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <ShieldCheck className="w-32 h-32" />
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                       <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <Lock className="w-5 h-5 text-stripe-purple" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest">Security isolation</p>
                          <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                             Our protocol utilizes one-way SHA-256 hashing. We never store plain-text credentials in our primary vault. 
                             Institutional integrity requires rotating keys if physical or digital security is ever compromised.
                          </p>
                       </div>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="bg-muted/5 border-t border-soft-blue py-6 px-8 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-40">Security Status</span>
                    <span className="text-[11px] font-bold text-success-green uppercase tracking-tight">Enabled & Secure</span>
                 </div>
                 <Button 
                    variant="outline" 
                    className="border-soft-blue text-[10px] font-extrabold text-stripe-purple uppercase tracking-[0.2em] hover:bg-stripe-purple/5 h-12 px-8 rounded-xl transition-all shadow-sm"
                    disabled={generating}
                    onClick={handleGenerateKey}
                 >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <RefreshCw className="w-4 h-4 mr-3" />}
                    Rotate secret key
                 </Button>
              </CardFooter>
           </Card>
        </div>

        <div className="space-y-6">
           <div className="p-8 bg-[#fcfdfe] border border-soft-blue rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-blue-500" />
                 <h4 className="text-[10px] font-extrabold text-deep-navy uppercase tracking-[0.2em]">Quick Start</h4>
              </div>
              <p className="text-xs text-slate font-medium leading-relaxed opacity-80 italic">
                 "Authentication is performed via the 'Authorization' header using your secret key as a Bearer token. Ensure your backend environment variables are encrypted at rest."
              </p>
              <Button variant="ghost" className="w-full text-stripe-purple font-bold text-[10px] uppercase tracking-widest h-8 px-0 justify-start hover:bg-transparent">
                 Read API Reference →
              </Button>
           </div>

           <div className="p-8 bg-muted/10 border border-soft-blue/50 rounded-3xl space-y-4">
              <p className="text-[10px] font-extrabold text-slate uppercase tracking-[0.25em]">Audit log</p>
              <div className="space-y-4 pt-2">
                 <div className="flex items-center justify-between text-[11px] font-medium text-deep-navy/60">
                    <span>Key Rotation</span>
                    <span className="font-mono">{new Date(merchant?.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-medium text-deep-navy/60">
                    <span>Last Discovery</span>
                    <span className="font-mono">Recently</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

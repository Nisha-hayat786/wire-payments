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
  Globe, 
  RefreshCw, 
  Save, 
  Loader2,
  Lock,
  Wallet
} from 'lucide-react';
import { useMerchant } from '../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { rotateMerchantApiKey } from '@/app/actions/merchant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [businessName, setBusinessName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.business_name || '');
      setWebhookUrl(merchant.webhook_url || '');
      setWalletAddress(merchant.wallet_address || '');
    }
  }, [merchant]);

  const handleSaveProfile = async () => {
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast.error('Invalid EVM wallet address. Must start with 0x and be 42 characters long.');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          business_name: businessName,
          webhook_url: webhookUrl,
          wallet_address: walletAddress
        })
        .eq('id', merchant.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!confirm('This will invalidate any existing API key. Proceed?')) return;
    
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
      >
        <h1 className="text-3xl font-light text-deep-navy">Developer Settings</h1>
        <p className="text-sm text-slate mt-1">Configure your API credentials and institutional branding.</p>
      </motion.div>

      <div className="space-y-8">
           <Card className="border-soft-blue shadow-lg bg-white overflow-hidden sticky top-32">
              <CardHeader className="pb-4">
                 <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-stripe-purple" />
                    <CardTitle className="text-sm font-bold text-deep-navy uppercase tracking-widest">Business profile</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Display name</Label>
                    <Input 
                       className="h-11 border-soft-blue bg-white focus:ring-stripe-purple" 
                       value={businessName}
                       onChange={(e) => setBusinessName(e.target.value)}
                       placeholder="Institutional Entity Name"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Settlement Wallet (EVM)</Label>
                    <div className="relative">
                       <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                       <Input 
                          className="h-11 border-soft-blue bg-white pl-10 font-mono text-sm text-deep-navy" 
                          placeholder="0x..."
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                       />
                    </div>
                 </div>
                 
                 <div className="pt-4 space-y-4">
                    <Button 
                       className="w-full h-12 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-xl shadow-lg shadow-stripe-purple/20 transition-all font-bold uppercase tracking-widest text-[10px] group"
                       disabled={saving}
                       onClick={handleSaveProfile}
                    >
                       {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                       Save configuration
                    </Button>
                    <div className="p-4 bg-muted/5 rounded-xl border border-soft-blue/50">
                       <p className="text-[10px] text-center text-slate font-medium leading-relaxed italic opacity-60">
                          Institutional changes typically propagate across the Wirefluid network in &lt;100ms.
                       </p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-10 bg-stripe-purple/5 border border-stripe-purple/10 rounded-[40px] space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-stripe-purple animate-pulse" />
                 <p className="text-[11px] font-bold text-stripe-purple uppercase tracking-[0.2em]">Compliance Note</p>
              </div>
              <p className="text-xs text-deep-navy/70 leading-relaxed font-medium">
                "Our architecture ensures that on-chain settlements are as seamless as traditional rails, with security baked into the core protocol layer."
              </p>
           </div>
        </div>
    </div>
  );
}

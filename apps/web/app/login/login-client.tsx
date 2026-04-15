'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Signed in successfully');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 selection:bg-stripe-purple/10 selection:text-stripe-purple py-32">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] space-y-8"
      >

        <Card className="border-soft-blue overflow-hidden bg-white">
          <CardHeader className="space-y-1 pt-8 px-10 text-center">
            <CardTitle className="text-2xl font-light text-deep-navy">Sign in to your account</CardTitle>
            <CardDescription className="text-slate text-sm">
              Manage your on-chain financial operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-8 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10 h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Password</Label>
                   <Link href="#" className="text-[10px] font-bold text-stripe-purple uppercase tracking-widest hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-md mt-6 border-0 shadow-none transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[11px]">
                    Sign in to Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-soft-blue px-10 py-4 flex justify-between items-center">
             <p className="text-xs text-slate font-medium">New to WirePayments?</p>
             <Link href="/signup" className="text-xs text-stripe-purple font-bold hover:underline py-1">Create account</Link>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-3 opacity-40">
           <Shield className="w-4 h-4 text-deep-navy" />
           <p className="text-[10px] text-deep-navy font-bold uppercase tracking-widest">
              Secure Cloud Infrastructure
           </p>
        </div>
      </motion.div>
    </div>
  );
}

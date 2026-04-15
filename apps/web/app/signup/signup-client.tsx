'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Shield, Rocket, ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function SignupClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: merchantError } = await supabase
          .from('merchants')
          .insert([{
            owner_id: data.user.id,
            business_name: businessName,
            wallet_address: '',
          }]);

        if (merchantError) throw merchantError;

        toast.success(`Welcome to WirePayments!`);
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-stripe-purple/10 selection:text-stripe-purple">
      <div className="hidden lg:flex flex-1 bg-deep-navy relative overflow-hidden items-center justify-center p-20">
        <div className="relative z-10 max-w-lg space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl font-light text-white leading-tight">
              Start accepting <span className="text-stripe-purple font-medium">on-chain</span> payments today.
            </h1>
            <p className="text-lg text-white/60 font-light leading-relaxed">
              Join thousands of businesses scaling their financial operations on the Wirefluid ecosystem.
            </p>
          </div>

          <div className="space-y-6 pt-12">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stripe-purple">
                   <Shield className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-white font-medium">Institutional Security</p>
                   <p className="text-sm text-white/40">Hashed keys and multi-sig compatible.</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stripe-purple">
                   <Rocket className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-white font-medium">Instant Settlement</p>
                   <p className="text-sm text-white/40">Funds arrive directly in your wallet.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stripe-purple/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-[#f6f9fc]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[440px]"
        >

          <Card className="border-soft-blue overflow-hidden bg-white">
            <CardHeader className="space-y-1 pt-8 px-10">
              <CardTitle className="text-2xl font-light text-deep-navy">Create your account</CardTitle>
              <CardDescription className="text-slate text-sm">
                Get started with WirePayments in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-8 pt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Business Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                    <Input
                      placeholder="e.g. Acme Corp"
                      className="pl-10 h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                  <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Password</Label>
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
                    <span className="flex items-center gap-2">
                      Create business account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-soft-blue px-10 py-4 flex justify-center">
               <p className="text-xs text-slate font-medium">
                  Already have an account? <Link href="/login" className="text-stripe-purple font-bold hover:underline">Sign in</Link>
               </p>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center space-y-4">
             <p className="text-[10px] text-slate font-bold uppercase tracking-widest opacity-60">
                By signing up, you agree to our Terms and Conditions
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

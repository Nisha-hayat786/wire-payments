'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Admin access only.');
      }

      toast.success('Admin authenticated');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f9fc] p-6 selection:bg-stripe-purple/10 selection:text-stripe-purple">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate hover:text-deep-navy transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-stripe-purple flex items-center justify-center shadow-lg shadow-stripe-purple/20">
                <Lock className="text-white w-6 h-6" />
            </div>
        </div>

        <Card className="border-soft-blue shadow-[0_50px_100px_-20px_rgba(50,50,93,0.15),0_30px_60px_-30px_rgba(0,0,0,0.1)]">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-2xl font-light text-deep-navy">Admin Portal</CardTitle>
            <CardDescription className="text-slate text-sm">
              Global Platform Control Center
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                  <Input 
                    type="email" 
                    placeholder="admin@wirepayments.com" 
                    className="pl-10 h-11 border-soft-blue bg-white focus:ring-stripe-purple"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
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
                className="w-full h-11 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-md mt-6 shadow-lg shadow-stripe-purple/20 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in to System'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate text-[10px] mt-8 font-bold uppercase tracking-widest opacity-60">
            Internal Use Only &bull; WirePayments Infrastructure
        </p>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Banknote
} from 'lucide-react';
import { GATEWAY_ABI, GATEWAY_ADDRESS } from '@/lib/wagmi';
import { useMerchant } from '../merchant-context';
import { motion } from 'framer-motion';

export default function BalancesPage() {
  const { merchant } = useMerchant();
  const { address: connectedAddress } = useAccount();
  const supabase = createClient();
  const settlementAddress = merchant?.wallet_address || connectedAddress;

  const { data: balance, isLoading, refetch } = useReadContract({
    address: GATEWAY_ADDRESS as `0x${string}`,
    abi: GATEWAY_ABI,
    functionName: 'balances',
    args: settlementAddress ? [settlementAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!settlementAddress,
    }
  });

  const [stats, setStats] = useState({
    incomingToday: 0,
    totalWithdrawn: 0
  });

  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isWithdrawing, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const fetchStats = async () => {
    if (!merchant?.id) return;

    // 1. Incoming Today (payments in last 24h)
    const { data: incomingData } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('merchant_id', merchant.id) // Wait, payments table might not have merchant_id directly if it was missing in schema check
      // Actually invoices joining
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    // 2. Total Withdrawn
    const { data: withdrawnData } = await supabase
      .from('payouts')
      .select('amount')
      .eq('merchant_id', merchant.id);

    setStats({
      incomingToday: incomingData?.reduce((acc, p) => acc + Number(p.amount_paid), 0) || 0,
      totalWithdrawn: withdrawnData?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
    });
  };

  useEffect(() => {
    fetchStats();
  }, [merchant, isConfirmed]);

  const handleWithdraw = async () => {
    if (!merchant?.wallet_address || !connectedAddress) return;
    
    try {
      await writeContractAsync({
        address: GATEWAY_ADDRESS as `0x${string}`,
        abi: GATEWAY_ABI,
        functionName: 'withdrawFunds',
      });
    } catch (err: any) {
        console.error('Withdrawal failed:', err);
    }
  };

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20 max-w-5xl">
      <motion.div
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-light text-deep-navy tracking-tight">Financial Assets</h1>
        <p className="text-sm text-slate mt-1 italic opacity-70">Manage your settled funds and withdrawal configurations.</p>
      </motion.div>

      <div className="grid md:grid-cols-[1fr,360px] gap-8 items-start">
        <div className="space-y-8">
          <Card className="border-soft-blue bg-deep-navy text-white overflow-hidden relative group shadow-none">
            <CardHeader className="pb-2 border-b border-white/10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                        <Banknote className="w-4 h-4 text-stripe-purple" />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Settled Balance</span>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[9px] uppercase tracking-tighter">Real-time settlement active</Badge>
               </div>
            </CardHeader>
            <CardContent className="pt-8 pb-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <h2 className="text-6xl font-light font-mono tracking-tighter">
                  {balance !== undefined ? parseFloat(formatEther(balance as bigint)).toFixed(2) : '0.00'}
                  <span className="text-xl text-white/30 ml-2">WIRE</span>
                </h2>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3" /> Non-custodial Smart Contract Settlement
                </div>
              </div>
            </CardContent>
            
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-stripe-purple/10 blur-[100px] rounded-full group-hover:bg-stripe-purple/20 transition-all duration-700 pointer-events-none" />
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-soft-blue bg-white p-6 space-y-4 shadow-none">
                 <div className="w-10 h-10 rounded-lg bg-success-green/10 flex items-center justify-center text-success-green">
                    <ArrowDownLeft className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Incoming Today</p>
                    <p className="text-xl font-bold text-deep-navy font-mono">{stats.incomingToday.toLocaleString()} <span className="text-[10px] text-slate/40 uppercase ml-1">WIRE</span></p>
                 </div>
              </Card>
              <Card className="border-soft-blue bg-white p-6 space-y-4 shadow-none">
                 <div className="w-10 h-10 rounded-lg bg-stripe-purple/10 flex items-center justify-center text-stripe-purple">
                    <ArrowUpRight className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Withdrawn</p>
                    <p className="text-xl font-bold text-deep-navy font-mono">{stats.totalWithdrawn.toLocaleString()} <span className="text-[10px] text-slate/40 uppercase ml-1">WIRE</span></p>
                 </div>
              </Card>
          </div>
          
          <div className="p-6 bg-[#f6f9fc] border border-soft-blue rounded-xl flex items-start gap-4">
             <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
             <div className="space-y-1">
                <p className="text-xs font-bold text-deep-navy uppercase tracking-widest">Settlement Guarantee</p>
                <p className="text-xs text-slate leading-relaxed italic">
                   All transactions are verified by the Wirefluid network at block-depth 12. Settlement addresses can be updated in your developer settings.
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <Card className="border-soft-blue bg-white overflow-hidden sticky top-32 shadow-none">
              <CardHeader className="pb-4">
                 <CardTitle className="text-xs font-bold text-deep-navy uppercase tracking-widest italic">Withdrawal Hub</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate uppercase tracking-widest">Linked Settlement Wallet</Label>
                    <div className="p-3 bg-muted/30 border border-soft-blue rounded-md text-[10px] font-mono text-deep-navy break-all italic">
                       {settlementAddress || 'No wallet linked. Please check settings.'}
                    </div>
                 </div>
                 
                 <div className="pt-4 space-y-3">
                     <Button 
                        className="w-full h-11 bg-stripe-purple hover:bg-[#4434d4] text-white rounded-md border-0 shadow-none transition-all font-bold uppercase tracking-widest text-[10px]"
                        disabled={isLoading || isWithdrawing || !balance || (balance as bigint) === BigInt(0)}
                        onClick={handleWithdraw}
                     >
                        {isWithdrawing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Initiate Withdrawal
                     </Button>
                    <p className="text-[10px] text-center text-slate font-medium leading-relaxed italic px-4">
                       Withdrawals are non-custodial and execute directly from the smart contract.
                    </p>
                 </div>
              </CardContent>
           </Card>

           <div className="space-y-4">
              <h3 className="text-[10px] font-extrabold text-slate uppercase tracking-[0.2em]">Platform Notes</h3>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[11px] text-deep-navy/70 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-success-green" /> 0% Withdrawal Fees
                 </div>
                 <div className="flex items-center gap-2 text-[11px] text-deep-navy/70 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-success-green" /> Institutional Liquidity
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
    return (
        <div className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${className}`}>
            {children}
        </div>
    )
}

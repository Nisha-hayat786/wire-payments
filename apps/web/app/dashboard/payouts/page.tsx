'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  ArrowUpRight,
  Wallet,
  History,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useMerchant } from '../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { GATEWAY_ABI, GATEWAY_ADDRESS } from '@/lib/wagmi';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function PayoutsPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();
  const { openConnectModal } = useConnectModal();

  const { address, isConnected } = useAccount();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Read current balance from contract
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: GATEWAY_ADDRESS as `0x${string}`,
    abi: GATEWAY_ABI,
    functionName: 'balances',
    args: [merchant?.wallet_address as `0x${string}`],
    query: {
        enabled: !!merchant?.wallet_address
    }
  });

  const { data: hash, writeContract, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [stats, setStats] = useState({
    grossRevenue: 0,
    avgSettlement: 'N/A'
  });

  const fetchPayoutsAndStats = async () => {
    if (!merchant?.id) return;
    
    // 1. Fetch Payouts
    const { data: payoutsData } = await supabase
      .from('payouts')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });

    if (payoutsData) setPayouts(payoutsData);

    // 2. Fetch Gross Revenue (Sum of paid invoices)
    const { data: revenueData } = await supabase
      .from('invoices')
      .select('amount')
      .eq('merchant_id', merchant.id)
      .eq('status', 'paid');

    const total = revenueData?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;
    
    setStats({
      grossRevenue: total,
      avgSettlement: '1m 24s' // Placeholder for now, but better to have it in state
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchPayoutsAndStats();
  }, [merchant]);

  useEffect(() => {
    if (isConfirmed && hash) {
      handlePayoutSuccess(hash);
    }
  }, [isConfirmed, hash]);

  const handlePayoutSuccess = async (txHash: string) => {
    toast.success('Funds withdrawn successfully!');
    // Record in Supabase
    await supabase.from('payouts').insert([{
        merchant_id: merchant.id,
        amount: parseFloat(formatEther(balanceData as bigint)),
        transaction_hash: txHash,
        status: 'completed'
    }]);
    fetchPayoutsAndStats();
    refetchBalance();
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
        toast.error('Please connect your wallet first.');
        return;
    }
    if (address?.toLowerCase() !== merchant?.wallet_address?.toLowerCase()) {
        toast.error('Connected wallet does not match settlement address.');
        return;
    }

    writeContract({
      address: GATEWAY_ADDRESS as `0x${string}`,
      abi: GATEWAY_ABI,
      functionName: 'withdrawFunds',
    });
  };

  const balance = balanceData ? formatEther(balanceData as bigint) : '0';

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy">Payouts & Liquidity</h1>
          <p className="text-sm text-slate mt-1 italic opacity-70">Settle on-chain revenue directly to your institutional treasury.</p>
        </motion.div>
        <div className="flex gap-4">
           {!isConnected ? (
              <Button
                onClick={openConnectModal}
                className="bg-stripe-purple hover:bg-[#4434d4] text-white shadow-lg h-10 px-6 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
           ) : (
              <Badge variant="outline" className="bg-success-green/5 text-success-green border-success-green/10 px-4 py-1.5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" /> Treasury Connected
              </Badge>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-soft-blue shadow-sm bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <TrendingUp className="w-48 h-48 text-stripe-purple" />
            </div>
            <CardHeader className="pb-2 relative z-10">
               <CardTitle className="text-[10px] font-extrabold text-slate uppercase tracking-[0.2em] flex items-center justify-between">
                  Available for Settlement
                  <ShieldCheck className="w-4 h-4 text-stripe-purple" />
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-10 relative z-10">
               <div className="flex items-baseline gap-3">
                  <span className="text-[56px] font-light tracking-tighter text-deep-navy">{Number(balance).toLocaleString()}</span>
                  <span className="text-2xl font-bold text-stripe-purple uppercase tracking-widest">WIRE</span>
               </div>
               <p className="text-xs text-slate font-medium mt-4 max-w-md leading-relaxed opacity-60 italic">
                  Funds are held in the non-custodial gateway contract. Withdrawals are processed instantly on the Wirefluid network.
               </p>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-soft-blue p-8 flex items-center justify-between relative z-10">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-60">Settlement Address</p>
                  <p className="text-xs font-mono font-bold text-deep-navy">{merchant?.wallet_address || '---'}</p>
               </div>
               <Button 
                  onClick={handleWithdraw}
                  disabled={Number(balance) <= 0 || isTxPending || isConfirming}
                  className="bg-stripe-purple hover:bg-[#4434d4] text-white shadow-xl shadow-stripe-purple/30 h-12 px-10 rounded-full font-bold uppercase tracking-widest text-[10px] group"
               >
                  {isTxPending || isConfirming ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Finalizing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" /> 
                      Initiate Payout
                    </span>
                  )}
               </Button>
            </CardFooter>
         </Card>

         <div className="space-y-6">
            <Card className="border-soft-blue shadow-none bg-muted/5">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-bold text-deep-navy uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4 text-stripe-purple" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="flex justify-between items-center border-b border-soft-blue pb-4">
                      <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Gross Revenue</span>
                      <span className="text-sm font-bold text-deep-navy font-mono">{stats.grossRevenue.toLocaleString()} WIRE</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-soft-blue pb-4">
                      <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Avg Settlement</span>
                      <span className="text-sm font-bold text-deep-navy font-mono">{stats.avgSettlement}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium text-slate uppercase tracking-wider">Protocol Fee</span>
                      <span className="text-sm font-bold text-success-green font-mono">0% (LIFETIME)</span>
                   </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-white border border-soft-blue shadow-sm space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-deep-navy uppercase tracking-widest">Network Health</p>
               </div>
               <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[99.8%] bg-success-green" />
               </div>
               <p className="text-[10px] text-slate font-medium">Wirefluid TPS: <span className="text-deep-navy font-bold">142</span> / Block Time: <span className="text-deep-navy font-bold">1.2s</span></p>
            </div>
         </div>
      </div>

      {/* Payout Ledger */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
           <h3 className="text-sm font-bold text-deep-navy uppercase tracking-widest italic flex items-center gap-3">
             <History className="w-4 h-4 text-stripe-purple opacity-40" />
             Institutional Settlement Ledger
           </h3>
         </div>

         <Card className="border-soft-blue shadow-sm bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/30 border-b border-soft-blue">
                     <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Status</th>
                     <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Amount</th>
                     <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">TX Hash</th>
                     <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate text-right">Settled At</th>
                  </tr>
               </thead>
               <tbody className="text-sm text-deep-navy font-medium">
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse h-16 bg-muted/5" />)
                  ) : payouts.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                             <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-slate/20">
                                <Zap className="w-6 h-6" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm font-bold text-deep-navy uppercase tracking-widest">No Payout History</p>
                                <p className="text-[10px] text-slate font-medium opacity-60 leading-relaxed italic">
                                   Your institutional treasury ledger is currently empty. <br /> Settle your first protocol balance to see history here.
                                </p>
                             </div>
                          </div>
                       </td>
                    </tr>
                  ) : (
                    payouts.map(payout => (
                       <tr key={payout.id} className="border-b border-soft-blue last:border-0 hover:bg-muted/5 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-success-green" />
                                <Badge variant="outline" className="bg-success-green/10 text-success-green border-success-green/20 text-[9px] uppercase font-bold tracking-widest">
                                   {payout.status}
                                </Badge>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="font-mono text-sm">{payout.amount.toLocaleString()}</span>
                             <span className="text-[10px] font-bold text-stripe-purple ml-2">{payout.currency}</span>
                          </td>
                          <td className="px-8 py-5">
                             <a 
                                href={`https://wirefluidscan.com/tx/${payout.transaction_hash}`} 
                                target="_blank"
                                className="text-xs font-mono text-slate hover:text-stripe-purple flex items-center gap-2 group/link"
                             >
                                {payout.transaction_hash.slice(0, 16)}...
                                <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                             </a>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-xs text-slate">
                             {new Date(payout.created_at).toLocaleString()}
                          </td>
                       </tr>
                    ))
                  )}
               </tbody>
            </table>
         </Card>
      </div>

      <div className="p-8 rounded-3xl bg-slate-50 border border-soft-blue flex items-center justify-between group overflow-hidden relative">
          <div className="space-y-1 relative z-10">
             <p className="text-[10px] font-extrabold text-stripe-purple uppercase tracking-[0.25em]">Treasury Automation</p>
             <h4 className="text-xl font-light text-deep-navy tracking-tight">Need automated daily settlements?</h4>
             <p className="text-sm text-slate font-medium opacity-70">Scale your institutional operations with our Treasury API.</p>
          </div>
          <Button variant="outline" className="border-stripe-purple/20 text-stripe-purple font-bold text-[10px] uppercase tracking-widest h-10 px-8 rounded-full relative z-10 hover:bg-stripe-purple hover:text-white transition-all">
             Developer Docs <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-stripe-purple/5 rounded-full translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
      </div>
    </div>
  );
}

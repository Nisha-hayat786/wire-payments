'use client'

import { useState, useEffect } from 'react'
import type { Invoice } from '@/lib/schemas'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShieldCheck,
  Info,
  CheckCircle2,
  Loader2,
  Wallet,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Lock,
  Activity,
  Copy,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId, useBalance } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GATEWAY_ABI, GATEWAY_ADDRESS, wirefluidTestnet } from '@/lib/wagmi'

interface CheckoutClientProps {
  invoice: Invoice
  paymentAddress: string
}

export function CheckoutClient({ invoice, paymentAddress }: CheckoutClientProps) {
  const [status, setStatus] = useState(invoice.status)
  const [timeLeft, setTimeLeft] = useState(0)
  const [activeTab, setActiveTab] = useState<'wallet' | 'mobile'>('wallet')
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balanceData } = useBalance({ address })

  const { data: hash, writeContractAsync, isPending: isTxPending } = useWriteContract()
  const { isLoading: isWaitingForReceipt, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const isWrongNetwork = isConnected && chainId !== wirefluidTestnet.id
  const hasNoGas = isConnected && balanceData?.value === BigInt(0)

  const [isSyncing, setIsSyncing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    // Calculate time left
    const expiresAt = new Date(invoice.expires_at).getTime()
    const updateTimer = () => {
      const now = Date.now()
      const left = Math.max(0, expiresAt - now)
      setTimeLeft(left)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    // Poll for payment status
    const statusCheck = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/invoices/${invoice.id}`)
        if (response.ok) {
          const { data } = await response.json()
          if (data.status !== status) {
            setStatus(data.status)
          }
        }
      } catch (error) {
        console.error('Status check failed:', error)
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(statusCheck)
    }
  }, [invoice.id, invoice.expires_at, status])

  useEffect(() => {
    async function syncSettlement() {
      if (isConfirmed && hash && !isSyncing && !isSynced) {
        setIsSyncing(true)
        try {
          const res = await fetch('/api/v1/settlements/sync', {
            method: 'POST',
            body: JSON.stringify({ invoiceId: invoice.id, transactionHash: hash }),
            headers: { 'Content-Type': 'application/json' },
          })
          if (res.ok) {
            setIsSynced(true)
          }
        } catch (err) {
          console.error('Settlement sync error:', err)
        } finally {
          setIsSyncing(false)
        }
      }
    }
    syncSettlement()
  }, [isConfirmed, hash, invoice.id, isSynced])

  useEffect(() => {
    if (isConfirmed && isSynced && invoice.metadata?.redirect_url) {
      setRedirectCountdown(3)
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev && prev <= 1) {
            clearInterval(timer)
            window.location.href = invoice.metadata?.redirect_url as string
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isConfirmed, isSynced, invoice])

  const handlePay = async () => {
    if (!invoice || !isConnected) return

    if (isWrongNetwork) {
      try {
        await switchChain({ chainId: wirefluidTestnet.id })
        return
      } catch (err: any) {
        setError('Please switch to the WireFluid network to continue.')
        return
      }
    }

    try {
      setError(null)
      await writeContractAsync({
        address: GATEWAY_ADDRESS as `0x${string}`,
        abi: GATEWAY_ABI,
        functionName: 'payInvoice',
        args: [invoice.id as `0x${string}`, paymentAddress as `0x${string}`],
        value: parseEther(invoice.amount.toString()),
      })
    } catch (err: any) {
      console.error('Payment Error:', err)
      setError(err.shortMessage || err.message || 'Failed to initiate transaction')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddNetwork = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return
    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${wirefluidTestnet.id.toString(16)}`,
          chainName: wirefluidTestnet.name,
          nativeCurrency: wirefluidTestnet.nativeCurrency,
          rpcUrls: wirefluidTestnet.rpcUrls.default.http,
          blockExplorerUrls: [wirefluidTestnet.blockExplorers.default.url],
        }],
      })
    } catch (err) {
      console.error('Failed to add network:', err)
    }
  }

  const qrValue = `ethereum:${GATEWAY_ADDRESS}@92533/payInvoice?address=${paymentAddress}&string=${invoice.id}&value=${parseEther(invoice.amount.toString()).toString()}`

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Complete!</h1>
              <p className="text-gray-600">
                Thank you for your payment of {invoice.amount} {invoice.currency}
              </p>
            </div>
            {invoice.description && (
              <p className="text-sm text-gray-500">{invoice.description}</p>
            )}
            <div className="space-y-3 pt-4">
              <Link
                href={invoice.redirect_url || "/dashboard"}
                className="block w-full py-3 bg-stripe-purple text-white rounded-lg font-medium hover:bg-[#4434d4] transition-colors"
              >
                Back to App
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans overflow-hidden">
      {/* LEFT PANE: BRANDED SUMMARY */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col p-12 lg:p-20 text-white min-h-[50vh] lg:min-h-screen"
        style={{ backgroundColor: '#533afd' }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <header className="mb-20">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="WirePayments" className="h-10 w-auto brightness-0 invert" />
              <span className="text-sm font-black tracking-widest uppercase">WirePayments</span>
            </div>
          </header>

          <div className="space-y-10 flex-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4 leading-none text-white">Total Payable</p>
              <h1 className="text-8xl font-light tracking-tight leading-none tabular-nums text-white">
                {invoice.amount} <span className="text-2xl font-black uppercase tracking-widest align-top ml-2 opacity-100 text-white">{invoice.currency}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 max-w-sm"
            >
              <p className="text-2xl font-light leading-relaxed opacity-90">
                {invoice.description || 'Secure on-chain settlement for digital services.'}
              </p>

              <div className="pt-10 border-t border-white/20">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Invoice ID</p>
                    <p className="text-xs font-mono opacity-80 select-all truncate">{invoice.id.split('-')[0]}...</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Expires</p>
                    <p className="text-xs font-bold opacity-80">{formatTime(timeLeft)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <footer className="mt-auto pt-20 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
            <Activity className="w-3.5 h-3.5" /> Wirefluid Protocol // Secure Settlement Node
          </footer>
        </div>
      </motion.div>

      {/* RIGHT PANE: PAYMENT FORM */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative flex flex-col items-center justify-center p-12 lg:p-20 bg-white min-h-[50vh] lg:min-h-screen"
      >
        <div className="w-full max-w-[420px] space-y-12">
          <header className="flex justify-between items-center mb-8 lg:hidden">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-900">WirePayments</div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Secure
            </div>
          </header>

          <div className="space-y-8">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl border border-gray-200 mb-10">
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wallet' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Connect Wallet
              </button>
              <button
                onClick={() => setActiveTab('mobile')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Mobile App
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'wallet' ? (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {isConfirmed ? (
                    <div className="p-10 rounded-3xl bg-green-50/50 border border-green-100 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center shadow-2xl shadow-green-600/20">
                        <CheckCircle2 className="text-white w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Settlement Verified</h3>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60">Your payment has been logged on-chain.</p>
                        {redirectCountdown !== null && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em] mt-4"
                          >
                            Redirecting in {redirectCountdown}s...
                          </motion.p>
                        )}
                      </div>
                      <div className="w-full flex flex-col gap-3">
                        <Link
                          href={`https://wirefluidscan.com/tx/${hash}`}
                          target="_blank"
                          className="w-full py-4 bg-white border border-gray-200 shadow-sm rounded-2xl text-[10px] text-gray-900 font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                          View Transaction <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={invoice.redirect_url || "/dashboard"}
                          className="w-full py-4 bg-stripe-purple border border-transparent shadow-sm rounded-2xl text-[10px] text-white font-black uppercase tracking-widest hover:bg-[#4434d4] transition-all flex items-center justify-center gap-2"
                        >
                          Back to App <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-200 bg-gray-50/30">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600 mb-2">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1 mb-2">
                          <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Wallet Connection</p>
                          <p className="text-[10px] text-gray-500 font-medium opacity-60">
                            {isConnected ? `Connected to ${balanceData ? (Number(balanceData.value) / 1e18).toFixed(4) : '0.0000'} ${balanceData?.symbol || 'WIRE'}` : 'Securely sign with an Institutional Browser Wallet.'}
                          </p>
                        </div>

                        {hasNoGas && (
                          <div className="w-full p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3 mb-2">
                            <div className="p-1 rounded bg-orange-200 mt-0.5"><Info className="w-3 h-3 text-orange-700" /></div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest leading-none">Insufficient Gas</p>
                              <p className="text-[9px] text-orange-700/70 font-bold leading-tight uppercase">You need a small amount of WIRE to cover the network fee.</p>
                            </div>
                          </div>
                        )}

                        <ConnectButton
                          label="Authorize Wallet"
                          accountStatus="full"
                          chainStatus="icon"
                        />
                      </div>

                      <Button
                        onClick={isWrongNetwork ? () => switchChain({ chainId: 92533 }) : handlePay}
                        disabled={!isConnected || (isTxPending || isWaitingForReceipt) && !isWrongNetwork}
                        className="w-full h-16 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98] border-0 disabled:opacity-40 bg-indigo-600 text-white"
                      >
                        {isTxPending || isWaitingForReceipt ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> {isWaitingForReceipt ? 'Confirming...' : 'Signing...'}
                          </span>
                        ) : isWrongNetwork ? (
                          <span className="flex items-center gap-3">
                            <Activity className="w-5 h-5" /> Switch to WireFluid
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            Pay {invoice.amount} {invoice.currency} <ArrowRight className="w-5 h-5 ml-2" />
                          </span>
                        )}
                      </Button>

                      {error && (
                        <div className="w-full p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                          <div className="p-1 rounded bg-red-200 mt-0.5"><Info className="w-3 h-3 text-red-700" /></div>
                          <p className="text-[10px] text-red-700 font-medium">{error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10 flex flex-col items-center"
                >
                  <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-200 relative group">
                    <QRCodeSVG
                      value={qrValue}
                      size={200}
                      level="H"
                      includeMargin={false}
                      fgColor="#061b31"
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Node Sync</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed px-6 font-medium opacity-70">
                      Scan this QR code with any EIP-681 compatible mobile wallet to initiate an instant settlement.
                    </p>
                    <div className="pt-4 flex flex-col gap-3 px-6">
                      <Button variant="outline" onClick={handleAddNetwork} className="w-full border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl bg-white shadow-sm">
                        <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" /> Add Network to MetaMask
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-20 text-center space-y-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex justify-center items-center gap-6">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Verified Institutional Node</span>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

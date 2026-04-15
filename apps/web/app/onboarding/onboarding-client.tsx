'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type Step = 'welcome' | 'details' | 'wallet' | 'complete';

interface FormData {
  businessName: string;
  website: string;
  webhookUrl: string;
}

export function OnboardingClient() {
  const router = useRouter();
  const supabase = createClient();
  const { address, isConnected } = useAccount();

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    website: '',
    webhookUrl: '',
  });

  const steps = [
    { id: 'welcome' as Step, title: 'Welcome' },
    { id: 'details' as Step, title: 'Details' },
    { id: 'wallet' as Step, title: 'Wallet' },
    { id: 'complete' as Step, title: 'Done' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 'details':
        if (!formData.businessName.trim()) {
          setError('Business name is required');
          return false;
        }
        if (!formData.website.trim()) {
          setError('Website is required');
          return false;
        }
        return true;
      case 'wallet':
        if (!isConnected || !address) {
          setError('Please connect your wallet first');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 'wallet') {
      await createMerchant();
    } else {
      const nextIndex = steps.findIndex((s) => s.id === currentStep) + 1;
      setCurrentStep(steps[nextIndex]?.id || currentStep);
    }
  };

  const handleBack = () => {
    const prevIndex = steps.findIndex((s) => s.id === currentStep) - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
    setError(null);
  };

  const createMerchant = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!address) throw new Error('Wallet not connected');

      const apiKey = `wp_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const apiKeyHash = await hashApiKey(apiKey);

      const { data, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          owner_id: user.id,
          business_name: formData.businessName,
          business_type: 'company',
          business_email: user.email || '',
          website: formData.website,
          wallet_address: address,
          webhook_url: formData.webhookUrl || '',
          api_key_hash: apiKeyHash,
          settings: { currency: 'WIRE' },
        })
        .select()
        .single();

      if (merchantError) {
        throw merchantError;
      }

      setCurrentStep('complete');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const hashApiKey = async (apiKey: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="WirePayments" className="h-8 w-auto" />
            <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">WirePayments</span>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      idx <= currentStepIndex
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx < currentStepIndex ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-px w-12 ${idx < currentStepIndex ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {currentStep === 'welcome' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                  <Sparkles className="w-8 h-8 text-gray-700" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                  Welcome to WirePayments
                </h1>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-12">
                  Set up your account to start accepting crypto payments on the Wirefluid network.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 text-xs font-bold uppercase tracking-widest transition-transform active:scale-95 group"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'details' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Business Details
                  </h2>
                  <p className="text-gray-600">
                    Tell us a bit about your business
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => updateFormData('businessName', e.target.value)}
                      placeholder="Your Business Name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL <span className="text-gray-400 font-normal">(Optional)</span></Label>
                    <Input
                      id="webhookUrl"
                      value={formData.webhookUrl}
                      onChange={(e) => updateFormData('webhookUrl', e.target.value)}
                      placeholder="https://yourbusiness.com/webhooks"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We'll send payment events to this URL
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'wallet' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-600">
                    Connect your wallet to receive payouts
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50">
                  {!isConnected ? (
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        Connect your wallet to continue
                      </p>
                      <div className="flex justify-center">
                        <ConnectButton />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium text-gray-900">Wallet Connected</p>
                      <p className="text-sm text-gray-500 font-mono">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <div className="flex justify-center">
                        <ConnectButton />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  You're All Set!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your WirePayments account is ready.
                </p>
                <Button
                  onClick={goToDashboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 text-xs font-bold uppercase tracking-widest transition-transform active:scale-95 group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {currentStep !== 'welcome' && currentStep !== 'complete' && (
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 text-xs font-bold uppercase tracking-widest transition-transform active:scale-95 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

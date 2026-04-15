import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { OnboardingClient } from './onboarding-client';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user already has a merchant account
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (merchant) {
    redirect('/dashboard');
  }

  return <OnboardingClient />;
}

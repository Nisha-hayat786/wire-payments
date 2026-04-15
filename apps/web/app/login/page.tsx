import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { LoginClient } from './login-client';

export default async function LoginPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LoginClient />;
}

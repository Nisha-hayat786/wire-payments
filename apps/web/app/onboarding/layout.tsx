import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if merchant already exists
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  // If merchant exists, redirect to dashboard
  if (merchant) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {children}
    </div>
  )
}

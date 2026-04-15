import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClientWrapper } from './dashboard-client-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get merchant info
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  // Redirect to onboarding if no merchant exists
  if (!merchant) {
    redirect('/onboarding')
  }

  return (
    <DashboardClientWrapper merchant={merchant} user={user}>
      {children}
    </DashboardClientWrapper>
  )
}

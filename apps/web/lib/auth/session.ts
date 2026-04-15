import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getConfig } from '../config'

export async function createClient() {
  const cookieStore = await cookies()
  const config = getConfig()

  return createServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}

export interface SessionUser {
  id: string
  email: string
  merchantId: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) return null

    // Get merchant ID from user metadata
    const merchantId = session.user.user_metadata.merchant_id as string | null || null

    return {
      id: session.user.id,
      email: session.user.email!,
      merchantId,
    }
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function refreshSession(): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.refreshSession()
  if (error) {
    throw new Error('Failed to refresh session')
  }
}

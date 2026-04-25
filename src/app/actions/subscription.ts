'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface LinkedSubscription {
  id: string
  user_id: string
  stripe_session_id: string
  status: string
  plan_slug: string
  created_at: string
  updated_at: string
}

export async function linkSubscription(
  sessionId: string
): Promise<LinkedSubscription> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No-op in Server Actions
        },
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Utilisateur non authentifié')
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      user_id: user.id,
      status: 'active',
    })
    .eq('stripe_session_id', sessionId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !data) {
    throw new Error('Abonnement non trouvé ou déjà lié')
  }

  return data as unknown as LinkedSubscription
}

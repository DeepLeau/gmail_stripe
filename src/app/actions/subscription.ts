'use server'

import { createClient } from '@/lib/supabase/server'

export async function linkStripeSessionToUser(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data, error } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('link_stripe_session_to_user error:', error)
    return {
      success: false,
      error: error.message ?? 'Failed to link Stripe session',
    }
  }

  const result = data as { success?: boolean; error?: string } | null

  if (result && 'error' in result && result.error) {
    return { success: false, error: result.error as string }
  }

  return { success: true }
}

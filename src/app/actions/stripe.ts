'use server'

import { createClient } from '@/lib/supabase/server'

interface LinkResult {
  ok: boolean
  error?: string
}

export async function linkStripeSessionToUser(sessionId: string): Promise<LinkResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'not_authenticated' }
  }

  // Call RPC with p_ prefix for named parameter
  const { data, error } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('[linkStripeSessionToUser] RPC error:', error)
    return { ok: false, error: 'rpc_error' }
  }

  // RPC returns jsonb — parse result
  const result = typeof data === 'string' ? JSON.parse(data) : data

  if (result.status === 'already_linked') {
    console.log('[linkStripeSessionToUser] Session already linked — treating as success')
    return { ok: true }
  }

  if (result.status === 'not_found') {
    return { ok: false, error: 'session_not_found' }
  }

  return { ok: true }
}

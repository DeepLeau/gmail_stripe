/**
 * GET /api/subscription/usage
 *
 * Retourne le plan actif et l'usage messages du user authentifié.
 *
 * Réponse 200 : { plan, messages_used, messages_limit, reset_at, subscription_id }
 * Réponse 401 : { error: 'unauthorized' }
 * Réponse 500 : { error: 'server_error' }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentSubscription } from '@/app/actions/subscription'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const state = await getCurrentSubscription()

  if (!state) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({
    plan: state.plan,
    messages_used: state.units_used,
    messages_limit: state.units_limit,
    reset_at: state.current_period_end,
    subscription_id: null,
  })
}

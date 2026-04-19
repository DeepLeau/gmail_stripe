/**
 * GET /api/user/subscription
 *
 * Route protégée par auth.
 * Retourne le plan actif et le quota restant pour l'affichage UI.
 *
 * Returns:
 *   200: { plan, messagesLimit, messagesUsed, messagesRemaining, subscriptionStatus }
 *   401: unauthorized
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_MESSAGES_LIMITS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Lire subscription ──────────────────────────────────────────────────────
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan, subscription_status')
    .eq('user_id', user.id)
    .single()

  // ── Lire usage ────────────────────────────────────────────────────────────
  const { data: usage, error: usageError } = await supabase
    .from('message_usage')
    .select('messages_sent, messages_limit')
    .eq('user_id', user.id)
    .single()

  // ── Calculer les valeurs ─────────────────────────────────────────────────
  const plan = subscription?.plan ?? 'free'
  const subscriptionStatus = subscription?.subscription_status ?? 'none'
  const messagesLimit = usage?.messages_limit ?? PLAN_MESSAGES_LIMITS.free
  const messagesUsed = usage?.messages_sent ?? 0
  const messagesRemaining = Math.max(0, messagesLimit - messagesUsed)

  if (subError && subError.code !== 'PGRST116') {
    console.error('[subscription] Erreur lecture subscription:', subError)
  }
  if (usageError && usageError.code !== 'PGRST116') {
    console.error('[subscription] Erreur lecture usage:', usageError)
  }

  return NextResponse.json({
    plan,
    messagesLimit,
    messagesUsed,
    messagesRemaining,
    subscriptionStatus,
  })
}

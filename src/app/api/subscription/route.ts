/**
 * src/app/api/subscription/route.ts
 *
 * GET endpoint qui retourne l'état d'abonnement du user authentifié.
 * Template: _shared (utilisé par les 4 templates Stripe).
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/_shared/app/api/subscription/route.ts.template
 *
 * Réponse 200 : SubscriptionData (cf. @/lib/stripe/config).
 * Réponse 401 : { error: 'unauthorized' } si pas de user.
 * Réponse 500 : { error: 'server_error' } sur erreur DB.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[GET /api/subscription] DB error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  if (!subscription) {
    // No subscription row = Free tier
    const data: SubscriptionData = {
      plan: null,
      units_used: 0,
      units_limit: null,
      units_remaining: null,
      status: 'free',
    }
    return NextResponse.json(data)
  }

  // Adapter DB shape → SubscriptionData (UI shape).
  // SubscriptionData ajoute units_remaining (calculé) que la DB ne stocke pas.
  const data: SubscriptionData = {
    plan: subscription.plan,
    units_used: subscription.units_used,
    units_limit: subscription.units_limit,
    units_remaining: subscription.units_limit !== null
      ? Math.max(0, subscription.units_limit - subscription.units_used)
      : null,
    status: subscription.subscription_status,
  }

  return NextResponse.json(data)
}

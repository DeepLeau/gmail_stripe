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
import { getCurrentSubscription } from '@/app/actions/subscription'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const state = await getCurrentSubscription()

  if (!state) {
    // Pas de user authentifié
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Adapter SubscriptionState (DB shape) → SubscriptionData (UI shape).
  // SubscriptionData ajoute units_remaining (calculé) que la DB ne stocke pas.
  const data: SubscriptionData = {
    plan: (state.plan ?? 'free') as SubscriptionData['plan'],
    units_used: state.units_used,
    units_limit: state.units_limit,
    units_remaining: state.units_limit !== null
      ? Math.max(0, state.units_limit - state.units_used)
      : null,
    status: state.subscription_status,
    current_period_end: state.current_period_end,
  }

  return NextResponse.json(data)
}

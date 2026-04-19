import { NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/subscription
 *
 * Retourne le plan actif et le quota de l'utilisateur connecté.
 * Le quota est automatiquement réinitialisé si plus d'un mois s'est écoulé.
 *
 * Response 200 : { plan, quotaUsed, quotaLimit, quotaRenewedAt, status }
 * Response 401 : { error: 'Not authenticated' }
 */
export async function GET() {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // ── Récupérer l'abonnement actif ──────────────────────────────────
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select(
      `
      quota_used,
      quota_renewed_at,
      subscription_status,
      plan_id,
      plans (
        name,
        display_name,
        messages_per_month
      )
    `
    )
    .eq('user_id', user.id)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    console.error('[Subscription API] DB error:', subError)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }

  // ── Pas d'abonnement = plan gratuit (10 messages/mois) ────────────
  if (!subscription) {
    return NextResponse.json({
      plan: null,
      planName: null,
      planDisplayName: 'Free',
      quotaUsed: 0,
      quotaLimit: 10,
      quotaRenewedAt: new Date().toISOString(),
      status: 'inactive',
    })
  }

  // Supabase PostgREST retourne les relations imbriquées sous forme de tableau
  type PlansRow = { name: string; display_name: string; messages_per_month: number }
  const plansArray = (subscription as unknown as { plans: PlansRow[] | null })?.plans
  const planRow = plansArray && plansArray.length > 0 ? plansArray[0] : null

  const planName = planRow ? (planRow as PlansRow).name as string : null
  const planDisplayName = planRow ? (planRow as PlansRow).display_name as string : 'Free'
  const quotaLimit = planRow ? (planRow as PlansRow).messages_per_month as number : 10

  // ── Reset automatique du quota si > 1 mois ────────────────────────
  const renewedAt = new Date(subscription.quota_renewed_at)
  const now = new Date()
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000
  const shouldReset = now.getTime() - renewedAt.getTime() > oneMonthMs

  if (shouldReset && subscription.quota_used > 0) {
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        quota_used: 0,
        quota_renewed_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)
      .eq('quota_renewed_at', subscription.quota_renewed_at)

    if (!updateError) {
      return NextResponse.json({
        plan: planName,
        planName: planName,
        planDisplayName: planDisplayName,
        quotaUsed: 0,
        quotaLimit,
        quotaRenewedAt: now.toISOString(),
        status: subscription.subscription_status,
      })
    }
  }

  return NextResponse.json({
    plan: planName,
    planName: planName,
    planDisplayName: planDisplayName,
    quotaUsed: subscription.quota_used,
    quotaLimit,
    quotaRenewedAt: subscription.quota_renewed_at,
    status: subscription.subscription_status,
  })
}

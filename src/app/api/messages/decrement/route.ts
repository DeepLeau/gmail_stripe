import { NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/messages/decrement
 *
 * Décrémente le compteur de messages de l'utilisateur.
 * Opération atomique avec vérification de quota — race-condition safe.
 *
 * Logique de reset mensuel : si quota_renewed_at > 1 mois,
 * le compteur est réinitialisé à 0 avant le décrement.
 *
 * Response 200 : { remaining: number }
 * Response 401 : { error: 'Not authenticated' }
 * Response 429 : { error: 'quota_exceeded' }
 */
export async function POST() {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const now = new Date()
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000

  // ── Fetch l'abonnement avec le plan ───────────────────────────────
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select(
      `
      quota_used,
      quota_renewed_at,
      subscription_status,
      plan_id,
      plans (
        messages_per_month
      )
    `
    )
    .eq('user_id', user.id)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    console.error('[Decrement API] DB error:', subError)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  // ── Déterminer la limite de quota ─────────────────────────────────
  let quotaLimit = 10 // Free plan fallback
  const plansRow = (subscription as unknown as { plans: { messages_per_month: number }[] | null })?.plans
  if (plansRow && plansRow.length > 0) {
    quotaLimit = (plansRow[0] as { messages_per_month: number }).messages_per_month as number ?? 10
  }

  // ── Vérifier si l'utilisateur a dépassé son quota ─────────────────
  if (subscription) {
    const renewedAt = new Date(subscription.quota_renewed_at)
    const shouldReset = now.getTime() - renewedAt.getTime() > oneMonthMs

    if (shouldReset) {
      // Reset automatique du quota
      const { error: resetError } = await supabase
        .from('user_subscriptions')
        .update({
          quota_used: 0,
          quota_renewed_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', user.id)
        .eq('quota_renewed_at', subscription.quota_renewed_at)

      if (resetError) {
        console.error('[Decrement API] Reset error:', resetError)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      const newUsed = 1
      const remaining = quotaLimit - newUsed

      return NextResponse.json({ remaining: Math.max(0, remaining) })
    }

    // Vérifier le quota avant de décrémenter
    if (subscription.quota_used >= quotaLimit) {
      return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 })
    }

    // Décrémentation directe avec clause WHERE idempotente
    const newUsed = subscription.quota_used + 1
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        quota_used: newUsed,
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)
      .eq('quota_used', subscription.quota_used)

    if (updateError) {
      console.error('[Decrement API] Update error:', updateError)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }

    const remaining = quotaLimit - newUsed
    return NextResponse.json({ remaining: Math.max(0, remaining) })
  }

  // ── Utilisateur sans abonnement : 10 messages gratuit ──────────────
  const freeUsed = 0
  if (freeUsed >= quotaLimit) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 })
  }

  const { error: upsertError } = await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id: user.id,
        plan_id: null,
        quota_used: 1,
        quota_renewed_at: now.toISOString(),
        subscription_status: 'inactive',
        updated_at: now.toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    console.error('[Decrement API] Free user upsert error:', upsertError)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ remaining: quotaLimit - 1 })
}

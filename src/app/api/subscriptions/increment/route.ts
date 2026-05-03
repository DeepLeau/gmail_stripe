/**
 * src/app/api/subscriptions/increment/route.ts
 *
 * POST — Incrémente units_used de l'utilisateur authentifié après chaque message AI.
 * Retourne 429 si limite atteinte.
 * Pattern supabase-base + écriture manuelle des cookies sur NextResponse.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
        remove() {},
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: sub, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('[increment] DB error:', subError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // Cas Free : pas de compteur à incrémenter
  if (!sub || sub.subscription_status === 'free') {
    return NextResponse.json({ error: 'no_quota' }, { status: 429 })
  }

  const newUnitsUsed = sub.units_used + 1

  if (sub.units_limit !== null && newUnitsUsed > sub.units_limit) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 })
  }

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ units_used: newUnitsUsed })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[increment] update error:', updateError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  const unitsRemaining =
    sub.units_limit !== null
      ? Math.max(0, sub.units_limit - newUnitsUsed)
      : null

  const result: SubscriptionData = {
    plan: sub.plan,
    units_used: newUnitsUsed,
    units_limit: sub.units_limit,
    units_remaining: unitsRemaining,
    status: sub.subscription_status,
  }

  return NextResponse.json(result)
}

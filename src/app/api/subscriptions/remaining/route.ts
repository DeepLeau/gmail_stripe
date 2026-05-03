/**
 * src/app/api/subscriptions/remaining/route.ts
 *
 * GET — Retourne le quota courant de l'utilisateur authentifié.
 * Pattern supabase-base + écriture manuelle des cookies sur NextResponse
 * (skill Supabase SSR pour App Router route handlers).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // supabase-base : lecture seule des cookies de la requête
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // On écrit les cookies sur la NextResponse sortante plutôt que request.cookies
          // (qui est immutable en lecture seule côté handler App Router)
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
    console.error('[remaining] DB error:', subError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // Cas Free : pas de ligne ou subscription_status = 'free'
  if (!sub || sub.subscription_status === 'free') {
    const freeData: SubscriptionData = {
      plan: null,
      units_used: 0,
      units_limit: null,
      units_remaining: null,
      status: 'free',
    }
    return NextResponse.json(freeData)
  }

  const unitsRemaining =
    sub.units_limit !== null
      ? Math.max(0, sub.units_limit - sub.units_used)
      : null

  const result: SubscriptionData = {
    plan: sub.plan,
    units_used: sub.units_used,
    units_limit: sub.units_limit,
    units_remaining: unitsRemaining,
    status: sub.subscription_status,
  }

  return NextResponse.json(result)
}

/**
 * src/app/api/stripe/usage/route.ts
 *
 * Retourne le quota courant de l'user authentifié :
 * plan, limite d'unités, unités utilisées, date de renouvellement.
 *
 * Appelé par UsageMeter.tsx côté client.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Créer un client server-side qui lit le cookie de session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {
          // Les cookies seront mis par Supabase dans la réponse — non implémenté ici
          // car cette route est en lecture seule
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  // Vérifier que l'user est authentifié
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // Lire la subscription active la plus récente
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, current_period_end')
    .eq('user_id', user.id)
    .in('subscription_status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subError) {
    console.error('[Stripe usage] Failed to query user_subscriptions:', subError)
    return NextResponse.json({ error: 'database_error' }, { status: 500 })
  }

  // Si pas de subscription active, retourner un état free par défaut
  if (!subscription) {
    return NextResponse.json({
      plan: null,
      units_limit: 0,
      units_used: 0,
      current_period_end: null,
    })
  }

  return NextResponse.json({
    plan: subscription.plan,
    units_limit: subscription.units_limit,
    units_used: subscription.units_used,
    current_period_end: subscription.current_period_end,
  })
}

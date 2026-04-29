import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Créer un clientanon (pas service role) pour lire les données de l'user connecté
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  // Vérifier l'authentification via le cookie de session
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    // Non connecté — retourner les quotas free par défaut
    return NextResponse.json({
      plan: null,
      units_used: 0,
      units_limit: 0,
      units_remaining: 0,
      status: 'free',
    })
  }

  // Appeler la RPC pour récupérer les quotas de l'user
  const { data, error } = await supabase.rpc('get_user_quota', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('[quota] RPC error:', error)
    return NextResponse.json(
      { error: 'failed_to_fetch_quota' },
      { status: 500 }
    )
  }

  // Si pas de subscription active, retourner les valeurs free
  if (!data) {
    return NextResponse.json({
      plan: null,
      units_used: 0,
      units_limit: 0,
      units_remaining: 0,
      status: 'free',
    })
  }

  return NextResponse.json({
    plan: data.plan,
    units_used: data.units_used ?? 0,
    units_limit: data.units_limit ?? 0,
    units_remaining: data.units_remaining ?? 0,
    status: data.subscription_status ?? 'active',
  })
}

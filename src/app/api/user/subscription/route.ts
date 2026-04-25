import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const sessionId = new URL(request.url).searchParams.get('session_id')

  // Si un session_id est passé (flow anonyme post-paiement), on récupère par stripe_session_id
  if (sessionId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan_slug, status, messages_limit, messages_used')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (!data) {
      return NextResponse.json({ plan_slug: null, status: 'none' }, { status: 404 })
    }

    return NextResponse.json({
      plan_slug: data.plan_slug,
      status: data.status,
      messages_limit: data.messages_limit,
      messages_used: data.messages_used,
    })
  }

  // Sinon on récupère par l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('plan_slug, status, messages_limit, messages_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({
      plan_name: 'Free',
      messages_used: 0,
      messages_limit: 100,
      is_limited: false,
    })
  }

  const isLimited = data.messages_used >= data.messages_limit

  return NextResponse.json({
    plan_name: data.plan_slug,
    messages_used: data.messages_used,
    messages_limit: data.messages_limit,
    is_limited: isLimited,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body.action ?? 'increment'

  if (action === 'increment') {
    const { data } = await supabase
      .from('subscriptions')
      .select('messages_used, messages_limit')
      .eq('user_id', user.id)
      .maybeSingle()

    const messagesUsed = (data?.messages_used ?? 0) + 1
    const messagesLimit = data?.messages_limit ?? 100

    await supabase
      .from('subscriptions')
      .update({ messages_used: messagesUsed })
      .eq('user_id', user.id)

    return NextResponse.json({
      messages_used: messagesUsed,
      messages_limit: messagesLimit,
      is_limited: messagesUsed >= messagesLimit,
    })
  }

  // GET pour juste lire le compteur
  const { data } = await supabase
    .from('subscriptions')
    .select('messages_used, messages_limit')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    messages_used: data?.messages_used ?? 0,
    messages_limit: data?.messages_limit ?? 100,
    is_limited: (data?.messages_used ?? 0) >= (data?.messages_limit ?? 100),
  })
}

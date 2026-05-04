import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSessionFromCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
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

  const session = await getSessionFromCookie(supabase)
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, units_remaining, units_limit, subscription_status')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!subscription) {
    return NextResponse.json({
      plan: null,
      units_remaining: null,
      units_limit: null,
      subscription_status: 'free',
    })
  }

  return NextResponse.json(subscription)
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { count = 1 } = body as { count?: number }

  if (typeof count !== 'number' || count < 1 || count > 100) {
    return NextResponse.json({ error: 'invalid_count' }, { status: 400 })
  }

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

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  // Appeler la RPC pour décrémenter le quota
  const { data, error } = await supabase.rpc('decrement_quota', {
    p_user_id: user.id,
    p_count: count,
  })

  if (error) {
    console.error('[decrement] RPC error:', error)
    return NextResponse.json({ error: 'decrement_failed' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 402 })
  }

  return NextResponse.json({
    units_remaining: data.units_remaining ?? 0,
    units_used: data.units_used ?? 0,
  })
}

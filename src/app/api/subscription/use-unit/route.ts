import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSessionFromCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function POST() {
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

  // Atomically decrement units_used if < units_limit, return new remaining.
  // The RPC uses auth.uid() internally — no explicit user_id parameter.
  const { data, error } = await supabase.rpc('decrement_units')

  if (error) {
    // If RPC fails (no subscription row, or already at 0), return 402
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 402 })
  }

  return NextResponse.json({ units_remaining: data })
}

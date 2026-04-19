import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // ── 1. Auth via CRON_SECRET ──────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Call the database function via service_role ────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const { data, error } = await supabase.rpc('reset_monthly_quotas')

  if (error) {
    console.error('[Cron] reset_monthly_quotas failed:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const resetCount = typeof data === 'number' ? data : 0

  console.log(`[Cron] Reset quota: ${resetCount} user(s) updated`)

  return NextResponse.json({ ok: true, reset_count: resetCount })
}

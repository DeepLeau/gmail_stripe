import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // ── Auth: verify CRON_SECRET ─────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[/api/cron/reset-quota] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Reset all message_usage counters ────────────────────────────────────────
  const supabase = createServiceRoleSupabase()
  const now = new Date()
  const periodStart = now.toISOString()

  // Set period_end to the 1st of next month (UTC midnight)
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
    .toISOString()

  const { error } = await supabase
    .from('message_usage')
    .update({
      messages_sent: 0,
      period_start: periodStart,
      period_end: periodEnd,
    })
    .neq('user_id', '00000000-0000-0000-0000-000000000000') // matches all rows

  if (error) {
    console.error('[/api/cron/reset-quota] reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset quota' },
      { status: 500 }
    )
  }

  console.info('[/api/cron/reset-quota] Quota reset completed at', now.toISOString())
  return NextResponse.json({ ok: true })
}

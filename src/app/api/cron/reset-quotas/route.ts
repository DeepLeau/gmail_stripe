import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Service role client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  const now = new Date().toISOString()

  // Réinitialiser messages_used pour les abonnements actifs dont la période est terminée
  const { data, error } = await supabase
    .from('user_billing')
    .update({
      messages_used: 0,
      updated_at: now,
    })
    .eq('subscription_status', 'active')
    .lt('current_period_end', now)

  if (error) {
    console.error('[Cron] reset quotas error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  console.log('[Cron] Quotas reset at', now)
  return NextResponse.json({ ok: true, reset_at: now })
}

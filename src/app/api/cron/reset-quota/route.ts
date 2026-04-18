/**
 * GET /api/cron/reset-quota
 *
 * Vercel Cron job — runs daily at 00:00 UTC.
 * Resets messages_count to 0 for all profiles whose renewal_date has passed,
 * then advances renewal_date to the first day of the next month.
 *
 * Security: requires CRON_SECRET Bearer token (set in Vercel dashboard).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // ── 1. Auth: verify CRON_SECRET ────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[cron/reset-quota] CRON_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Compute cutoff date (start of today UTC) ─────────────────────────────
  const now = new Date()
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const nextRenewal = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const cutoffIso = cutoff.toISOString()
  const nextRenewalIso = nextRenewal.toISOString()

  // ── 3. Fetch profiles to reset ─────────────────────────────────────────────
  const supabase = await createSupabaseServer()

  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, plan, messages_count, renewal_date')
    .lt('renewal_date', cutoffIso)
    .neq('plan', 'free') // Free plan doesn't use renewal_date; skip it.

  if (fetchError) {
    console.error('[cron/reset-quota] Failed to fetch profiles:', fetchError)
    return NextResponse.json({ reset: 0, errors: [fetchError.message] })
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ reset: 0, errors: [] })
  }

  // ── 4. Batch reset ──────────────────────────────────────────────────────────
  const errors: string[] = []
  let resetCount = 0

  for (const profile of profiles) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        messages_count: 0,
        renewal_date: nextRenewalIso,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      const msg = `Failed to reset profile ${profile.id}: ${updateError.message}`
      console.error(`[cron/reset-quota] ${msg}`)
      errors.push(msg)
    } else {
      resetCount++
    }
  }

  console.log(`[cron/reset-quota] Reset ${resetCount} profile(s), ${errors.length} errors`)
  return NextResponse.json({ reset: resetCount, errors })
}

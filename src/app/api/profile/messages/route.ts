/**
 * GET  /api/profile/messages — returns current quota status
 * POST /api/profile/messages — decrements quota (by 1) and returns new count
 *
 * Auth: requires a valid Supabase session cookie.
 * Ownership: verifies the profile belongs to the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getMessagesLimit, isQuotaExceeded } from '@/lib/subscription/plans'

// ── GET ───────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan, messages_count, renewal_date')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned — profile doesn't exist yet.
    console.error('[profile/messages GET] DB error:', error)
    return NextResponse.json({ error: 'Failed to load quota' }, { status: 500 })
  }

  const plan = profile?.plan ?? 'free'
  const messagesUsed = profile?.messages_count ?? 0
  const messagesLimit = getMessagesLimit(plan)
  const renewalDate = profile?.renewal_date ?? null

  return NextResponse.json({
    plan,
    messagesUsed,
    messagesLimit,
    renewalDate: renewalDate ?? '',
  })
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. Load current profile ──────────────────────────────────────────────
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, plan, messages_count')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[profile/messages POST] DB fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 })
  }

  const plan = profile?.plan ?? 'free'
  const messagesLimit = getMessagesLimit(plan)

  // Unlimited plans — skip decrement entirely.
  if (messagesLimit === -1) {
    return NextResponse.json({
      messagesUsed: 0,
      messagesLimit,
      isLimitReached: false,
    })
  }

  const currentCount = profile?.messages_count ?? 0

  // ── 2. Atomic increment with guard ───────────────────────────────────────
  // Use Supabase RPC for true atomicity, or fall back to a fetch-then-update
  // with a fresh read inside the upsert to avoid race conditions.
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({
      messages_count: currentCount + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .eq('messages_count', currentCount) // Guard: only update if no concurrent write
    .select('messages_count')
    .single()

  if (updateError) {
    // If the guard failed (concurrent write), re-fetch and return the new state.
    if (updateError.code === 'PGRST116') {
      const { data: reloaded } = await supabase
        .from('profiles')
        .select('messages_count')
        .eq('id', user.id)
        .single()

      const messagesUsed = reloaded?.messages_count ?? currentCount + 1
      const isLimitReached = isQuotaExceeded(messagesUsed, messagesLimit)

      return NextResponse.json(
        isLimitReached
          ? { error: 'Limit reached', upgradeUrl: '/#pricing' }
          : { messagesUsed, messagesLimit, isLimitReached },
        isLimitReached ? { status: 429 } : undefined
      )
    }

    console.error('[profile/messages POST] DB update error:', updateError)
    return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 })
  }

  const messagesUsed = updatedProfile?.messages_count ?? currentCount + 1
  const isLimitReached = isQuotaExceeded(messagesUsed, messagesLimit)

  if (isLimitReached) {
    return NextResponse.json(
      { error: 'Limit reached', upgradeUrl: '/#pricing' },
      { status: 429 }
    )
  }

  return NextResponse.json({ messagesUsed, messagesLimit, isLimitReached })
}

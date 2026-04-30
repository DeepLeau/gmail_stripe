import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body as { content?: string }
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 })
  }

  // Check user subscription & quota
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan, subscription_status, units_limit, units_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub || sub.subscription_status === 'canceled' || sub.subscription_status === 'incomplete') {
    return NextResponse.json({ error: 'no_active_subscription' }, { status: 403 })
  }

  const limit = sub.units_limit ?? 0
  const used = sub.units_used ?? 0
  if (used >= limit) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 429 })
  }

  // ─── AI call placeholder ───────────────────────────────────────────────
  // TODO: replace with real AI integration (OpenAI, Anthropic, etc.)
  const aiContent = `[IA placeholder] Received: "${content.trim()}". Response logic not yet implemented.`
  // ─────────────────────────────────────────────────────────────────────

  // Decrement unit usage
  await supabase.rpc('decrement_units')

  return NextResponse.json({
    content: aiContent,
  })
}

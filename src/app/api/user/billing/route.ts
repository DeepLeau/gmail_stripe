import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_billing')
      .select('plan, messages_limit, messages_used, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[Billing] DB error:', error)
      return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }

    // Default free tier si aucune entrée
    const plan = data?.plan ?? 'free'
    const messagesLimit = data?.messages_limit ?? 10
    const messagesUsed = data?.messages_used ?? 0
    const periodEnd = data?.current_period_end ?? null

    return NextResponse.json({
      plan,
      messages_limit: messagesLimit,
      messages_used: messagesUsed,
      messages_remaining: messagesLimit - messagesUsed,
      period_end: periodEnd,
    })
  } catch (err) {
    console.error('[Billing] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data, error } = await supabase.rpc('decrement_messages', {
      p_user_id: user.id,
    })

    if (error) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('messages_limit, messages_used, plan, subscription_status')
        .eq('user_id', user.id)
        .single()

      if (!subscription || subscription.subscription_status !== 'active') {
        return NextResponse.json({
          allowed: false,
          remaining: 0,
          limit: 0,
          plan: null,
        })
      }

      const remaining = subscription.messages_limit - subscription.messages_used

      if (remaining <= 0) {
        return NextResponse.json({
          allowed: false,
          remaining: 0,
          limit: subscription.messages_limit,
          plan: subscription.plan,
        })
      }

      return NextResponse.json({
        allowed: true,
        remaining,
      })
    }

    if (data === null) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        limit: 0,
        plan: null,
      })
    }

    return NextResponse.json({
      allowed: data.allowed,
      remaining: data.remaining,
      limit: data.limit,
      plan: data.plan,
    })
  } catch (error) {
    console.error('[API] Error decrementing messages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

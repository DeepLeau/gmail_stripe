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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, messages_limit, messages_used, subscription_status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({
        plan: null,
        messagesLimit: null,
        messagesRemaining: null,
        status: 'inactive',
        periodEnd: null,
      })
    }

    const messagesRemaining = subscription.messages_limit - subscription.messages_used

    return NextResponse.json({
      plan: subscription.plan,
      messagesLimit: subscription.messages_limit,
      messagesRemaining: Math.max(0, messagesRemaining),
      status: subscription.subscription_status,
      periodEnd: subscription.current_period_end,
    })
  } catch (error) {
    console.error('[API] Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

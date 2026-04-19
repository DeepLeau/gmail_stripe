import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isValidPlan, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stripe_session_id, plan_id, user_id } = body as {
      stripe_session_id: string
      plan_id: string
      user_id?: string
    }

    if (!stripe_session_id || !plan_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!isValidPlan(plan_id)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const plan = plan_id as StripePlanName

    const supabase = await createClient()

    let targetUserId = user_id

    if (!targetUserId) {
      const customer = await stripe.customers.retrieve(customerId)

      if (customer.deleted) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      const customerEmail = customer.email

      if (customerEmail) {
        const { data: user } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single()

        if (user) {
          targetUserId = user.id
        }
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      )
    }

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: targetUserId,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        stripe_subscription_id: subscriptionId,
        plan: plan,
        messages_limit: getPlanLimit(plan),
        messages_used: 0,
        subscription_status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: null,
      }, {
        onConflict: 'user_id',
      })

    if (upsertError) {
      console.error('[API] Error upserting subscription:', upsertError)
      return NextResponse.json(
        { error: 'Failed to link subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error linking subscription:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

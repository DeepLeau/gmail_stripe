import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan_name, messages_limit, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('[Subscription API] Error fetching subscription:', subError)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }

  const { data: usage } = await supabase
    .from('monthly_usage')
    .select('messages_used')
    .eq('user_id', user.id)
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle()

  const freePlanLimit = 10

  if (!subscription) {
    return NextResponse.json({
      planName: 'Free',
      messagesUsed: usage?.messages_used ?? 0,
      messagesLimit: freePlanLimit,
    })
  }

  return NextResponse.json({
    planName: subscription.plan_name,
    messagesUsed: usage?.messages_used ?? 0,
    messagesLimit: subscription.messages_limit ?? freePlanLimit,
    status: subscription.status,
  })
}

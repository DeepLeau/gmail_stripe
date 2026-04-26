import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { pendingUserId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { pendingUserId } = body
  if (!pendingUserId) {
    return NextResponse.json({ error: 'pendingUserId is required' }, { status: 400 })
  }

  // Retrouver la ligne dans pending_checkouts via service role
  const serviceSupabase = createServiceClient()

  const { data: pending, error: pendingError } = await serviceSupabase
    .from('pending_checkouts')
    .select('*')
    .eq('checkout_session_id', pendingUserId)
    .single()

  if (pendingError || !pending) {
    return NextResponse.json({ error: 'Pending checkout not found' }, { status: 400 })
  }

  const {
    plan,
    stripe_customer_id,
    stripe_subscription_id,
    units_limit: messagesLimit,
    current_period_start,
    current_period_end,
  } = pending

  // Upsert user_subscriptions
  const { error: upsertError } = await serviceSupabase
    .from('user_subscriptions')
    .upsert({
      user_id: user.id,
      plan,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_status: 'active',
      units_limit: messagesLimit,
      units_used: 0,
      current_period_end,
    })

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  // Supprimer la ligne pending_checkouts
  await serviceSupabase
    .from('pending_checkouts')
    .delete()
    .eq('checkout_session_id', pendingUserId)

  return NextResponse.json({ success: true, plan, messagesLimit })
}

function createServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(url, serviceKey)
}

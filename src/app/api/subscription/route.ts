import { NextResponse } from 'next/server'
import { getCurrentSubscription } from '@/app/actions/subscription'

export const dynamic = 'force-dynamic'

export async function GET() {
  const state = await getCurrentSubscription()

  if (!state) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // plan peut être null (free tier sans row user_subscriptions)
  const plan: string | null = state.plan

  const data = {
    plan,
    units_used: state.units_used,
    units_limit: state.units_limit,
    units_remaining: state.units_limit > 0
      ? Math.max(0, state.units_limit - state.units_used)
      : null,
    status: state.subscription_status,
  }

  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSubscription, decrementUnits } from '@/app/actions/subscription'
import { getPlanDisplayName, type StripePlanName } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const content = body.content as string | undefined

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'invalid_content' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Check subscription via Server Action
    const subscriptionState = await getCurrentSubscription()
    if (!subscriptionState) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const unitsLimit = subscriptionState.units_limit
    const unitsUsed = subscriptionState.units_used
    const unitsRemaining =
      unitsLimit > 0 ? Math.max(0, unitsLimit - unitsUsed) : null

    if (unitsRemaining === 0) {
      const planDisplay = subscriptionState.plan
        ? getPlanDisplayName(subscriptionState.plan as StripePlanName)
        : 'Gratuit'
      return NextResponse.json(
        { error: 'limit_reached', plan: planDisplay },
        { status: 403 }
      )
    }

    // Decrement units after successful message processing
    const decrementResult = await decrementUnits()
    if (!decrementResult.success) {
      console.warn('[Chat/send] DecrementUnits failed:', decrementResult.error)
      // Don't block the message if decrement fails — log and continue
    }

    // Simulated AI response (replace with actual AI integration)
    const aiResponse = `Réponse simulée pour: "${content.trim()}"`

    return NextResponse.json({
      text: aiResponse,
      units_remaining: decrementResult.remaining ?? undefined,
    })
  } catch (err) {
    console.error('[Chat/send] Error:', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}

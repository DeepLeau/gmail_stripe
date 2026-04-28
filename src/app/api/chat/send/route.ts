import { NextRequest, NextResponse } from 'next/server'
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

    // Check remaining units via RPC
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('get_user_remaining_messages', {
        p_user_id: user.id,
      })

    if (quotaError) {
      console.error('[Chat/send] RPC error:', quotaError)
      return NextResponse.json({ error: 'quota_check_failed' }, { status: 500 })
    }

    const remaining = quotaData ?? 0
    if (remaining <= 0) {
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
    }

    // Decrement units
    const { error: decrementError } = await supabase.rpc('decrement_user_messages', {
      p_user_id: user.id,
      p_count: 1,
    })

    if (decrementError) {
      console.error('[Chat/send] Decrement error:', decrementError)
    }

    // Simulated AI response (replace with actual AI integration)
    const aiResponse = `Réponse simulée pour: "${content.trim()}"`

    // Get updated units used
    const { data: updatedQuota } = await supabase.rpc('get_user_remaining_messages', {
      p_user_id: user.id,
    })

    return NextResponse.json({
      text: aiResponse,
      units_used: updatedQuota !== null ? Math.max(0, remaining - 1) : undefined,
    })
  } catch (err) {
    console.error('[Chat/send] Error:', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}

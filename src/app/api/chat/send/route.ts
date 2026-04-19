import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectRandomResponse } from '@/lib/chat/mockApi'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body as { content: string }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'invalid_content' }, { status: 400 })
    }

    // Décrémentation atomique via RPC — protège contre les race conditions
    const { data: quotaResult, error: rpcError } = await supabase.rpc(
      'update_quota_if_allowed',
      { p_user_id: user.id }
    )

    if (rpcError) {
      console.error('[Chat/send] RPC error:', rpcError)
      return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }

    // quotaResult = -1 → quota épuisé
    if (quotaResult === -1) {
      const response = selectRandomResponse()
      return NextResponse.json({
        response,
        quota_remaining: 0,
        quota_exceeded: true,
        upgrade_url: '/#pricing',
      })
    }

    // Réponse mock (à remplacer par le vrai appel IA)
    const response = selectRandomResponse()

    return NextResponse.json({
      response,
      quota_remaining: quotaResult,
      quota_exceeded: false,
    })
  } catch (err) {
    console.error('[Chat/send] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

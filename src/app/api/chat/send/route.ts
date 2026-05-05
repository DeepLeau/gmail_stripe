import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  const body = await request.json()
  const { message } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'missing_message' }, { status: 400 })
  }

  // Récupérer l'utilisateur connecté via le cookie de session
  const authHeader = request.headers.get('authorization')
  let userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (!authError && user) {
      userId = user.id
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Vérifier le quota via RPC
  const { data: quotaData, error: quotaError } = await supabase.rpc('check_and_decrement_quota', {
    p_user_id: userId,
  })

  if (quotaError) {
    console.error('[chat/send] check_and_decrement_quota error:', quotaError)
    return NextResponse.json({ error: 'quota_check_failed' }, { status: 500 })
  }

  if (quotaData === false) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  const remaining = typeof quotaData === 'number' ? quotaData : null

  // Appel au service LLM (à remplacer par votre implémentation réelle)
  let reply: string
  try {
    const llmRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/llm/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId }),
    })
    const llmData = await llmRes.json()
    reply = llmData.reply ?? llmData.content ?? llmData.message ?? ''
  } catch (err) {
    console.error('[chat/send] LLM call failed:', err)
    reply = "Une erreur est survenue lors de la génération de la réponse."
  }

  return NextResponse.json({ reply, remaining })
}

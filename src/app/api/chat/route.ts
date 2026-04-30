import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

async function getSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function POST(request: NextRequest) {
  const user = await getSession(request)
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: { content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { content } = body
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 })
  }

  // Client Supabase pour les opérations DB (service role pour le RPC)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get: () => undefined, set: () => {}, remove: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  const { data: subData } = await supabaseAdmin
    .from('user_subscriptions')
    .select('units_limit, units_used')
    .eq('user_id', user.id)
    .maybeSingle()

  const limit = subData?.units_limit ?? null
  const used = subData?.units_used ?? 0

  if (limit !== null && used >= limit) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  // --- Proxy vers le provider IA ---
  let aiText = ''
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Tu réponds à des questions en langage naturel. Réponds de manière concise et utile.',
            },
            { role: 'user', content: content.trim() },
          ],
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(15_000),
      })

      if (aiRes.ok) {
        const aiData = await aiRes.json()
        aiText = aiData.choices?.[0]?.message?.content ?? ''
      } else {
        console.error('[chat] OpenAI returned', aiRes.status)
        aiText = 'Désolé, une erreur est survenue lors de la génération de la réponse.'
      }
    } else {
      // Mode dev sans clé API
      aiText = `[Mode développement] Tu as demandé : "${content.trim().slice(0, 50)}..." — configure OPENAI_API_KEY pour une vraie réponse IA.`
    }
  } catch (err: unknown) {
    console.error('[chat] AI call failed:', err)
    return NextResponse.json({ error: 'ai_unavailable' }, { status: 502 })
  }

  // Incrémenter le compteur de messages (appel RPC) — erreurs non critiques
  const rpcResult = await supabaseAdmin.rpc('decrement_units')
  if (rpcResult.error) {
    console.error('[chat] decrement_units failed:', rpcResult.error)
  }

  // Retourner la réponse + compteur mis à jour
  const newUsed = used + 1
  return NextResponse.json({
    text: aiText,
    units_used: limit !== null ? newUsed : undefined,
    units_limit: limit,
  })
}

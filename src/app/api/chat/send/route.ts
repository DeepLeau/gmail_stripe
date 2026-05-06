/**
 * src/app/api/chat/send/route.ts
 *
 * Route handler POST /api/chat/send
 *
 * Contrats API :
 *   200 { text: string, model: string }
 *   400 { error: "invalid_request" }
 *   401 { error: "unauthorized" }
 *   429 { error: "rate_limited" }
 *   500 { error: "ai_error" }
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGroq } from '@/lib/chat/groq'
import { readHistory, appendMessages } from '@/lib/chat/history'
import type { HistoryMessage } from '@/lib/chat/history'

// ─── Validation du body ─────────────────────────────────────────────────────

interface RequestBody {
  content?: string
}

function parseBody(req: NextRequest): RequestBody | null {
  try {
    return req.json() as RequestBody
  } catch {
    return null
  }
}

// ─── GET user (auth) ─────────────────────────────────────────────────────────

async function getUser() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  } catch {
    return null
  }
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  const body = parseBody(request)
  if (!body || !body.content || typeof body.content !== 'string') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const userContent = body.content.trim()
  if (!userContent) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // 3. Lire l'historique depuis le cookie signé
  const history: HistoryMessage[] = await readHistory()

  // 4. Préparer les messages pour Groq
  const groqMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  groqMessages.push({ role: 'user', content: userContent })

  // 5. Appel Groq
  let groqResult: Awaited<ReturnType<typeof callGroq>>
  try {
    groqResult = await callGroq(groqMessages)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    if (message === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }

    console.error('[Chat] Groq error:', message)
    return NextResponse.json({ error: 'ai_error' }, { status: 500 })
  }

  // 6. Sauvegarder l'échange dans le cookie
  try {
    await appendMessages(
      { role: 'user', content: userContent },
      { role: 'assistant', content: groqResult.text }
    )
  } catch {
    // Non critique — le message a été répondu, le cookie peut être réinitialisé au prochain échange.
    console.warn('[Chat] Failed to persist history to cookie')
  }

  // 7. Réponse
  return NextResponse.json(
    {
      text: groqResult.text,
      model: groqResult.model,
    },
    { status: 200 }
  )
}

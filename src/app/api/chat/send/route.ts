import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── Model config ──────────────────────────────────────────────────────────────
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4.6'

// ─── Body shape ───────────────────────────────────────────────────────────────
interface RequestBody {
  content?: unknown
  history?: unknown
}

// ─── Validation helpers ───────────────────────────────────────────────────────
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isValidHistoryItem(v: unknown): v is { role: string; content: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    'role' in v &&
    typeof (v as { role: unknown }).role === 'string' &&
    ['user', 'assistant'].includes((v as { role: string }).role) &&
    'content' in v &&
    typeof (v as { content: unknown }).content === 'string'
  )
}

function validateBody(body: RequestBody): { ok: true; content: string; history: Array<{ role: 'user' | 'assistant'; content: string }> } | { ok: false; error: string; status: number } {
  if (!isNonEmptyString(body.content)) {
    return { ok: false, error: 'content is required and must be a non-empty string', status: 400 }
  }

  if (!Array.isArray(body.history)) {
    return { ok: false, error: 'history must be an array', status: 400 }
  }

  for (const item of body.history) {
    if (!isValidHistoryItem(item)) {
      return {
        ok: false,
        error: 'history must be an array of {role: "user"|"assistant", content: string}',
        status: 400,
      }
    }
  }

  return {
    ok: true,
    content: body.content.trim(),
    history: body.history as Array<{ role: 'user' | 'assistant'; content: string }>,
  }
}

// ─── Build OpenRouter messages array ────────────────────────────────────────
function buildOpenRouterMessages(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentContent: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return [
    ...history.map(({ role, content }) => ({ role, content })),
    { role: 'user' as const, content: currentContent },
  ]
}

// ─── Route handler ───────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // 1. Parse body
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 2. Validate body
  const validation = validateBody(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status })
  }

  const { content, history } = validation

  // 3. Authenticate user
  let userId: string
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = user.id
  } catch (err) {
    console.error('[chat/send] Supabase auth error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }

  // 4. Check units quota
  try {
    const supabase = await createClient()
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('units_limit, units_used')
      .eq('user_id', userId)
      .maybeSingle()

    if (subError) {
      console.error('[chat/send] DB error fetching subscription:', subError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // If subscription row exists, enforce quota
    if (subscription) {
      const { units_limit, units_used } = subscription
      if (units_used >= units_limit) {
        return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
      }
    }
    // No subscription row → treat as free/unlimited → no quota enforcement
  } catch (err) {
    console.error('[chat/send] Quota check error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  // 5. Build messages and call OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('[chat/send] OPENROUTER_API_KEY is not set')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const messages = buildOpenRouterMessages(history, content)

  let responseData: unknown
  try {
    const upstream = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
      }),
    })

    responseData = await upstream.json()

    if (!upstream.ok) {
      const errorMessage =
        (responseData as { error?: { message?: string } })?.error?.message ??
        `OpenRouter error ${upstream.status}`
      console.error('[chat/send] OpenRouter error:', upstream.status, errorMessage)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const parsed = responseData as {
      choices?: Array<{ message?: { content?: string } }>
      model?: string
    }

    const text = parsed?.choices?.[0]?.message?.content
    if (typeof text !== 'string') {
      console.error('[chat/send] Unexpected OpenRouter response shape:', parsed)
      return NextResponse.json({ error: 'Invalid response from AI provider' }, { status: 500 })
    }

    // 5b. Decrement units — non-blocking; log errors but never block the 200 response
    try {
      const supabase = await createClient()
      const { error: rpcError } = await supabase.rpc('decrement_units')
      if (rpcError) {
        // Log but do not block — a reconciliation job can catch missed decrements
        console.error('[chat/send] Decrement RPC error:', rpcError)
      }
    } catch (decrementErr) {
      console.error('[chat/send] Decrement RPC error:', decrementErr)
    }

    return NextResponse.json({
      text,
      model: OPENROUTER_MODEL,
    })
  } catch (err) {
    console.error('[chat/send] Network error calling OpenRouter:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * OpenRouter client — helper centralisé pour tous les appels LLM.
 * Suit les règles du skill intégration OpenRouter (§R1-R13).
 *
 * Chemin canonique : src/lib/openrouter/client.ts
 * Toutes les routes API qui appellent un LLM passent par ce helper.
 */
type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'developer'; content: string }

type CallOptions = {
  model?: string
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  tools?: unknown[]
  fallbackModels?: string[]
  responseFormat?: { type: 'json_object' }
}

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6'

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY missing — configure it in .env')
  return key
}

export async function callOpenRouter(opts: CallOptions): Promise<{
  content: string
  toolCalls?: unknown[]
  usage?: unknown
  model: string
}> {
  const body: Record<string, unknown> = {
    model: opts.model || DEFAULT_MODEL,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 2000,
    temperature: opts.temperature ?? 0.7,
  }

  if (opts.tools) body.tools = opts.tools
  if (opts.responseFormat) body.response_format = opts.responseFormat
  if (opts.fallbackModels && opts.fallbackModels.length > 0) {
    // Cascade fallback — OpenRouter essaie le premier, puis les suivants
    body.models = [opts.model || DEFAULT_MODEL, ...opts.fallbackModels]
    delete body.model
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Emind',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let errorMessage = `OpenRouter error ${res.status}`
    try {
      const err = await res.json()
      errorMessage = err.error?.message || err.error?.code || errorMessage
    } catch {
      // body non-JSON, on garde le message par défaut
    }

    // Erreur quota OpenRouter (402) → propager comme 403 limit_reached
    if (res.status === 402 || res.status === 429) {
      const err = new Error(`quota_exceeded`) as Error & { code?: string }
      err.code = 'limit_reached'
      throw err
    }

    throw new Error(errorMessage)
  }

  const data = await res.json()
  const choice = data.choices?.[0]

  return {
    content: choice?.message?.content || '',
    toolCalls: choice?.message?.tool_calls,
    usage: data.usage,
    model: data.model || (opts.model || DEFAULT_MODEL),
  }
}

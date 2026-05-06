/**
 * src/lib/chat/groq.ts
 *
 * Client d'appel Groq API — Llamastack via API directe.
 * Conforme au skill OpenRouter : fetch natif, pas de SDK, clé serveur uniquement.
 *
 * MODÈLE UTILISÉ : llama-3.3-70b-versatile (rapide, coût réduit)
 * PROMPT SYSTÈME : "assistant email IA en français"
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── Prompt système canonique ──────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es Emind, un assistant IA con+u pour aider les utilisateurs \u00e0 explorer et comprendre leurs emails.

Ton r\u00f4le :
- R\u00e9pondre de mani\u00e8re pr\u00e9cise et concise aux questions sur les emails de l'utilisateur.
- Fournir des r\u00e9sum\u00e9s, extraire des informations, et r\u00e9pondre \u00e0 des questions contextuelles.
- Toujours r\u00e9pondre en fran\u00e7ais, de mani\u00e8re claire et professionnelle.
- Si tu n'as pas assez d'informations pour r\u00e9pondre, dis-le explicitement.
- Ne jamais inventer des d\u00e9tails ou des dates.

Format des r\u00e9ponses :
- R\u00e9ponses courtes et directes (2-4 phrases max en g\u00e9n\u00e9ral).
- Pour les informations importantes, structure ta r\u00e9ponse clairement.
- N'utilise pas de listes \u00e0 puces pour des r\u00e9ponses simples.
- Pour les comparaisons ou listings, utilise des listes markdown simples.

Limites :
- Tu n'as pas acc\u00e8s aux emails en temps r\u00e9el \u2014 r\u00e9ponds en fonction du contexte de la conversation.
- Si une question est floue, demande des pr\u00e9cisions.` as const

// ─── Client Groq ───────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY
  if (!key) {
    throw new Error(
      '[Groq] GROQ_API_KEY is not set. ' +
      'Add GROQ_API_KEY to your .env file. ' +
      'Get your key at https://console.groq.com/keys'
    )
  }
  return key
}

export interface GroqResponse {
  text: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface GroqResponseChoice {
  message?: {
    content?: string
  }
}

export interface GroqUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface GroqApiResponse {
  choices?: GroqResponseChoice[]
  usage?: GroqUsage
}

export async function callGroq(
  messages: Array<{ role: string; content: string }>
): Promise<GroqResponse> {
  const apiKey = getApiKey()

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 800,
    temperature: 0.7,
  }

  let res: Response
  try {
    res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error(`[Groq] Network error: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (!res.ok) {
    const status = res.status
    let errorDetail = ''
    try {
      const errBody = await res.json().catch(() => null)
      errorDetail = errBody?.error?.message ?? (await res.text()).slice(0, 200)
    } catch {
      errorDetail = await res.text().catch(() => '').then(t => t.slice(0, 200))
    }

    if (status === 401) {
      throw new Error('[Groq] Invalid or missing API key — check GROQ_API_KEY')
    }
    if (status === 429) {
      throw new Error('rate_limited')
    }
    if (status >= 500) {
      throw new Error(`[Groq] Server error ${status}: ${errorDetail}`)
    }
    throw new Error(`[Groq] Request failed ${status}: ${errorDetail}`)
  }

  let data: GroqApiResponse
  try {
    data = await res.json()
  } catch {
    throw new Error('[Groq] Failed to parse response')
  }

  const text = data.choices?.[0]?.message?.content ?? ''
  if (!text) {
    throw new Error('[Groq] Empty response from model')
  }

  return {
    text,
    model: MODEL,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens ?? 0,
          completionTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
        }
      : undefined,
  }
}

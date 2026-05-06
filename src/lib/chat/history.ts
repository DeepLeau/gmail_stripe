/**
 * src/lib/chat/history.ts
 *
 * Gestion du cookie HTTP-only de conversation.
 * Utilise HMAC-SHA256 natif (Web Crypto API) pour signer le cookie.
 * Pas de dépendance externe — compatible avec tous les runtimes Node.js.
 *
 * Le cookie stocke l'historique des messages (role + content) sous forme JSON.
 * Sécurisé contre la falsification grâce à la signature HMAC-SHA256.
 */

import { cookies } from 'next/headers'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const COOKIE_NAME = 'emind_chat'
const MAX_MESSAGES = 40 // 20 échanges max (10 user + 10 assistant)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 jours en secondes

// ─── Clé de signature ───────────────────────────────────────────────────────

function getSigningKey(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. ' +
      'Add SESSION_SECRET (min 32 chars) to your .env file. ' +
      'Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  return secret
}

// ─── Signature HMAC-SHA256 ───────────────────────────────────────────────────

async function sign(data: string, key: string): Promise<string> {
  const keyBuf = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key.padEnd(32, '\0').slice(0, 32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', keyBuf, new TextEncoder().encode(data))
  return Buffer.from(sig).toString('base64url')
}

async function verify(data: string, signature: string, key: string): Promise<boolean> {
  const expected = await sign(data, key)
  if (signature.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

// ─── Lecture ─────────────────────────────────────────────────────────────────

/**
 * Lit l'historique de conversation depuis le cookie signé.
 * Retourne un tableau vide si aucun cookie ou cookie invalide/tampered.
 */
export async function readHistory(): Promise<HistoryMessage[]> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(COOKIE_NAME)?.value
    if (!raw) return []

    // Format: base64url(data) + '.' + base64url(signature)
    const lastDot = raw.lastIndexOf('.')
    if (lastDot === -1) return []

    const dataB64 = raw.slice(0, lastDot)
    const sigB64 = raw.slice(lastDot + 1)

    // Vérifier la signature
    const signingKey = getSigningKey()
    const isValid = await verify(dataB64, sigB64, signingKey)
    if (!isValid) return []

    // Decoder base64url
    const data = Buffer.from(dataB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (m): m is HistoryMessage =>
        typeof m === 'object' &&
        m !== null &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
  } catch {
    // Cookie corrompu ou secret manquant → partir de zéro
    return []
  }
}

// ─── Écriture ───────────────────────────────────────────────────────────────

/**
 * Ajoute un message au cookie et sauvegarde.
 * Si l'historique dépasse MAX_MESSAGES, les messages les plus anciens sont supprimés.
 */
export async function appendMessages(
  userMessage: HistoryMessage,
  assistantMessage: HistoryMessage
): Promise<void> {
  const cookieStore = await cookies()

  // Lire l'historique existant
  const history = await readHistory()
  history.push(userMessage, assistantMessage)

  // Tronquer si trop long
  const trimmed: HistoryMessage[] = history.slice(-MAX_MESSAGES)

  // Serialiser et signer
  const payload = JSON.stringify(trimmed)
  const signingKey = getSigningKey()
  const dataB64 = Buffer.from(payload).toString('base64url')
  const signature = await sign(dataB64, signingKey)

  // Stocker cookie HTTP-only — objet littéral, TypeScript infère les types
  const isSecure = process.env.NODE_ENV === 'production'
  cookieStore.set(COOKIE_NAME, `${dataB64}.${signature}`, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

// ─── Réinitialisation ────────────────────────────────────────────────────────

/**
 * Efface l'historique (logout ou reset).
 */
export async function clearHistory(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

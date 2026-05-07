/**
 * Client singleton Resend.
 * Initialisé lazy pour éviter un crash au build si la clé n'est pas encore settée.
 * Pattern : appelé uniquement côté serveur (Route Handler / Server Action / webhook).
 */
import { Resend } from 'resend'

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set. ' +
        'Add RESEND_API_KEY to your .env.local (dev) or Vercel Environment Variables (prod). ' +
        'See https://resend.com/api-keys'
    )
  }
  return new Resend(apiKey)
}

// Lazy singleton — ne s'instancie qu'au premier appel, pas au build time
let _client: Resend | undefined

export function getResend(): Resend {
  if (!_client) {
    _client = createResendClient()
  }
  return _client
}

/**
 * Adresse d'expéditeur.
 * En dev (pas de domaine vérifié) → onboarding@resend.dev fonctionne
 * pour envoyer à l'owner du compte Resend uniquement.
 * En prod → doit correspondre à un domaine vérifié dans Resend Dashboard → Domains.
 */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

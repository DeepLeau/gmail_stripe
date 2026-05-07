/**
 * src/lib/resend.ts
 *
 * Client Resend centralisé — singleton server-side.
 * Jamais importé depuis un Client Component.
 */
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. ' +
      'Please set it in your .env.local or Vercel environment variables.'
  )
}

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Email d'expéditeur canonique du projet.
 * En dev sans domaine vérifié, Resend utilise onboarding@resend.dev automatiquement
 * si le from ne correspond pas à un domaine vérifié.
 */
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

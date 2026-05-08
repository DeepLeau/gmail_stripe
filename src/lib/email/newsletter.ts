/**
 * src/lib/email/newsletter.ts
 *
 * Envoi de newsletter en masse via Resend Batch API.
 * Chunking par batches de 100 (limite hard Resend) avec idempotence stable
 * pour éviter les doublons en cas de retry.
 *
 * Appelé UNIQUEMENT depuis un Route Handler côté serveur — jamais depuis un Client Component.
 */

import { createHash } from 'crypto'

import { getResend, FROM_EMAIL } from '@/lib/email/resend'

const BATCH_SIZE = 100

export interface NewsletterResult {
  sent: number
  failed: number
  total: number
  errors: string[]
}

/**
 * Échappe les caractères dangereux pour insertion safe dans du HTML.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Construit le corps HTML de la newsletter.
 * Styles inline pour compatibilité maximale (Gmail, Outlook, Apple Mail).
 * Inclut un lien de désinscription (CAN-SPAM / GDPR).
 */
export function buildNewsletterHtml(subject: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="max-width:600px;background-color:#ffffff;border-radius:8px;
                       border:1px solid #e5e7eb;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background-color:#ffffff;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#111827;letter-spacing:-0.02em;line-height:1.3;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#e5e7eb;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <div style="font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${content}</div>
            </td>
          </tr>
          <!-- Bottom divider -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="height:1px;background-color:#e5e7eb;"></div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                Tu reçois cet email parce que tu es inscrit sur EMMIND.<br>
                <a href="https://emmind.ai/unsubscribe" style="color:#9ca3af;">Se désinscrire</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Calcule une idempotency key stable pour un envoi newsletter.
 * Stable = même admin, même sujet, même jour → même clé.
 * Résiste aux retries réseau (le même envoi génère la même clé).
 */
export function computeIdempotencyKey(
  adminId: string,
  subject: string,
  chunkIndex: number
): string {
  const contentHash = createHash('sha256')
    .update(subject)
    .digest('hex')
    .slice(0, 12)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `newsletter-${adminId}-${today}-${contentHash}-chunk-${chunkIndex}`
}

/**
 * Envoie une newsletter à une liste de destinataires via Resend Batch API.
 *
 * - Chunking automatique par batches de 100 (limite hard Resend)
 * - Idempotency key stable par chunk (évite les doublons en retry)
 * - Continue les autres chunks même si l'un échoue (graceful degradation)
 *
 * @param recipients         Liste des emails (déjà filtrés sur email_confirmed_at)
 * @param subject            Objet de la newsletter
 * @param htmlContent        Corps HTML (généré par buildNewsletterHtml)
 * @param idempotencyKeyBase Clé de base pour dériver les clés par chunk
 */
export async function sendNewsletterBatch(
  recipients: string[],
  subject: string,
  htmlContent: string,
  idempotencyKeyBase: string
): Promise<NewsletterResult> {
  if (recipients.length === 0) {
    return { sent: 0, failed: 0, total: 0, errors: [] }
  }

  const resend = getResend()
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE)
    const chunkIndex = Math.floor(i / BATCH_SIZE)
    const chunkKey = `${idempotencyKeyBase}-chunk-${chunkIndex}`

    // Chaque email du batch contient from/to/subject/html — from est DANS chaque item.
    // batch.send() attend CreateBatchEmailOptions[] au 1er argument.
    const payloads = chunk.map(email => ({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html: htmlContent,
    }))

    // FIX: payloads est déjà CreateBatchEmailOptions[] — on le passe directement,
    // pas dans un array wrapper supplémentaire.
    const { data, error } = await resend.batch.send(payloads, {
      idempotencyKey: chunkKey,
    })

    if (error) {
      console.error('[newsletter] batch chunk failed', {
        chunkIndex,
        recipientsCount: chunk.length,
        error: error.message,
      })
      failed += chunk.length
      errors.push(`Chunk ${chunkIndex} : ${error.message}`)
      // Ne pas abort — continuer les chunks suivants
      continue
    }

    // data est CreateBatchSuccessResponse<{idempotencyKey}> — l'array des emails créés
    // est dans data.data (deuxième niveau de la réponse).
    const successIds: string[] = (data?.data ?? []).map(e => e.id)
    sent += successIds.length
    failed += chunk.length - successIds.length
  }

  return {
    sent,
    failed,
    total: recipients.length,
    errors,
  }
}

/**
 * src/lib/email/newsletter.ts
 *
 * Envoi de newsletters en masse via Resend Batch API.
 *
 * Architecture :
 * - sendNewsletterBatch()    → envoie à une liste d'emails via Resend batch (lots de 100)
 * - buildNewsletterHtml()     → template HTML responsive avec styles inline
 * - SendNewsletterResult      → type de retour pour le caller
 *
 * Résilient : chaque lot est traité indépendamment (un lot qui échoue ne bloque pas les suivants).
 * Idempotent : si le même lot est ré-envoyé avec la même idempotencyKey, Resend retourne
 * le résultat cache sans renvoyer les emails.
 */

import { getResend, FROM_EMAIL } from './resend'

/** Limite hard de la Resend Batch API — ne pas dépasser. */
const BATCH_SIZE = 100

export interface SendNewsletterResult {
  sent: number
  errors: number
  errorMessages: string[]
  batchIds: string[]
}

/**
 * Construit le corps HTML de la newsletter.
 *
 * Design : template email responsive multi-clients (Gmail, Outlook, Apple Mail).
 * Styles inline ONLY — les clients email ne supportent pas les classes CSS externes.
 * Palette issue des tokens CSS de l'app (--accent #6366f1, --text #111827).
 *
 * Inclut OBLIGATOIREMENT un lien de désinscription (CAN-SPAM / RGPD).
 */
export function buildNewsletterHtml(
  subject: string,
  content: string,
  unsubscribeUrl = 'https://emmind.ai/unsubscribe'
): string {
  const escapedSubject = escapeHtml(subject)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapedSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="max-width:600px;background-color:#ffffff;border-radius:12px;
                       border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background-color:#ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <!-- Logo mark -->
                  <td style="width:36px;padding-right:12px;">
                    <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;text-align:center;line-height:36px;">
                      <span style="color:#ffffff;font-size:18px;font-weight:700;">E</span>
                    </div>
                  </td>
                  <!-- App name -->
                  <td>
                    <span style="font-size:16px;font-weight:600;color:#111827;letter-spacing:-0.02em;">Emmind</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:600;color:#111827;letter-spacing:-0.02em;line-height:1.3;">
                ${escapedSubject}
              </h1>
              <div style="font-size:15px;color:#4b5563;line-height:1.7;">
                ${content}
              </div>
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
                Tu reçois cet email car tu es inscrit sur Emmind.<br>
                <a href="${unsubscribeUrl}" style="color:#9ca3af;">Se désinscrire</a>
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
 * Échappe les caractères dangereux pour les inserer en toute sécurité dans du HTML.
 * Empêche le XSS et le breaking du template.
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
 * Envoie une newsletter à une liste de destinataires via Resend Batch API.
 *
 * Comportement :
 * - Découpe automatiquement la liste en lots de 100 (limite hard Resend).
 * - Chaque lot est envoyé avec une idempotencyKey unique dérivée de l'index du lot.
 * - Un lot qui échoue ne bloque pas les suivants (accumulation des erreurs).
 * - Retourne le décompte sent/errors et les messages d'erreur pour diagnostic.
 *
 * @param recipients       — liste des adresses email destination (déjà filtrées, non nulle)
 * @param subject          — objet de l'email
 * @param htmlContent      — corps HTML (généré via buildNewsletterHtml)
 * @param idempotencyBase  — clé de base pour l'idempotence (admin_id|date|hash contenu)
 */
export async function sendNewsletterBatch(
  recipients: string[],
  subject: string,
  htmlContent: string,
  idempotencyBase: string
): Promise<SendNewsletterResult> {
  const resend = getResend()

  let sent = 0
  let errors = 0
  const errorMessages: string[] = []
  const batchIds: string[] = []

  // Chunker en lots de 100 (limite hard Resend Batch API)
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE)
    const chunkIndex = Math.floor(i / BATCH_SIZE)

    // idempotencyKey stable par lot — derive de la base + index
    // Résiste aux retries : un retry du même lot = même clé = Resend cache le résultat
    const idempotencyKey = `${idempotencyBase}-chunk-${chunkIndex}`

    // Préparer les payloads — un objet par destinataire
    const payloads = chunk.map((email) => ({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html: htmlContent,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (resend.batch as any).send(payloads, {
      idempotencyKey,
    })

    if (error) {
      // Erreur au niveau du lot — compte tous les emails du lot comme échoués
      console.error(`[resend] batch chunk ${chunkIndex} failed`, {
        chunkStart: i,
        chunkSize: chunk.length,
        error: error.message,
      })
      errors += chunk.length
      errorMessages.push(
        `Lot ${chunkIndex + 1} (emails ${i + 1}–${i + chunk.length}) : ${error.message}`
      )
      continue
    }

    // Succès — data est BatchItem[] (résolu par le cast any ci-dessus)
    // Pour éviter le cast brut, on type explicitement
    type ResendBatchItem = { id?: string | null }
    const batchData = (data as ResendBatchItem[]) ?? []

    const successIds = batchData
      .map((e: ResendBatchItem) => e.id)
      .filter(Boolean) as string[]
    const successCount = successIds.length
    const failedCount = chunk.length - successCount

    sent += successCount
    errors += failedCount

    if (successIds.length > 0) {
      batchIds.push(successIds[0])
    }

    // Si certains emails du lot ont échoué individuellement (rare avec batch)
    const failedEmails = batchData
      .map((e: ResendBatchItem, idx: number) => (!e.id ? chunk[idx] : null))
      .filter(Boolean) as string[]

    for (const failedEmail of failedEmails) {
      errorMessages.push(`Email invalide ou rejeté : ${failedEmail}`)
    }

    console.log(`[resend] batch chunk ${chunkIndex} sent ${successCount}/${chunk.length}`)
  }

  return { sent, errors, errorMessages, batchIds }
}

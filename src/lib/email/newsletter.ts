/**
 * Envoi de newsletters broadcast via Resend Batch API.
 *
 * Design : template HTML responsive avec styles inline (pas de Tailwind — les clients
 * email ne le supportent pas). Palette issue des tokens CSS de l'app
 * (globals.css : --accent #3b82f6, --text #111827, --border #e5e7eb).
 *
 * Appel : appelé uniquement depuis /api/admin/newsletter/send (Route Handler serveur).
 * La fonction sendNewsletterBatch utilise resend.batch.send() pour envoyer
 * un email identique à tous les destinataires en une seule requête HTTP.
 */

import { getResend, FROM_EMAIL } from './resend'

export const APP_NAME = 'Emmind'
const LOGO_TEXT = 'E'
const CHAT_URL = 'https://emmind.ai/chat'
const UNSUBSCRIBE_URL = 'https://emmind.ai/unsubscribe'

/**
 * Construit le corps HTML d'une newsletter.
 * Styles inline pour compatibilité maximale (Gmail, Outlook, Apple Mail).
 *
 * @param subject  - sujet de la newsletter (pour le title tag)
 * @param content  - contenu HTML de la newsletter (fourni par l'admin)
 */
export function buildNewsletterHtml(
  subject: string,
  content: string
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
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
                    <div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;text-align:center;line-height:36px;">
                      <span style="color:#ffffff;font-size:18px;font-weight:700;">${LOGO_TEXT}</span>
                    </div>
                  </td>
                  <!-- App name -->
                  <td>
                    <span style="font-size:16px;font-weight:600;color:#111827;letter-spacing:-0.02em;">${APP_NAME}</span>
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
              ${content}
            </td>
          </tr>

          <!-- Divider before footer -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="height:1px;background-color:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.6;">
                Vous recevez cet email parce que vous êtes inscrit à la newsletter ${APP_NAME}.<br>
                ${APP_NAME} · Paris, France
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                <a href="${UNSUBSCRIBE_URL}" style="color:#9ca3af;text-decoration:underline;">Se désabonner</a>
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
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export interface SendNewsletterBatchResult {
  sent: number
  failed: number
  errors: string[]
  /** ID du batch Resend (pour polling de statut) */
  batchId?: string
}

/**
 * Envoie une newsletter à une liste de destinataires via la Batch API Resend.
 *
 * La Batch API envoie un email personnalisé par destinataire (from/to/subject/html)
 * en une seule requête HTTP — plus efficace et résilient qu'une boucle de send()
 * pour les grandes listes (évite le timeout serverless).
 *
 * Chaque email est identique en contenu (subject + html). La Batch API charge
 * la même template pour tous les recipients, ce qui est optimal pour une newsletter.
 *
 * @param recipients - liste d'emails destinataires
 * @param subject    - objet de la newsletter
 * @param htmlContent - contenu HTML déjà généré par buildNewsletterHtml()
 * @returns { sent, failed, errors, batchId }
 *
 * @throwsrien - les erreurs sont loguées en console et retournées dans le résultat.
 *               La fonction ne throw jamais pour ne pas bloquer le caller.
 */
export async function sendNewsletterBatch(
  recipients: string[],
  subject: string,
  htmlContent: string
): Promise<SendNewsletterBatchResult> {
  if (recipients.length === 0) {
    return { sent: 0, failed: 0, errors: [] }
  }

  const resend = getResend()

  // Construire le payload pour resend.batch.send()
  // Chaque email est un objet { from, to, subject, html }
  // La Batch API accepte jusqu'à 100 emails par requête
  const emailPayloads = recipients.map((email) => ({
    from: FROM_EMAIL,
    to: [email],
    subject,
    html: htmlContent,
  }))

  type BatchEmailResult = { id: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (resend.batch as any).send(emailPayloads, {
    idempotencyKey: `newsletter-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }) as { data?: BatchEmailResult[] | null; error?: { message: string; name: string } }

  const error = response?.error
  if (error) {
    // Erreur fatale sur le batch entier — aucune email n'a été envoyée
    console.error('[resend] batch send failed', {
      recipientCount: recipients.length,
      subject,
      error: error.message,
      code: error.name,
    })
    return {
      sent: 0,
      failed: recipients.length,
      errors: [`Batch send failed: ${error.message}`],
    }
  }

  // Parser le résultat pour extraire sent/failed
  // La Batch API retourne { data: Array<{ id: string }> } en succès.
  // Si certaines emails échouent individuellement, le champ `data` contient
  // seulement les succès — on comptabilise le reste comme failed.
  const sentIds: string[] = (response?.data ?? [])
    .map((e: BatchEmailResult) => e.id)
    .filter((id: string) => Boolean(id))
  const sent = sentIds.length
  const failed = recipients.length - sent

  const errors: string[] = []
  if (failed > 0) {
    errors.push(
      `${failed} email(s) non envoyé(s) sur ${recipients.length}. ` +
        `Vérifiez le dashboard Resend pour les détails (batch ID: ${sentIds[0] ?? 'N/A'}).`
    )
  }

  return {
    sent,
    failed,
    errors,
    batchId: sentIds[0] ?? undefined,
  }
}

/**
 * Envoi d'un email de bienvenue transactionnel via Resend.
 *
 * Design : template HTML responsive avec styles inline (pas de Tailwind — les clients
 * email ne le supportent pas). Palette issue des tokens CSS de l'app
 * (globals.css : --accent #3b82f6, --text #111827, --border #e5e7eb).
 *
 * Appel : fire-and-forget depuis le signup. Ne bloque jamais le redirect user.
 */

import { getResend, FROM_EMAIL } from './resend'

export interface SendWelcomeEmailOptions {
  to: string
  firstName?: string
}

const APP_NAME = 'Emmind'
const CHAT_URL = 'https://emmind.ai/chat'
const LOGO_TEXT = 'E'

/**
 * Construit le corps HTML de l'email de bienvenue.
 * Styles inline pour compatibilité maximale (Gmail, Outlook, Apple Mail).
 */
function buildWelcomeHtml(firstName?: string): string {
  const greeting = firstName
    ? `Bienvenue, ${escapeHtml(firstName)} !`
    : 'Bienvenue !'

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bienvenue sur ${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="max-width:560px;background-color:#ffffff;border-radius:12px;
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
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#111827;letter-spacing:-0.02em;line-height:1.3;">
                ${greeting}
              </h1>
              <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">
                Merci pour votre inscription${firstName ? `, ${escapeHtml(firstName)}` : ''}. Vous pouvez maintenant accéder à votre espace et commencer à explorer les capacités de l'application.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
                Si vous avez la moindre question, n'hésitez pas à nous contacter — nous sommes là pour vous accompagner.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);">
                    <a href="${CHAT_URL}"
                       target="_blank"
                       rel="noopener noreferrer"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:500;color:#ffffff;
                              text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
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
                Vous recevez cet email parce que vous avez créé un compte sur ${APP_NAME}.<br>
                ${APP_NAME} · Paris, France
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

export interface SendWelcomeEmailResult {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Envoie un email de bienvenue à un nouvel utilisateur.
 * Appel normal : fire-and-forget depuis le signup (ne bloque pas le redirect).
 *
 * @throwsrien - les erreurs sont loguées en console et never throw pour ne pas
 *               bloquer le caller. C'est un email transactionnel non-critique.
 */
export async function sendWelcomeEmail({
  to,
  firstName,
}: SendWelcomeEmailOptions): Promise<SendWelcomeEmailResult> {
  const resend = getResend()
  const subject = firstName
    ? `Bienvenue sur ${APP_NAME}, ${firstName} !`
    : `Bienvenue sur ${APP_NAME} !`

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject,
    html: buildWelcomeHtml(firstName),
  })

  if (error) {
    // Log serveur pour debugging — l'échec email ne doit jamais crasher le signup
    console.error('[resend] sendWelcomeEmail failed', {
      to,
      firstName: firstName ?? '(not provided)',
      error: error.message,
      code: error.name,
    })
    return { success: false, error: error.message }
  }

  return { success: true, emailId: data?.id }
}

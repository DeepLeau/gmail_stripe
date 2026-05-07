/**
 * src/components/email/WelcomeEmail.tsx
 *
 * Template React Email pour l'email de bienvenue Emind.
 * Styles inline (pas de Tailwind) — compatible Outlook, Gmail, Apple Mail.
 * Composant pur côté serveur, pas de hooks ni 'use client'.
 */

import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Section,
} from '@react-email/components'

interface WelcomeEmailProps {
  email: string
  firstName?: string
}

/** URL de destination du CTA — adapter selon l'environnement */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://emind.fr'

/** Email expéditeur — doit correspondre à un domaine vérifié dans Resend Dashboard */
const FROM_LABEL = 'Emind'

export function WelcomeEmail({ email, firstName }: WelcomeEmailProps) {
  const greeting = firstName
    ? `Bienvenue ${firstName} !`
    : 'Bienvenue sur Emind !'

  const previewText = firstName
    ? `${greeting} Ton compte est prêt.`
    : 'Ton compte Emind est prêt.'

  return (
    <Html>
      <Preview>{previewText}</Preview>

      <Body
        style={{
          backgroundColor: '#f6f9fc',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Wrapper centré */}
        <Section style={{ backgroundColor: '#f6f9fc', padding: '40px 0' }}>
          <Container
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '40px',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <Section style={{ marginBottom: '32px', textAlign: 'center' }}>
              {/* Logo / nom de l'app */}
              <Text
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.02em',
                  margin: '0 0 4px 0',
                }}
              >
                Emind
              </Text>

              {/* Badge "Compte créé" */}
              <Text
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '100px',
                  padding: '3px 10px',
                  margin: '0',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Compte créé
              </Text>
            </Section>

            {/* ── Salutation ─────────────────────────────────────────── */}
            <Heading
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                letterSpacing: '-0.02em',
                lineHeight: '1.3',
                margin: '0 0 16px 0',
                textAlign: 'center',
              }}
            >
              {greeting}
            </Heading>

            {/* ── Présentation ───────────────────────────────────────── */}
            <Text
              style={{
                fontSize: '15px',
                color: '#4b5563',
                lineHeight: '1.7',
                margin: '0 0 28px 0',
                textAlign: 'center',
              }}
            >
              Ton compte est actif. Tu peux dès maintenant accéder à Emind et
              commencer à organiser tes idées, piloter tes projets et garder le
              contrôle sur ce qui compte.
            </Text>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Button
                href={APP_URL}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '-0.01em',
                  borderRadius: '8px',
                  padding: '12px 28px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Accéder à Emind
              </Button>
            </Section>

            {/* ── Divider ────────────────────────────────────────────── */}
            <Hr
              style={{
                borderColor: '#f3f4f6',
                margin: '0 0 24px 0',
              }}
            />

            {/* ── Footer minimaliste ────────────────────────────────── */}
            <Section style={{ textAlign: 'center' }}>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  margin: '0 0 4px 0',
                }}
              >
                Tu reçois cet email car tu viens de créer un compte sur Emind.
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: '0',
                }}
              >
                © {new Date().getFullYear()} Emind ·{' '}
                <a
                  href={`${APP_URL}/settings`}
                  style={{ color: '#3b82f6', textDecoration: 'underline' }}
                >
                  Gérer mes notifications
                </a>
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

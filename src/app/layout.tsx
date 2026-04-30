import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionProvider } from '@/components/providers/SubscriptionProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Emind — Pose tes questions à tes emails',
  description:
    'Emind connecte ta boîte mail à une IA qui lit, comprend et mémorise tes emails. Pose une question en langage naturel, obtiens une réponse précise.',
  keywords: ['email', 'IA', 'assistant email', 'productivité', 'Gmail', 'Outlook'],
  openGraph: {
    title: 'Emind — Pose tes questions à tes emails',
    description: 'Tes emails savent tout. Maintenant tu peux leur parler.',
    type: 'website',
  },
}

interface SubscriptionInfo {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

async function getSubscriptionData(): Promise<SubscriptionInfo | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, units_used, units_limit, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (!sub) return null

    const units_limit = sub.units_limit as number | null
    const units_remaining =
      units_limit !== null ? Math.max(0, units_limit - sub.units_used) : null

    return {
      plan: sub.plan,
      units_used: sub.units_used,
      units_limit,
      units_remaining,
      status: sub.subscription_status,
    }
  } catch {
    return null
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const subscription = await getSubscriptionData()

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <svg className="noise-filter" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glass-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feBlend
                in="SourceGraphic"
                mode="overlay"
                result="blend"
              />
              <feComposite in="blend" in2="SourceGraphic" operator="in" />
            </filter>
          </defs>
        </svg>
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      >
        <SubscriptionProvider subscription={subscription}>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  )
}

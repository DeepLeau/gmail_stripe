import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/ui/UserMenu'
import { Navbar } from '@/components/ui/Navbar'

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
    description:
      'Tes emails savent tout. Maintenant tu peux leur parler.',
    type: 'website',
  },
}

async function getUserSubscription() {
  let remaining = 0
  let plan = 'free'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('messages_limit, messages_used, plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        remaining = Math.max(0, subscription.messages_limit - subscription.messages_used)
        plan = subscription.plan ?? 'free'
      }
    }
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
  }

  return { remaining, plan }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { remaining, plan } = await getUserSubscription()

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
        {/* SVG noise filter */}
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
      <body className="antialiased" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MessageMind | Choose your plan. Chat away.',
  description:
    'MessageMind vous donne le quota de messages qu\'il vous faut — facturé mensuellement, upgradable à tout moment, résiliable quand vous voulez.',
  keywords: ['messages', 'chat', 'IA', 'email', 'SaaS', 'subscription'],
  openGraph: {
    title: 'MessageMind | Choose your plan. Chat away.',
    description:
      'Le service de chat intelligent avec les quotas adaptés à votre usage.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className="font-body bg-canvas text-graphite-900 antialiased selection:bg-amber selection:text-white relative overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}

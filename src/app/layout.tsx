import type { Metadata } from 'next'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Emind — L\'IA au service de vos conversations',
  description:
    'Conversez intelligemment. Analysez vos échanges email en langage naturel. Gagnez du temps avec Emind.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}

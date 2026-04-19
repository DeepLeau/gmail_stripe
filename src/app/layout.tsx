import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Emind — L'IA qui répond à vos emails",
  description: "Posez une question à vos emails. Emind explore vos conversations et vous propose une réponse en quelques secondes.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased selection:bg-white/10 selection:text-white text-white bg-[#0a0a0b] min-h-screen">
        {children}
        <Script
          src="https://code.iconify.design/3/3.1.0/iconify.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

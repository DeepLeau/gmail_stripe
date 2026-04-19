'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setSubscribing(false)
    setSubscribed(true)
  }

  return (
    <footer
      className="pt-20 pb-10 px-container relative overflow-hidden border-t"
      style={{
        backgroundColor: 'var(--graphite-900)',
        color: 'var(--canvas)',
        borderColor: 'rgba(246,244,240,0.1)',
      }}
    >
      {/* Watermark */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none mt-10"
        style={{
          fontFamily: 'var(--font-display)',
          opacity: 0.02,
          fontSize: '20vw',
          letterSpacing: '-0.05em',
          fontWeight: 300,
        }}
      >
        MessageMind
      </div>

      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto relative z-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Links Col 1 — Plateforme */}
          <div className="flex flex-col gap-3">
            <span
              className="font-mono text-xs uppercase tracking-widest mb-2 block"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,244,240,0.5)' }}
            >
              Plateforme
            </span>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Fonctionnalités
            </a>
            <a href="#pricing" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Tarifs
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              API
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Changelog
            </a>
          </div>

          {/* Links Col 2 — Compagnie */}
          <div className="flex flex-col gap-3">
            <span
              className="font-mono text-xs uppercase tracking-widest mb-2 block"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,244,240,0.5)' }}
            >
              Compagnie
            </span>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              À propos
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Blog
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Carrières
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Contact
            </a>
          </div>

          {/* Links Col 3 — Légal */}
          <div className="flex flex-col gap-3">
            <span
              className="font-mono text-xs uppercase tracking-widest mb-2 block"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,244,240,0.5)' }}
            >
              Légal
            </span>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Confidentialité
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              CGU
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Cookies
            </a>
            <a href="#" className="font-mono text-xs hover:text-[var(--accent)] transition-colors w-fit" style={{ fontFamily: 'var(--font-mono)' }}>
              Sécurité
            </a>
          </div>

          {/* Links Col 4 — Newsletter / Social */}
          <div className="flex flex-col gap-4">
            <span
              className="font-mono text-xs uppercase tracking-widest block"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,244,240,0.5)' }}
            >
              Actualités
            </span>
            <p
              className="font-body text-xs leading-relaxed"
              style={{ color: 'rgba(246,244,240,0.7)' }}
            >
              Recevez nos mises à jour produit et conseils pour mieux communiquer par message.
            </p>
            <form onSubmit={handleSubscribe} className="flex mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VOTRE EMAIL"
                disabled={subscribing || subscribed}
                className="flex-1 bg-transparent border border-surface/20 border-r-0 px-3 py-2 font-mono text-xs focus:outline-none focus:border-[var(--accent)] rounded-none transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--canvas)',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(246,244,240,0.2)',
                }}
              />
              <button
                type="submit"
                disabled={subscribing || subscribed}
                className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)',
                  color: 'var(--graphite-900)',
                  border: 'none',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                }}
              >
                {subscribing ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : subscribed ? (
                  <span>✓</span>
                ) : (
                  <>
                    <ArrowRight size={12} />
                  </>
                )}
              </button>
            </form>
            {subscribed && (
              <p className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                Merci ! Vous êtes inscrit.
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                aria-label="Twitter"
                className="transition-colors hover:text-[var(--accent)]"
                style={{ color: 'rgba(246,244,240,0.5)' }}
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="transition-colors hover:text-[var(--accent)]"
                style={{ color: 'rgba(246,244,240,0.5)' }}
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center border-t pt-8 gap-4"
          style={{ borderColor: 'rgba(246,244,240,0.1)' }}
        >
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,244,240,0.5)' }}
          >
            © 2025 MessageMind. Tous droits réservés.
          </span>
          <a
            href="#pricing"
            className="font-mono text-xs hover:text-[var(--canvas)] transition-colors uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
          >
            Choisir un plan →
          </a>
        </div>
      </div>
    </footer>
  )
}

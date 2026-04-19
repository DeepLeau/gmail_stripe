'use client'

import { useEffect, useRef } from 'react'

export function DemoCta() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-up').forEach((el) => {
              el.classList.add('is-visible')
            })
            const ctaScan = entry.target.querySelector('#cta-scan')
            if (ctaScan) {
              ;(ctaScan as HTMLElement).style.transform = 'scaleX(1)'
            }
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="demo"
      className="py-section px-container relative bg-canvas observe-section flex justify-center"
      ref={sectionRef}
    >
      <div
        className="max-w-2xl w-full relative border border-graphite-900 p-8 md:p-12 reveal-up bg-surface"
        id="cta-scan-wrapper"
      >
        {/* Scan line */}
        <div
          id="cta-scan"
          className="absolute top-0 left-0 w-full h-[2px] bg-amber origin-left scale-x-0 transition-transform duration-1000 delay-300 ease-swiss"
          style={{ transformOrigin: 'left' }}
        />

        <div className="text-center mb-10">
          <h2 className="font-display font-light text-3xl md:text-4xl tracking-tight text-graphite-900 mb-4">
            Testez avant de vous engager.
          </h2>
          <p className="font-body text-graphite-500 text-sm leading-relaxed max-w-md mx-auto">
            14 jours gratuits. Pas de carte bancaire requise pour commencer.
            Votre premier message est à vous.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            // Redirect to signup
            window.location.href = '/signup'
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="VOTRE NOM"
              className="w-full bg-canvas border border-graphite-900/20 px-4 py-3 font-mono text-xs text-graphite-900 placeholder:text-graphite-500/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber rounded-none transition-colors"
            />
            <input
              type="email"
              placeholder="EMAIL PROFESSIONNEL"
              className="w-full bg-canvas border border-graphite-900/20 px-4 py-3 font-mono text-xs text-graphite-900 placeholder:text-graphite-500/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber rounded-none transition-colors"
            />
          </div>

          <div className="relative">
            <select className="w-full bg-canvas border border-graphite-900/20 px-4 py-3 font-mono text-xs text-graphite-900 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber rounded-none transition-colors appearance-none cursor-pointer">
              <option value="" disabled selected>
                TAILLE D&apos;ÉQUIPE
              </option>
              <option value="solo">1 personne</option>
              <option value="small">2–5 personnes</option>
              <option value="medium">6–20 personnes</option>
              <option value="large">20+ personnes</option>
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-graphite-500 pointer-events-none"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>

          <div className="relative">
            <select className="w-full bg-canvas border border-graphite-900/20 px-4 py-3 font-mono text-xs text-graphite-900 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber rounded-none transition-colors appearance-none cursor-pointer">
              <option value="" disabled selected>
                CAS D&apos;USAGE
              </option>
              <option value="sales">Équipe commerciale</option>
              <option value="support">Support client</option>
              <option value="internal">Communication interne</option>
              <option value="prospecting">Prospection & lead</option>
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-graphite-500 pointer-events-none"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>

          <button
            type="submit"
            className="relative w-full inline-flex items-center justify-center py-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-graphite-900 bg-gradient-to-b from-amber to-amberDark shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_20px_rgba(232,160,32,0.2)] rounded-none group hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_32px_rgba(232,160,32,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden mt-4"
          >
            <span className="relative z-10 flex items-center gap-2">
              Démarrer mon essai gratuit
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-swiss" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            {[
              'Connexion Stripe sécurisée',
              'Vos données protégées',
              'Sans engagement',
            ].map((item, i) => (
              <span
                key={i}
                className="font-mono text-xs text-graphite-500 uppercase tracking-widest flex items-center gap-1"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-amber shrink-0"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </form>
      </div>
    </section>
  )
}

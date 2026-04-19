'use client'

import { useEffect, useRef } from 'react'

interface Partner {
  initials: string
  name: string
  category: string
}

const partners: Partner[] = [
  { initials: 'ST', name: 'Stripe', category: 'Paiement' },
  { initials: 'SB', name: 'Supabase', category: 'Auth / DB' },
  { initials: 'SL', name: 'Slack', category: 'Notifications' },
  { initials: 'NT', name: 'Notion', category: 'Export' },
  { initials: 'HB', name: 'HubSpot', category: 'CRM' },
  { initials: 'IC', name: 'Intercom', category: 'Support' },
  { initials: 'ZP', name: 'Zapier', category: 'Automation' },
  { initials: 'GG', name: 'Google', category: 'Workspace' },
]

export function Integrations() {
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
            // Stagger logo items
            entry.target.querySelectorAll('.logo-item').forEach((el) => {
              ;(el as HTMLElement).style.opacity = '1'
              ;(el as HTMLElement).style.transform = 'translateY(0)'
            })
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
      id="integrations"
      className="py-section px-container relative bg-canvas observe-section"
      ref={sectionRef}
    >
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/10" />
      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto text-center reveal-up">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-4">
          [05] ÉCOSYSTÈME
        </span>
        <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight text-graphite-900 mb-6 mx-auto">
          Connecté à vos outils.
        </h2>
        <p className="font-body text-graphite-500 max-w-[50ch] mx-auto leading-relaxed text-sm md:text-base mb-16">
          Stripe pour les paiements, Supabase pour l&apos;authentification, et des extensions à venir —
          Zapier, Notion, HubSpot. Une intégration, zero maintenance.
        </p>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 max-w-4xl mx-auto">
          {partners.map((partner, i) => (
            <div
              key={partner.name}
              className="logo-item flex flex-col items-center justify-center opacity-0 transform translate-y-4 transition-all duration-500 group cursor-pointer"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="w-20 h-20 bg-surface border border-graphite-900/10 shadow-sm group-hover:shadow-[0_8px_24px_rgba(14,15,17,0.06)] group-hover:border-amber/40 transition-all duration-300 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="font-display font-semibold text-2xl tracking-tighter text-graphite-900 group-hover:scale-105 transition-transform duration-300 relative z-10">
                  {partner.initials}
                </span>
              </div>
              <span className="font-display font-medium text-sm text-graphite-900 mb-1">
                {partner.name}
              </span>
              <span className="font-mono text-xs text-graphite-500 uppercase tracking-widest border border-graphite-900/10 bg-surface px-2 py-0.5">
                {partner.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

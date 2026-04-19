'use client'

import { useEffect, useRef } from 'react'

interface Testimonial {
  initials: string
  name: string
  role: string
  company: string
  quote: string
  stars: number
}

const testimonials: Testimonial[] = [
  {
    initials: 'ML',
    name: 'Marie Lefort',
    role: 'Responsable client',
    company: 'Nexum Group',
    quote:
      "On répond désormais à chaque lead sous 2h. MessageMind a changé la façon dont on gère notre boîte de réception. C'est devenu un vrai levier de croissance.",
    stars: 5,
  },
  {
    initials: 'TD',
    name: 'Thomas Durand',
    role: 'Fondateur',
    company: 'Scaleup.io',
    quote:
      "Le setup a pris 3 minutes chrono. On a souscrit au plan Scale, créé le compte, et le premier message était parti. L'expérience est fluide du début à la fin.",
    stars: 5,
  },
  {
    initials: 'SC',
    name: 'Sophie Chen',
    role: 'Head of Sales',
    company: 'Vectara AI',
    quote:
      "Avant, on ratait 40 % des opportunities en raison de messages restés sans réponse. Aujourd'hui, MessageMind nous alerte sur chaque thread en attente. On ne lâche plus rien.",
    stars: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill={i < count ? '#E8A020' : 'none'}
          stroke={i < count ? '#E8A020' : '#5C5F66'}
          strokeWidth="1.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
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
    <section className="py-section px-container relative bg-canvas observe-section" ref={sectionRef}>
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/10" />
      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto">
        <div className="text-center mb-16 reveal-up">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-4">
            [07] TÉMOIGNAGES
          </span>
          <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight text-graphite-900 mb-6 mx-auto">
            Ils ne reviennent plus en arrière.
          </h2>
          <p className="font-body text-graphite-500 max-w-[50ch] mx-auto leading-relaxed text-sm md:text-base">
            Des équipes commerciales, du support client et des startups qui ont fait de MessageMind
            leur outil de communication quotidien.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-up">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-surface border border-graphite-900/10 p-card hover:shadow-[0_8px_32px_rgba(14,15,17,0.06)] transition-all duration-400 flex flex-col"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Stars */}
              <StarRating count={t.stars} />

              {/* Quote */}
              <blockquote className="font-body text-sm text-graphite-500 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-graphite-900/10 pt-4">
                <div className="w-9 h-9 bg-graphite-900 text-canvas flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-medium text-sm text-graphite-900">{t.name}</p>
                  <p className="font-mono text-xs text-graphite-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

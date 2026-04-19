'use client'

import { useEffect, useRef } from 'react'

interface ProblemCard {
  title: string
  description: string
  stat: string
}

const problemCards: ProblemCard[] = [
  {
    title: 'Réponses en retard.',
    description:
      '67 % des messagesходят sans réponse sous 24h. L\'équipe découvre les demandes en retard, pas à temps.',
    stat: '67%',
  },
  {
    title: 'Threads impossibles à suivre.',
    description:
      'En moyenne 3 fils de conversation ouverts pour le même sujet. Impossible de savoir où répondre.',
    stat: '3',
  },
  {
    title: 'Oportunités non exploitées.',
    description:
      'Un lead qui ne reçoit pas de réponse sous 48h a 80 % de chances de partir chez un concurrent.',
    stat: '80%',
  },
]

export function Problem() {
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
            const scanLines = entry.target.querySelectorAll('.scan-line')
            scanLines.forEach((el) => el.classList.add('is-visible'))
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
      id="problem"
      className="py-section px-container relative bg-canvas observe-section"
      ref={sectionRef}
    >
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/10" />
      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        {/* Left Col (5) Sticky */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 reveal-up">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-8">
            [02] LA RÉALITÉ
          </span>
          <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight text-graphite-900 mb-6 text-balance">
            Combien de conversations tombent dans l&apos;oubli ?
          </h2>
          <p className="font-body text-graphite-500 max-w-[42ch] leading-relaxed text-sm md:text-base">
            Chaque message non répondu est une opportunité manquée. L&apos;équipe passe son temps à chercher
            l&apos;information au lieu de dialoguer avec ses interlocuteurs. Ce n&apos;est pas un problème
            de ressources — c&apos;est un problème de visibilité.
          </p>
        </div>

        {/* Right Col (7) Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4 mt-8 lg:mt-0">
          {problemCards.map((card, i) => (
            <div
              key={i}
              className="bg-surface border border-graphite-900/10 p-card relative group hover:shadow-[0_8px_32px_rgba(14,15,17,0.06)] transition-all duration-400 reveal-up"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-graphite-900 mb-4">
                {card.title}
              </h3>
              <p className="font-body text-sm text-graphite-500 leading-relaxed max-w-[50ch]">
                <span className="font-mono text-amber text-sm mr-1">{card.stat}</span>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
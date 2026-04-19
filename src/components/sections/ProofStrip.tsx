'use client'

import { useEffect, useRef } from 'react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

interface StatItem {
  value: number
  decimals: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { value: 48, decimals: 0, suffix: 'k+', label: 'messages traités ce mois.' },
  { value: 1240, decimals: 0, suffix: '+', label: 'équipes actives sur MessageMind.' },
  { value: 97, decimals: 0, suffix: '%', label: 'de satisfaction client.' },
  { value: 99.9, decimals: 1, suffix: '%', label: 'de disponibilité. Pas de l\'à peu près.' },
]

export function ProofStrip() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.counter-value').forEach((el) => {
              if (!el.hasAttribute('data-animated')) {
                const target = parseFloat(el.getAttribute('data-target') || '0')
                const decimals = parseInt(el.getAttribute('data-decimals') || '0')
                el.setAttribute('data-animated', 'true')
                el.textContent = target.toLocaleString(undefined, {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })
              }
            })

            const reveals = entry.target.querySelectorAll('.reveal-up')
            reveals.forEach((el) => el.classList.add('is-visible'))

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
      className="bg-surface w-full relative border-y border-graphite-900/10 observe-section"
      ref={sectionRef}
    >
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/20" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-graphite-900/10 w-full">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-8 lg:p-12 flex flex-col justify-center group reveal-up"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <span className="font-mono text-3xl md:text-4xl font-medium text-graphite-900 mb-2 group-hover:text-amber group-hover:-translate-y-1 transition-all duration-300 tabular-nums">
              <AnimatedCounter
                target={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
              />
            </span>
            <span className="font-body text-xs text-graphite-500 uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

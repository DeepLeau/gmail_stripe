'use client'

import { useEffect, useRef } from 'react'

export function ProductFeature() {
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
            entry.target.querySelectorAll('.scan-line').forEach((el) => {
              el.classList.add('is-visible')
            })
            // Bar chart animations
            entry.target.querySelectorAll('[data-animate-width]').forEach((bar) => {
              ;(bar as HTMLElement).style.transform = 'scaleX(1)'
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
      id="product"
      className="bg-graphite-900 text-surface py-section relative overflow-hidden observe-section"
      ref={sectionRef}
    >
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-surface/20" />

      {/* Marquee Background */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap opacity-[0.03] font-mono text-[12vw] font-bold text-amber pointer-events-none uppercase tracking-tight select-none"
        aria-hidden="true"
      >
        CONVERSATIONS ANALYSÉES // INSIGHTS DÉTECTÉS // MESSAGES PRIORISÉS //
      </div>

      <div className="max-w-[96vw] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left Col Copy */}
        <div className="lg:col-span-4 lg:col-start-2 reveal-up">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-8">
            [03] VISIBILITÉ EN TEMPS RÉEL
          </span>
          <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight mb-6 text-balance">
            Chaque message.<br />Chaque insight.<br />
            <span className="text-amber">En temps réel.</span>
          </h2>
          <p className="font-body text-graphite-500 max-w-[42ch] leading-relaxed text-sm md:text-base mb-10">
            Chaque conversation. Chaque insight détecté. Chaque message en attente. En direct — pas un
            rapport que vous générez en fin de journée.
          </p>
          <a
            href="#demo"
            className="relative inline-flex items-center justify-center px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-graphite-900 bg-gradient-to-b from-surface to-canvas shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_20px_rgba(255,255,255,0.1)] rounded-none group hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_32px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Démarrer maintenant
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-amber translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-swiss" />
          </a>
        </div>

        {/* Right Col Dashboard */}
        <div className="lg:col-span-7 reveal-up" style={{ transitionDelay: '200ms' }}>
          <div className="bg-graphite-800 border border-surface/10 rounded-none overflow-hidden shadow-2xl">
            {/* Metric Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-surface/10 border-b border-surface/10 bg-graphite-900">
              <div className="p-4 group">
                <span className="block font-mono text-xs text-graphite-500 uppercase tracking-widest mb-2">
                  Messages
                </span>
                <span className="font-mono text-sm sm:text-base text-surface group-hover:text-amber transition-colors">
                  284
                </span>
              </div>
              <div className="p-4 group">
                <span className="block font-mono text-xs text-graphite-500 uppercase tracking-widest mb-2">
                  Insights
                </span>
                <span className="font-mono text-sm sm:text-base text-surface group-hover:text-amber transition-colors">
                  14
                </span>
              </div>
              <div className="p-4 group">
                <span className="block font-mono text-xs text-graphite-500 uppercase tracking-widest mb-2">
                  En attente
                </span>
                <span className="font-mono text-sm sm:text-base text-amber group-hover:text-surface transition-colors">
                  7
                </span>
              </div>
              <div className="p-4 group">
                <span className="block font-mono text-xs text-graphite-500 uppercase tracking-widest mb-2">
                  Score moyen
                </span>
                <span className="font-mono text-sm sm:text-base text-[#10B981] group-hover:text-surface transition-colors">
                  82/100
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-6 md:p-8">
              <div className="space-y-4 max-w-2xl">
                {/* Bar 1 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-surface">Conversations urgentes</span>
                    <span className="text-graphite-500">84/100</span>
                  </div>
                  <div className="h-2 bg-graphite-900 w-full overflow-hidden">
                    <div
                      className="h-full bg-amber origin-left scale-x-0 transition-transform duration-1000 delay-300 ease-swiss"
                      style={{ width: '84%' }}
                      data-animate-width=""
                    />
                  </div>
                </div>
                {/* Bar 2 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-surface">Leads détectés</span>
                    <span className="text-graphite-500">62/100</span>
                  </div>
                  <div className="h-2 bg-graphite-900 w-full overflow-hidden">
                    <div
                      className="h-full bg-amber origin-left scale-x-0 transition-transform duration-1000 delay-400 ease-swiss"
                      style={{ width: '62%' }}
                      data-animate-width=""
                    />
                  </div>
                </div>
                {/* Bar 3 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-surface">Réactivité moyenne</span>
                    <span className="text-graphite-500">45/100</span>
                  </div>
                  <div className="h-2 bg-graphite-900 w-full overflow-hidden">
                    <div
                      className="h-full bg-amber origin-left scale-x-0 transition-transform duration-1000 delay-500 ease-swiss"
                      style={{ width: '45%' }}
                      data-animate-width=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

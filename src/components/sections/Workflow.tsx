'use client'

import { useEffect, useRef } from 'react'

interface Step {
  label: string
  rule: string
  icon: React.ReactNode
}

const steps: Step[] = [
  {
    label: '1. Plan choisi',
    rule: 'Stripe Checkout sécurisé',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    label: '2. Compte créé',
    rule: 'Auth Supabase',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9,12 11,14 15,10" />
      </svg>
    ),
  },
  {
    label: '3. Quota activé',
    rule: 'Accès instantané',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17,11 19,13 23,9" />
      </svg>
    ),
  },
  {
    label: '4. Chat disponible',
    rule: 'Prêt à discuter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
]

export function Workflow() {
  const sectionRef = useRef<HTMLElement>(null)
  const tokenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const token = tokenRef.current
    if (!section || !token) return

    let animated = false

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true
            entry.target.querySelectorAll('.reveal-up').forEach((el) => {
              el.classList.add('is-visible')
            })
            animateWorkflow()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(section)
    return () => observer.disconnect()

    function animateWorkflow() {
      const columns = 4
      let currentStep = 0

      // Non-null assertions: section and token were checked before animateWorkflow was called,
      // and the component never unmounts between calls within the same effect lifecycle.
      const sectionNode = section!
      const tokenEl = token!

      const reset = () => {
        tokenEl.style.transition = 'none'
        tokenEl.style.left = '2rem'
        tokenEl.style.opacity = '0'

        sectionNode.querySelectorAll('.step-icon').forEach((icon) => {
          icon.classList.remove('bg-amber/20', 'border-amber/50', 'shadow-[0_0_20px_rgba(232,160,32,0.3)]')
          icon.classList.add('bg-graphite-800', 'border-surface/20')
          const svg = icon.querySelector('svg')
          if (svg) {
            svg.classList.remove('text-amber')
            svg.classList.add('text-surface/50')
          }
        })

        currentStep = 0
        setTimeout(() => {
          tokenEl.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          tokenEl.style.opacity = '1'
          setTimeout(moveToken, 200)
        }, 50)
      }

      const moveToken = () => {
        if (currentStep >= columns) {
          setTimeout(reset, 2000)
          return
        }

        const icons = sectionNode.querySelectorAll('.step-icon')
        const currentNode = icons[currentStep]
        if (currentNode) {
          currentNode.classList.remove('bg-graphite-800', 'border-surface/20')
          currentNode.classList.add(
            'bg-amber/20',
            'border-amber/50',
            'shadow-[0_0_20px_rgba(232,160,32,0.3)]'
          )
          const svg = currentNode.querySelector('svg')
          if (svg) {
            svg.classList.remove('text-surface/50')
            svg.classList.add('text-amber')
          }
        }

        if (window.innerWidth >= 768) {
          tokenEl.style.left = currentStep === 0 ? '2rem' : `calc(${currentStep * 25}% + 2rem)`
        } else {
          tokenEl.style.opacity = '0'
        }

        currentStep++
        setTimeout(moveToken, 1400)
      }

      tokenEl.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      tokenEl.style.opacity = '1'
      setTimeout(moveToken, 200)
    }
  }, [])

  return (
    <section className="py-section px-container relative bg-canvas observe-section overflow-hidden" ref={sectionRef}>
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/10" />
      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto">
        <div className="mb-16 reveal-up">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-4">
            [04] AUTOMATISATION
          </span>
          <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight text-graphite-900 mb-6 max-w-2xl">
            De l&apos;abonnement au premier message en 2 minutes.
          </h2>
          <p className="font-body text-graphite-500 max-w-[60ch] leading-relaxed text-sm md:text-base">
            Sélectionnez votre plan, validez votre paiement, créez votre compte. Votre quota est actif
            immédiatement — pas d&apos;attente, pas de configuration.
          </p>
        </div>

        {/* Workflow Visualizer */}
        <div
          className="bg-graphite-900 border border-graphite-900/10 p-8 md:p-12 relative overflow-hidden reveal-up shadow-2xl group"
          id="workflow-visualizer"
        >
          {/* Background Connection Line */}
          <div className="absolute top-1/2 left-16 right-16 h-[1px] bg-surface/10 -translate-y-1/2 hidden md:block z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10 min-h-[220px]">
            {steps.map((step, i) => (
              <div
                key={i}
                className="step-node relative flex flex-col items-center text-center h-full"
              >
                <span className="font-mono text-xs text-surface/50 uppercase tracking-widest mb-6">
                  {step.label}
                </span>
                <div className="step-icon w-12 h-12 bg-graphite-800 border border-surface/20 flex items-center justify-center mb-6 transition-all duration-300 relative z-10 mt-auto">
                  <span className="text-surface/50 transition-colors duration-300">{step.icon}</span>
                </div>
                <span className="font-mono text-xs text-surface/70 mt-auto">{step.rule}</span>
              </div>
            ))}
          </div>

          {/* Animated Token */}
          <div
            id="expense-token"
            ref={tokenRef}
            className="absolute top-1/2 -translate-y-1/2 left-0 h-10 bg-amber flex items-center px-4 shadow-[0_0_20px_rgba(232,160,32,0.3)] transition-all duration-[800ms] ease-swiss z-20 opacity-0 pointer-events-none w-[max-content]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-graphite-900 mr-2 shrink-0"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
            </svg>
            <span className="font-mono text-xs text-graphite-900 font-semibold">10 msgs</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-8 border-t border-graphite-900/10 pt-6 reveal-up">
          <div>
            <span className="font-mono text-xl text-graphite-900 block mb-1">84%</span>
            <span className="font-mono text-xs text-graphite-500 uppercase tracking-widest">
              Inscriptions en moins de 2 min
            </span>
          </div>
          <div>
            <span className="font-mono text-xl text-graphite-900 block mb-1">
              47 <span className="text-sm">sec</span>
            </span>
            <span className="font-mono text-xs text-graphite-500 uppercase tracking-widest">
              Temps moyen de setup
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

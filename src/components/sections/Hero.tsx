'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  // Hero canvas particle network
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.innerWidth < 768) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width
    let height = canvas.height
    const section = heroRef.current
    if (!section) return

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = section.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particleCount = window.innerWidth > 1400 ? 250 : 150
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      baseX: number
      baseY: number
    }
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const p: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseX: 0,
        baseY: 0,
      }
      p.baseX = p.x
      p.baseY = p.y
      particles.push(p)
    }

    let mouseX = -1000
    let mouseY = -1000

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          p.x -= dx * 0.03
          p.y -= dy * 0.03
        }

        ctx.fillStyle = 'rgba(14, 15, 17, 0.35)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j]
          const d2x = p.x - p2.x
          const d2y = p.y - p2.y
          const dist2 = Math.sqrt(d2x * d2x + d2y * d2y)
          if (dist2 < 85) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(232, 160, 32, ${0.1 * (1 - dist2 / 85)})`
            ctx.lineWidth = 0.6
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Hero section */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] pt-[120px] pb-section px-container overflow-hidden flex items-end w-full"
        style={{ paddingTop: 'clamp(7.5rem, 12vw, 10rem)', paddingBottom: 'clamp(5.5rem, 9vw, 11rem)' }}
      >
        {/* Canvas background */}
        <canvas
          id="hero-canvas"
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-[0.85] mix-blend-multiply hidden md:block"
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none md:hidden"
          style={{
            background: 'radial-gradient(circle_at_30%_70%, rgba(232,160,32,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Hero sweep line */}
        <div className="absolute top-0 left-0 w-[1px] h-full bg-amber opacity-0 z-10 animate-sweep pointer-events-none" />

        {/* Content grid */}
        <div
          className="w-full max-w-[96rem] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 items-end"
          style={{ maxWidth: 'clamp(70rem, 92vw, 96rem)' }}
        >
          {/* Left column (5/12) */}
          <div
            className={`md:col-span-5 flex flex-col justify-end pb-8 reveal-up ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: '0ms' }}
          >
            {/* Badge */}
            <div className="mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber/30 text-amber font-mono text-xs uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(232, 160, 32, 0.08)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                3 plans au choix
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-display font-light text-h1 leading-[1.05] tracking-tight text-graphite-900 mb-6 text-balance"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.75rem, 5.5vw, 5.25rem)' }}
            >
              Choose your plan.
              <br />
              <span className="font-normal text-amber">Chat away.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="font-body text-graphite-500 max-w-[42ch] mb-10 leading-relaxed text-sm md:text-base"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--graphite-500)', maxWidth: '42ch' }}
            >
              MessageMind vous donne le quota de messages qu&apos;il vous faut — facturé mensuellement, upgradable à tout moment, résiliable quand vous voulez.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
              <a
                href="#pricing"
                className="relative inline-flex items-center justify-center px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-surface bg-gradient-to-b from-graphite-800 to-graphite-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(14,15,17,0.2)] group hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(14,15,17,0.3)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Voir les tarifs
                  <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-swiss" />
              </a>
              <a
                href="#workflow"
                className="inline-flex items-center justify-center px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.1em] text-graphite-900 bg-surface border border-graphite-900/10 shadow-[0_2px_10px_rgba(14,15,17,0.02)] hover:shadow-[0_8px_24px_rgba(14,15,17,0.06)] hover:border-graphite-900/20 transition-all duration-300 hover:-translate-y-0.5 group"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Comment ça marche
                <PlayCircle size={16} strokeWidth={1.5} className="ml-2 text-graphite-500 group-hover:text-amber transition-colors" />
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 border-t border-graphite-900/10 pt-6">
              <div className="flex -space-x-2">
                <div
                  className="w-8 h-8 rounded-none bg-graphite-500 border border-canvas shadow-sm"
                  style={{ backgroundColor: 'var(--graphite-500)' }}
                />
                <div
                  className="w-8 h-8 rounded-none bg-graphite-900 border border-canvas shadow-sm"
                  style={{ backgroundColor: 'var(--graphite-900)' }}
                />
                <div
                  className="w-8 h-8 rounded-none bg-amber border border-canvas shadow-sm"
                  style={{ backgroundColor: 'var(--amber)' }}
                />
              </div>
              <p
                className="font-mono text-xs tracking-[0.06em] text-graphite-500 uppercase leading-tight max-w-[200px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
              >
                Utilisé par{' '}
                <span className="text-graphite-900 font-semibold">340</span> équipes.
                <br />
                <span className="text-graphite-900 font-semibold">91k+</span> messages ce mois.
              </p>
            </div>
          </div>

          {/* Right column (7/12) — Dashboard mockup */}
          <div
            className={`md:col-span-7 relative md:-ml-6 reveal-up ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: '200ms' }}
            id="hero-panel"
          >
            <div
              className="bg-surface border border-graphite-900/10 shadow-[0_24px_80px_rgba(14,15,17,0.08)] overflow-hidden relative group"
              style={{ borderRadius: '0' }}
            >
              {/* Dashboard header */}
              <div
                className="border-b border-graphite-900/10 px-6 py-4 flex justify-between items-center"
                style={{ backgroundColor: 'rgba(246, 244, 240, 0.5)' }}
              >
                <div className="flex items-center gap-6">
                  <span
                    className="font-display font-semibold text-sm uppercase tracking-tight text-graphite-900"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    MessageMind
                  </span>
                  <div className="hidden sm:flex items-center gap-4">
                    <span
                      className="font-mono text-xs tracking-[0.1em] text-graphite-900 uppercase flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--amber)' }} />
                      Conversations
                    </span>
                    <span
                      className="font-mono text-xs tracking-[0.1em] text-graphite-500 uppercase hover:text-graphite-900 cursor-pointer transition-colors"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Insights
                    </span>
                    <span
                      className="font-mono text-xs tracking-[0.1em] text-graphite-500 uppercase hover:text-graphite-900 cursor-pointer transition-colors"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Quotas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Bell icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-graphite-500 hover:text-graphite-900 transition-colors cursor-pointer">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <div className="flex items-center gap-2 border-l border-graphite-900/10 pl-4">
                    <div
                      className="w-6 h-6 flex items-center justify-center font-mono text-xs text-canvas"
                      style={{ backgroundColor: 'var(--graphite-900)', fontFamily: 'var(--font-mono)' }}
                    >
                      MM
                    </div>
                    <span
                      className="font-mono text-xs text-graphite-500 hidden sm:block"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Marie Martin, Scale
                    </span>
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 bg-surface">
                {/* Top bar */}
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3
                      className="font-display font-normal text-lg mb-1"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Vos conversations
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs border border-graphite-900/10 px-2 py-0.5"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
                      >
                        Nov 2025
                      </span>
                      <span
                        className="font-mono text-xs px-2 py-0.5"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}
                      >
                        +12 ce mois
                      </span>
                    </div>
                  </div>
                  <div className="text-right group-hover:-translate-y-0.5 transition-transform duration-300">
                    <span
                      className="block font-mono text-xs mb-1 uppercase tracking-[0.06em]"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
                    >
                      Messages utilisés
                    </span>
                    <span
                      className="font-mono text-2xl font-medium group-hover:text-amber transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-900)' }}
                    >
                      47 / 50
                    </span>
                  </div>
                </div>

                {/* Spark cards grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Card 1 */}
                  <div
                    className="border border-graphite-900/10 p-4 hover:border-amber/40 transition-colors cursor-pointer group flex justify-between items-start"
                    style={{ borderColor: 'var(--graphite-900)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-graphite-500">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="font-display font-medium text-sm" style={{ fontFamily: 'var(--font-display)' }}>Conversations</span>
                      </div>
                      <span className="font-mono text-xs uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}>
                        Ce mois
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs mb-2 block" style={{ color: 'var(--green)' }}>↑ 23%</span>
                      <span className="font-mono text-sm font-medium group-hover:text-amber transition-colors" style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-900)' }}>
                        128
                      </span>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div
                    className="border border-graphite-900/10 p-4 hover:border-amber/40 transition-colors cursor-pointer group flex justify-between items-start"
                    style={{ borderColor: 'var(--graphite-900)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-graphite-500">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="font-display font-medium text-sm" style={{ fontFamily: 'var(--font-display)' }}>Temps moyen</span>
                      </div>
                      <span className="font-mono text-xs uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}>
                        Réponse IA
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs mb-2 block" style={{ color: 'var(--green)' }}>↓ 8%</span>
                      <span className="font-mono text-sm font-medium group-hover:text-amber transition-colors" style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-900)' }}>
                        2.4s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversation list */}
                <div>
                  <span
                    className="font-mono text-xs uppercase tracking-[0.1em] border-b border-graphite-900/10 pb-2 block w-full mb-2"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
                  >
                    Messages récents
                  </span>
                  <div className="space-y-1">
                    {[
                      { dot: 'var(--green)', name: 'Sophie L.', preview: 'Projet Q4 — confirmation...', time: '14:32', tag: 'Résolu' },
                      { dot: 'var(--amber)', name: 'Thomas B.', preview: 'Question sur le plan Scale', time: '13:15', tag: 'En cours' },
                      { dot: 'var(--red)', name: 'Julie M.', preview: 'Problème de facturation', time: '11:48', tag: 'Urgent' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 px-2 hover:bg-canvas transition-colors text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: item.dot }} />
                          <span className="font-medium min-w-[120px]">{item.name}</span>
                          <span
                            className="font-mono text-xs hidden sm:inline-block border border-graphite-900/10 px-1"
                            style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <span
                          className="font-mono text-xs"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--graphite-500)' }}
                        >
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div
                className="py-2 px-6 flex justify-between items-center"
                style={{ backgroundColor: 'var(--graphite-900)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-none animate-pulse" style={{ backgroundColor: 'var(--green)' }} />
                  <span
                    className="font-mono text-xs uppercase tracking-[0.1em]"
                    style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246, 244, 240, 0.7)' }}
                  >
                    Connecté à Stripe · Quota: 47/50
                  </span>
                </div>
                <span
                  className="font-mono text-xs uppercase tracking-[0.1em]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246, 244, 240, 0.5)' }}
                >
                  Synced: 14s ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

'use client'

import { motion } from 'framer-motion'

export function FinalCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--accent) 0%, var(--violet) 100%)',
        }}
      />

      {/* Decorative rings */}
      <div className="cta-ring cta-ring--1" />
      <div className="cta-ring cta-ring--2" />
      <div className="cta-ring cta-ring--3" />

      {/* Particles */}
      <div className="particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 40}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              animationDuration: `${6 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 8}s`,
              background:
                Math.random() > 0.6
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight"
          style={{ color: '#fff', letterSpacing: '-0.03em' }}
        >
          Arrête de chercher.
          <br />
          Commence à demander.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-base max-w-md"
          style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}
        >
          Connexion en 30 secondes. Tes emails restent les tiens. Aucune carte
          bancaire requise.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            className="h-12 px-8 rounded-full text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 w-full sm:w-auto"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--accent)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(-2px)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = ''
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            Essayer Emind gratuitement
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-xs"
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-space-mono), Space Mono, monospace',
          }}
        >
          Aucune carte bancaire requise · Désabonnement en 1 clic
        </motion.p>
      </div>
    </section>
  )
}

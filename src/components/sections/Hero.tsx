'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section
      className="md:py-24 grid md:grid-cols-2 gap-12 w-full max-w-7xl mr-auto ml-auto pt-12 pr-6 pb-12 pl-6 gap-x-12 gap-y-12 items-center"
      style={{ backgroundColor: '#efeadd' }}
    >
      {/* Left: Copy */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block border-2 px-3 py-1 text-sm font-semibold tracking-wide uppercase"
          style={{
            backgroundColor: '#e8b056',
            color: '#2d3235',
            borderColor: '#2d3235',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Bientôt disponible
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:text-7xl leading-[1.1] text-5xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-sans)', color: '#2d3235' }}
        >
          L&apos;IA au service de vos{' '}
          <span className="italic" style={{ color: '#c24b46' }}>
            conversations
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-xl md:text-2xl leading-relaxed max-w-lg"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#5a5f63',
          }}
        >
          Conversez intelligemment. Analysez vos échanges email en langage
          naturel. Gagnez du temps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <a
            href="#pricing"
            className="flex items-center justify-center gap-3 text-lg px-8 py-4 border-2 text-white font-semibold transition-all"
            style={{
              backgroundColor: '#1d8f6d',
              borderColor: '#2d3235',
              boxShadow: '5px 5px 0px 0px #2d3235',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translate(2px, 2px)'
              el.style.boxShadow = '2px 2px 0px 0px #2d3235'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = ''
              el.style.boxShadow = '5px 5px 0px 0px #2d3235'
            }}
          >
            Commencer gratuitement
            <ArrowRight size={20} strokeWidth={2} />
          </a>

          <a
            href="#features"
            className="flex items-center justify-center text-lg px-8 py-4 border-2 font-semibold transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: '#2d3235',
              borderColor: '#2d3235',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = '#e8b056'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'transparent'
            }}
          >
            Voir la démo
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#5a5f63',
          }}
        >
          Aucun crédit requis • Essai gratuit 14 jours
        </motion.p>
      </div>

      {/* Right: Chat Mockup */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative w-full flex justify-center md:justify-end"
      >
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-3/4 h-full opacity-20 -z-10 translate-x-4 translate-y-4"
          style={{ backgroundColor: '#d67035' }}
        />

        {/* Chat UI mockup */}
        <div
          className="bg-white border-2 p-8 w-full max-w-md relative z-0"
          style={{
            borderColor: '#2d3235',
            boxShadow: '8px 8px 0px 0px #e8b056',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6 pb-4"
            style={{ borderBottom: '2px solid #efeadd' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: '#c24b46' }}
              >
                <MessageSquare size={16} className="text-white" strokeWidth={2} />
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#2d3235',
                }}
              >
                Emind
              </span>
            </div>
            <div className="flex gap-2">
              <div
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: '#c24b46',
                  borderColor: '#2d3235',
                }}
              />
              <div
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: '#e8b056',
                  borderColor: '#2d3235',
                }}
              />
            </div>
          </div>

          {/* Chat messages */}
          <div className="space-y-4 mb-6">
            {/* AI message */}
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-1"
                style={{ backgroundColor: '#c24b46' }}
              >
                <Sparkles size={12} className="text-white" strokeWidth={2} />
              </div>
              <div
                className="flex-1 p-3 border-2 text-sm"
                style={{
                  backgroundColor: '#efeadd',
                  borderColor: '#2d3235',
                  fontFamily: 'var(--font-mono)',
                  color: '#2d3235',
                }}
              >
                Bonjour ! J&apos;ai trouvé 3 emails non répondus de clients
                potentiels cette semaine. Voulez-vous que je vous aide à les
                prioriser ?
              </div>
            </div>

            {/* User message */}
            <div className="flex gap-3 justify-end">
              <div
                className="max-w-[75%] p-3 border-2 text-sm"
                style={{
                  backgroundColor: '#1d8f6d',
                  color: '#ffffff',
                  borderColor: '#2d3235',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Oui, trie-les par valeur estimée
              </div>
            </div>

            {/* AI message 2 */}
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-1"
                style={{ backgroundColor: '#c24b46' }}
              >
                <Sparkles size={12} className="text-white" strokeWidth={2} />
              </div>
              <div
                className="flex-1 p-3 border-2 text-sm"
                style={{
                  backgroundColor: '#efeadd',
                  borderColor: '#2d3235',
                  fontFamily: 'var(--font-mono)',
                  color: '#2d3235',
                }}
              >
                Voici le classement :<br />
                <span style={{ color: '#c24b46', fontWeight: 600 }}>
                  1. Sophie Martin — 8 400 €
                </span>
                <br />
                <span style={{ color: '#5a5f63' }}>
                  2. Thomas Leroy — 3 200 €
                </span>
                <br />
                <span style={{ color: '#5a5f63' }}>
                  3. Léa Dupont — 1 800 €
                </span>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-2"
            style={{
              borderColor: '#2d3235',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="text-sm flex-1" style={{ color: '#5a5f63' }}>
              Posez une question...
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center text-white"
              style={{ backgroundColor: '#1d8f6d' }}
              aria-label="Envoyer"
            >
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="w-full py-24 px-6" style={{ backgroundColor: '#efeadd' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6"
      >
        <h2
          className="text-4xl font-semibold tracking-tight"
          style={{
            fontFamily: 'var(--font-sans)',
            color: '#2d3235',
          }}
        >
          Prêt à transformer vos conversations email ?
        </h2>
        <p
          className="text-xl max-w-md"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#5a5f63',
          }}
        >
          Rejoignez les professionnels qui gagnent du temps avec Emind.
          Aucune carte requise.
        </p>
        <a
          href="#pricing"
          className="flex items-center justify-center gap-3 text-lg px-10 py-4 border-2 text-white font-semibold transition-all"
          style={{
            backgroundColor: '#c24b46',
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
          Choisir mon plan
          <ArrowRight size={20} strokeWidth={2} />
        </a>
      </motion.div>
    </section>
  )
}

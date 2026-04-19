'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Zap, Target } from 'lucide-react'

const steps = [
  {
    number: '1',
    badgeColor: '#c24b46',
    title: 'Posez une question',
    description:
      'Tapez votre question en langage naturel. Notre IA analyse votre contexte et comprend le sens de vos échanges.',
    icon: MessageSquare,
  },
  {
    number: '2',
    badgeColor: '#d67035',
    title: 'Recevez une réponse',
    description:
      'Obtenez une réponse structurée avec les sources et les données pertinentes, en quelques secondes.',
    icon: Zap,
  },
  {
    number: '3',
    badgeColor: '#e8b056',
    title: 'Agissez',
    description:
      'Utilisez les insights pour prendre des décisions éclairées et accélérer vos conversations.',
    icon: Target,
  },
]

const chatMessages = [
  {
    role: 'ai',
    content:
      'Bonjour ! Voici le résumé de vos 3 derniers échanges avec **Marie Dupont** :\n\n\u2022 14h22 \u2014 Elle a validé le devis pour la refonte du site (8 500 \u20ac HT).\n\u2022 10h05 \u2014 Elle demande une facture proforma avant signature.\n\u2022 Hier 16h48 \u2014 Elle a confirmé la date de livraison au 15 mars.',
    time: '10:32',
  },
  {
    role: 'user',
    content: 'Quel était le dernier échange avec le client Martin ?',
    time: '10:33',
  },
  {
    role: 'ai',
    content:
      'Dernier échange avec **Jean Martin** : il a signalé un problème technique sur la saisie de commande hier à 17h12. Aucune réponse de votre part depuis. Suggestion : relancer avec une solution corrective.',
    time: '10:33',
  },
]

export function Workflow() {
  return (
    <section
      className="w-full py-24 border-y-2 border-black"
      style={{ backgroundColor: '#2d3235', color: '#efeadd' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div>
            <h3
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
              style={{ color: '#efeadd', fontFamily: 'var(--font-sans)' }}
            >
              Comment fonctionne Emind ?
            </h3>
            <div className="space-y-10 mt-12">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex gap-6"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 font-bold text-xl"
                      style={{
                        backgroundColor: step.badgeColor,
                        borderColor: '#efeadd',
                        color: step.number === '3' ? '#2d3235' : '#efeadd',
                      }}
                    >
                      {step.number}
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 flex items-center justify-center border-2"
                          style={{ backgroundColor: step.badgeColor, borderColor: '#efeadd' }}
                        >
                          <Icon size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <h4
                          className="text-2xl font-semibold"
                          style={{
                            color: '#efeadd',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-lg leading-relaxed" style={{ color: '#9a9fa3' }}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right: Chat mockup */}
          <div
            className="bg-white text-[#2d3235] p-2 border-2 border-white"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '10px 10px 0px 0px #c24b46',
            }}
          >
            <div
              className="border border-[#d1d0cc] h-full p-4 overflow-hidden"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Chat Header */}
              <div
                className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d1d0cc]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#c24b46' }}
                >
                  <MessageSquare size={14} className="text-white" strokeWidth={2} />
                </div>
                <span className="text-base font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                  Emind — Conversation
                </span>
              </div>

              {/* Chat messages */}
              <div className="space-y-3 mb-4">
                {chatMessages.map((msg, i) =>
                  msg.role === 'ai' ? (
                    <div key={i} className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: '#c24b46' }}
                      >
                        <MessageSquare size={12} className="text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div
                          className="inline-block px-3 py-2 text-sm leading-relaxed border-2"
                          style={{
                            backgroundColor: '#efeadd',
                            borderColor: '#2d3235',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            color: '#2d3235',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\u2022/g, '\u2022'),
                          }}
                        />
                        <p
                          className="text-xs mt-1 ml-1"
                          style={{ color: '#9a9fa3', fontFamily: 'var(--font-mono)' }}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[75%]">
                        <div
                          className="px-3 py-2 text-sm border-2"
                          style={{
                            backgroundColor: '#2d3235',
                            borderColor: '#2d3235',
                            color: '#efeadd',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                          }}
                        >
                          {msg.content}
                        </div>
                        <p
                          className="text-xs mt-1 mr-1 text-right"
                          style={{ color: '#9a9fa3', fontFamily: 'var(--font-mono)' }}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Typing indicator */}
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: '#c24b46' }}
                  >
                    <MessageSquare size={12} className="text-white" strokeWidth={2} />
                  </div>
                  <div
                    className="flex items-center gap-1 px-3 py-2 border-2 border-[#2d3235]"
                    style={{ backgroundColor: '#efeadd' }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: '#2d3235',
                          animation: `wave ${0.6 + dot * 0.15}s ease-in-out infinite`,
                          animationDelay: `${dot * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 border-2 border-[#2d3235] mt-2"
                style={{ backgroundColor: '#efeadd' }}
              >
                <div
                  className="flex-1 text-sm"
                  style={{
                    color: '#9a9fa3',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }}
                >
                  Tapez votre question...
                </div>
                <div
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#c24b46' }}
                >
                  ▶
                </div>
              </div>

              {/* Footer meta */}
              <div
                className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: '#9a9fa3', fontFamily: 'var(--font-mono)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1d8f6d' }} />
                Connecté · 3 emails analysés · Réponse en ~2s
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export function Navbar() {
  return (
    <>
      {/* Top colored stripes */}
      <div className="w-full flex flex-col">
        <div className="bg-[#c24b46] w-full h-3" />
        <div className="h-3 w-full bg-[#d67035]" />
        <div className="h-3 w-full bg-[#e8b056]" />
        <div className="bg-[#2d3235] w-full h-3" />
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center z-10 relative">
        <div className="mb-4 md:mb-0">
          <h1
            className="text-3xl tracking-tight font-semibold"
            style={{
              fontFamily: 'var(--font-sans)',
              color: '#c24b46',
              textShadow: '2px 2px 0px 0px #2d3235',
            }}
          >
            Emind
          </h1>
        </div>

        <div
          className="flex gap-8 text-lg font-medium items-center"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <a
            href="#features"
            className="hover:underline decoration-2 underline-offset-4 transition-all"
            style={{ color: '#2d3235' }}
          >
            Fonctionnalités
          </a>
          <a
            href="#pricing"
            className="hover:underline decoration-2 underline-offset-4 transition-all"
            style={{ color: '#2d3235' }}
          >
            Tarifs
          </a>
          <Link
            href="/login"
            className="hover:underline decoration-2 underline-offset-4 transition-all"
            style={{ color: '#2d3235' }}
          >
            Connexion
          </Link>
          <a
            href="#pricing"
            className="hidden md:inline-block px-5 py-2 border-2 font-semibold transition-all"
            style={{
              backgroundColor: '#2d3235',
              color: '#efeadd',
              borderColor: '#2d3235',
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
              el.style.boxShadow = ''
            }}
          >
            Commencer
          </a>
        </div>
      </nav>
    </>
  )
}

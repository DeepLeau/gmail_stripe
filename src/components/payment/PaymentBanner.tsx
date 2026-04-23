'use client'

import { Zap } from 'lucide-react'
import Link from 'next/link'

interface PaymentBannerProps {
  variant: 'signup' | 'success' | 'upgrade'
}

export function PaymentBanner({ variant }: PaymentBannerProps) {
  if (variant === 'signup') {
    return (
      <div className="w-full py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-blue-600" />
          </div>
          <p className="text-gray-700 text-center">
            <span className="font-medium">Crée ton compte</span> et choisis le plan qui te correspond.
            Commence gratuitement, évolue quand tu veux.
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'success') {
    return (
      <div className="w-full py-4 px-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-green-600" />
          </div>
          <p className="text-gray-700 text-center">
            <span className="font-medium">Compte créé !</span> Débloque plus de questions en choisit un plan ci-dessous.
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'upgrade') {
    return (
      <div className="w-full py-4 px-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-amber-600" />
          </div>
          <p className="text-gray-700 text-center">
            <span className="font-medium">Limite atteinte</span> — Upgrade ton plan pour continuer à poser des questions.
          </p>
          <Link
            href="/#pricing"
            className="shrink-0 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors"
          >
            Voir les plans
          </Link>
        </div>
      </div>
    )
  }

  return null
}

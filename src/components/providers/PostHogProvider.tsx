'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import type { PostHogInterface } from 'posthog-js'

/**
 * PostHog Analytics Provider — Niveau 1 (landing / visiteurs)
 *
 * Initialise PostHog avec autocapture sur les pageviews, clics et formulaires.
 * Le tracking pageview est désactivé dans posthog.init() et délégué à
 * PostHogPageView (via usePathname + useSearchParams) pour éviter les doublons
 * lors des navigations client-side.
 *
 * RGPD : maskAllInputs est activé pour éviter la capture de données personnelles
 * dans les champs de formulaire. Si des utilisateurs européens sont concernés,
 * un banner de consentement cookie devra être ajouté et PostHog configuré en
 * mode opt-in (capture_pageview + autocapture désactivés par défaut).
 *
 * Guard lazy : si NEXT_PUBLIC_POSTHOG_KEY ou NEXT_PUBLIC_POSTHOG_HOST sont
 * absentes (ex: en dev sans config), l'init est short-circuité silencieusement.
 * Le site reste fonctionnel sans analytics.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[PostHog] NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST not set — analytics disabled'
        )
      }
      return
    }

    posthog.init(key, {
      api_host: host,
      // Désactivé : on capture les pageviews manuellement dans PostHogPageView
      // pour avoir l'URL complète (origin + pathname + searchParams)
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      // Protection RGPD : masque le contenu des inputs pour éviter la capture
      // accidentelle de données personnelles (emails, noms, etc.)
      session_recording: {
        maskAllInputs: true,
      },
      loaded: (posthogInstance: PostHogInterface) => {
        if (process.env.NODE_ENV === 'development') {
          posthogInstance.debug()
        }
      },
    })
  }, [])

  return <>{children}</>
}

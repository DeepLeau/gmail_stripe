'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

/**
 * Tracke manuellement les pageviews sur chaque changement de route.
 *
 * L'App Router ne déclenche pas automatiquement de $pageview sur navigation
 * client-side (contrairement au Pages Router). Ce composant utilise
 * usePathname + useSearchParams pour capturer l'événement $pageview avec
 * l'URL complète à chaque navigation.
 *
 * Wrappé dans <Suspense> dans layout.tsx car useSearchParams requiert un
 * Suspense boundary en build static (Next.js rule).
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    let url = window.origin + pathname
    const search = searchParams?.toString()
    if (search) url = `${url}?${search}`

    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

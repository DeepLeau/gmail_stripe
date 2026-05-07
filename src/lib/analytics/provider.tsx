'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

type ProviderState = 'bootstrapping' | 'ready'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProviderState>('bootstrapping')

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[PostHog] NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST not set — analytics disabled'
        )
      }
      setState('ready')
      return
    }

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })

    setState('ready')
  }, [])

  if (state === 'bootstrapping') return null

  return <PHProvider client={posthog}>{children}</PHProvider>
}

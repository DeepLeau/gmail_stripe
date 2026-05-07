'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key) {
      return
    }

    posthog.init(key, {
      api_host: host ?? 'https://eu.posthog.com',
      autocapture: true,
      // loaded callback prevents double-init in React 18 StrictMode
      loaded: () => {
        // no-op — autocapture takes over once initialized
      },
    })
  }, [])

  return null
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogInit />
      {children}
    </>
  )
}

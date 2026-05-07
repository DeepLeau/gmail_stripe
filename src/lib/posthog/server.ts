import { PostHog } from 'posthog-node'

let _client: PostHog | null = null

function getPostHogServer(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY
  const host = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com'

  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] POSTHOG_API_KEY not set — server-side tracking disabled')
    }
    return null
  }

  if (!_client) {
    _client = new PostHog(key, {
      host,
      flushAt: 20,
      flushInterval: 10000,
    })
  }

  return _client
}

export async function captureCheckoutCreated(props: {
  plan: string
  userId?: string
  sessionId: string
}) {
  const client = getPostHogServer()
  if (!client) return

  try {
    client.capture({
      event: 'checkout_created',
      distinctId: props.userId ?? props.sessionId,
      properties: {
        plan: props.plan,
        session_id: props.sessionId,
        user_id: props.userId ?? null,
      },
    })
  } catch (err) {
    console.error('[PostHog] Failed to capture checkout_created:', err)
  }
}

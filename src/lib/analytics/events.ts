import posthog from 'posthog-js'

// ─── Event names ─────────────────────────────────────────────────────────────
export const EVENT_NAMES = {
  CTA_CLICK: 'cta_click',
  CHECKOUT_STARTED: 'checkout_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
} as const

// ─── Property shapes ─────────────────────────────────────────────────────────
export interface CtaClickProperties {
  cta: string
  destination: string
}

export interface CheckoutStartedProperties {
  plan: string
}

export type EventProperties = CtaClickProperties | CheckoutStartedProperties

// ─── Track helper ────────────────────────────────────────────────────────────
/**
 * Capture a PostHog event.
 * Silent-fail if PostHog is not yet initialized — never throws, never affects UI.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  try {
    if (typeof posthog === 'undefined') return
    if (!posthog.__loaded) return
    posthog.capture(eventName, properties)
  } catch {
    // swallow — analytics must never break the UI
  }
}

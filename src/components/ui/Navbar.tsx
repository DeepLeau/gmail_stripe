import { createClient } from '@/lib/supabase/server'
import { getCurrentSubscription, type SubscriptionState } from '@/app/actions/subscription'
import { UserMenu } from '@/components/ui/UserMenu'
import { GuestCtas } from '@/components/ui/GuestCtas'
import { NavbarScrollWrapper } from '@/components/ui/NavbarScrollWrapper'
import { NavbarMobileMenu } from '@/components/ui/NavbarMobileMenu'
import { cn } from '@/lib/utils'

function subscriptionToData(
  sub: SubscriptionState | null
): import('@/lib/stripe/config').SubscriptionData | null {
  if (!sub) return null
  const remaining = sub.units_limit > 0 ? Math.max(0, sub.units_limit - sub.units_used) : null
  return {
    plan: sub.plan,
    units_used: sub.units_used,
    units_limit: sub.units_limit,
    units_remaining: remaining,
    status: sub.subscription_status,
  }
}

export async function Navbar() {
  let userEmail: string | undefined = undefined
  let subscription: import('@/lib/stripe/config').SubscriptionData | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    userEmail = user?.email

    if (user) {
      const rawSub = await getCurrentSubscription()
      subscription = subscriptionToData(rawSub)
    }
  } catch {
    // Env vars not set (build/CI) — render as guest
  }

  const navLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Sécurité', href: '#trust' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <NavbarScrollWrapper>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14 gap-10">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2 font-semibold text-[var(--accent)] text-lg tracking-tight flex-shrink-0"
            >
              Emind
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 h-8 flex items-center justify-center text-sm text-[var(--text-2)] hover:text-[var(--text)] rounded-md hover:bg-[var(--surface)] transition-colors duration-150"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Zone droite — auth-aware */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {userEmail ? (
                <UserMenu userEmail={userEmail} subscription={subscription} />
              ) : (
                <GuestCtas />
              )}
            </div>

            {/* Mobile hamburger — delegated to NavbarMobileMenu */}
            <NavbarMobileMenu
              navLinks={navLinks}
              userEmail={userEmail}
              subscription={subscription}
            />
          </div>
        </div>
      </NavbarScrollWrapper>
    </header>
  )
}

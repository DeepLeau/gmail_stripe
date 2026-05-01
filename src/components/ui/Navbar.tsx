import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
  const supabase = await createClient()

  let userEmail: string | null = null
  let userPlan: string | null = null

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      userEmail = user.email ?? null

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

      userPlan = subscription?.plan ?? null
    }
  }

  return (
    <NavbarClient
      userEmail={userEmail}
      userPlan={userPlan}
    />
  )
}

import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { UsageMeter } from '@/components/ui/UsageMeter'
import { createClient } from '@/lib/supabase/server'
import type { BillingData } from '@/lib/hooks/useUserBilling'

export const dynamic = 'force-dynamic'

async function getBillingForUser(): Promise<BillingData | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Lecture via RPC ou lecture directe de user_billing
    // La RPC update_quota_if_allowed est pour les writes, pas reads.
    // On fait un select direct — RLS garantit que l'user ne lit que son propre row.
    const { data } = await supabase
      .from('user_billing')
      .select(
        'plan, messages_limit, messages_used, current_period_end'
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data) return null

    return {
      plan: data.plan,
      messages_limit: data.messages_limit,
      messages_used: data.messages_used,
      messages_remaining: data.messages_limit - data.messages_used,
      period_end: data.current_period_end ?? '',
    }
  } catch {
    return null
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const billingData = await getBillingForUser()

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
        <span
          className="text-sm font-semibold text-[var(--text-1)] tracking-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          Emind
        </span>

        {/* Right side: billing meter + user menu */}
        <div className="flex items-center gap-3">
          {billingData && (
            <UsageMeter data={billingData} />
          )}
          {userEmail && <UserMenu userEmail={userEmail} />}
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface planName={billingData?.plan} />
        </div>
      </div>
    </main>
  )
}

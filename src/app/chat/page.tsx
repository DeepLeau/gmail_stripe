import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface QuotaData {
  plan: string
  messages_limit: number
  messages_used: number
  messages_remaining: number
  current_period_start: string | null
  current_period_end: string | null
}

async function fetchQuota(userId: string): Promise<QuotaData> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      'plan, messages_limit, messages_used, current_period_start, current_period_end'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    // Free plan defaults
    return {
      plan: 'start',
      messages_limit: 10,
      messages_used: 0,
      messages_remaining: 10,
      current_period_start: null,
      current_period_end: null,
    }
  }

  return {
    plan: data.plan,
    messages_limit: data.messages_limit,
    messages_used: data.messages_used,
    messages_remaining: Math.max(0, data.messages_limit - data.messages_used),
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const quota = user ? await fetchQuota(user.id) : null

  const messagesLimit = quota?.messages_limit ?? 10
  const messagesUsed = quota?.messages_used ?? 0
  const plan = quota?.plan ?? 'start'
  const messagesRemaining = quota?.messages_remaining ?? 10

  return (
    <main className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between h-14 px-4"
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-2)',
        }}
      >
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          EmailMind
        </span>

        <div className="flex items-center gap-4">
          {/* Quota indicator */}
          {user && quota ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                <span
                  className="font-medium"
                  style={{
                    color:
                      quota.messages_remaining === 0 ? 'var(--red)' : 'var(--text)',
                  }}
                >
                  {quota.messages_remaining}
                </span>
                /{quota.messages_limit} messages
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent)',
                }}
              >
                {quota.plan}
              </span>
              {quota.messages_remaining === 0 && (
                <a
                  href="/settings/billing"
                  className="px-2 py-1 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                  }}
                >
                  Upgrader →
                </a>
              )}
            </div>
          ) : !user ? null : (
            <div className="flex items-center gap-1.5">
              <Loader2
                size={12}
                className="animate-spin"
                style={{ color: 'var(--dim)' }}
              />
              <span className="text-xs" style={{ color: 'var(--dim)' }}>
                Chargement...
              </span>
            </div>
          )}

          {userEmail && <UserMenu userEmail={userEmail} />}
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            messagesLimit={messagesLimit}
            messagesUsed={messagesUsed}
            plan={plan}
          />
        </div>
      </div>
    </main>
  )
}

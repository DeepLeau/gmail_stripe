import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'server_config_error' }, { status: 500 })
  }

  // Auth
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient(supabaseUrl, serviceRoleKey)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const message: string = body?.message ?? ''

  if (!message.trim()) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 })
  }

  // Vérifier la limite via RPC
  const { data: quotaData, error: quotaError } = await supabase.rpc(
    'check_and_consume_unit',
    { p_user_id: user.id }
  )

  if (quotaError) {
    console.error('[chat/send] check_and_consume_unit error:', quotaError)
    return NextResponse.json({ error: 'quota_check_failed' }, { status: 500 })
  }

  const allowed = quotaData?.allowed
  if (!allowed) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  // --- Logique LLM à implémenter ---
  // TODO: intégrer l'appel au provider LLM (OpenAI / Anthropic)
  // const response = await callLlm(message, user.id)
  const response = `Placeholder response to: ${message.slice(0, 100)}`

  return NextResponse.json({ text: response, units_used: 1 })
}

// Helper inline pour éviter un import supplémentaire
function createServiceRoleClient(url: string, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { createServerClient } = require('@supabase/ssr')
  return createServerClient(url, key, {
    cookies: { get: () => undefined, set: () => {}, remove: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as ReturnType<typeof createServerClient>
}

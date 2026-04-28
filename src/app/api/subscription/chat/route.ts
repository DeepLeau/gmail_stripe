import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * POST /api/subscription/chat
 * Décremente le quota de messages de l'utilisateur connecté.
 * Retourne 429 si le quota est épuisé.
 */
export async function POST(request: NextRequest) {
  // Récupérer le user via session cookie
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Extraire le token de session depuis le cookie
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Vérifier et décrémenter le quota via RPC
  const { data, error } = await supabaseAdmin.rpc('consume_message_unit', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('[api/subscription/chat] consume_message_unit error:', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // La RPC retourne true si le message a été comptabilisé, false si quota épuisé
  if (!data) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 })
  }

  return NextResponse.json({ success: true })
}

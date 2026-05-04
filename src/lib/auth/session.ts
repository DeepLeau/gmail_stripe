import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSessionFromCookie(supabase: ReturnType<typeof createServerClient>) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    return null
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return null
  }

  return { user }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  if (!supabase) {
    // Env vars manquantes (build time ou configuration invalide)
    redirect('/login')
  }
  await supabase.auth.signOut()
  redirect('/login')
}

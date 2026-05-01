'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  if (!supabase) {
    // Service non disponible — rediriger quand même
    redirect('/login')
    return
  }
  await supabase.auth.signOut()
  redirect('/login')
}

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, LayoutDashboard } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Vérifier la session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Vérifier le flag admin via user_roles
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin =
    roleData?.role === 'admin' || roleData?.role === 'owner'

  if (!isAdmin) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar admin */}
      <aside className="w-[220px] shrink-0 h-screen flex flex-col border-r border-[var(--border)] px-3 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6 shrink-0">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text)] tracking-tight truncate">
            Emmind
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          <Link
            href="/admin/newsletter"
            className="flex items-center gap-2.5 px-2 h-8 rounded-md text-sm transition-colors duration-150 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
          >
            <Mail size={15} strokeWidth={1.5} className="shrink-0" />
            <span className="truncate">Newsletter</span>
          </Link>
        </nav>

        {/* Footer utilisateur */}
        <div className="shrink-0 border-t border-[var(--border)] pt-3 mt-2">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[10px] text-[var(--text-2)] font-medium shrink-0">
              {user.email?.slice(0, 2).toUpperCase() ?? 'AD'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-[var(--text)] truncate">
                {user.email?.split('@')[0] ?? 'Admin'}
              </span>
              <span className="text-[11px] text-[var(--text-3)] truncate">
                Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserSidebar } from '@/components/user/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Crown, Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── GridPlay Tournament OS Sidebar ── */}
      <UserSidebar profile={profile} />

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/70 bg-background/90 backdrop-blur-md px-6 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="font-bold text-foreground">GP</span>
            <ChevronRight className="h-3 w-3" />
            <span className="tracking-wider uppercase text-foreground font-semibold">
              DASHBOARD
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all"
              >
                <Shield className="h-3 w-3" />
                Admin OS
              </Link>
            )}

            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
            >
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              Upgrade Pro
            </Link>

            <ThemeToggle size="sm" />
          </div>
        </header>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

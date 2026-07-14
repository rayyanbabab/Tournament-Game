import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserSidebar } from '@/components/user/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notification-bell'
import { Search } from 'lucide-react'
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
    <div className="flex min-h-screen bg-background">
      {/* ── Persistent sidebar for all /dashboard/* routes ── */}
      <UserSidebar profile={profile} />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (desktop only) */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border/60 bg-muted/30 text-sm text-muted-foreground w-56 cursor-pointer hover:border-border transition-colors">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs flex-1">Cari turnamen...</span>
            <kbd className="text-[10px] border border-border/60 rounded px-1.5 py-0.5 bg-background font-mono">⌘K</kbd>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tournaments" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Turnamen
            </Link>
            <NotificationBell />
            <ThemeToggle size="sm" />
            {profile && (
              <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
                {(profile as any).avatar_url ? (
                  <img src={(profile as any).avatar_url} alt="avatar" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {(profile.full_name || 'G')[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

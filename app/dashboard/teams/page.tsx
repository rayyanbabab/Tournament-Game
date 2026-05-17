import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Users, Plus, Crown, ArrowRight, Gamepad2, Shield } from 'lucide-react'
import { UserSidebar } from '@/components/user/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardTeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: myTeams } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .eq('captain_id', user.id)
    .order('created_at', { ascending: false })

  const { data: memberTeams } = await supabase
    .from('team_members')
    .select('*, teams(*, team_members(count))')
    .eq('user_id', user.id)
    .neq('role', 'captain')
    .order('joined_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Tim Saya</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Button asChild size="sm" className="h-8 gap-2 shadow-sm shadow-primary/20">
              <Link href="/dashboard/teams/create">
                <Plus className="h-3.5 w-3.5" />
                Buat Tim
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 overflow-y-auto pt-16 md:pt-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Tim Saya</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola semua tim yang Anda buat dan ikuti</p>
          </div>

          {/* ── TIM SEBAGAI KAPTEN ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-semibold text-foreground">Tim yang Anda Kelola</h2>
                {myTeams && myTeams.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {myTeams.length} tim
                  </span>
                )}
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/teams/create"><Plus className="h-3.5 w-3.5" />Buat Tim Baru</Link>
              </Button>
            </div>

            {myTeams && myTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {myTeams.map((team: any) => (
                  <Link key={team.id} href={`/dashboard/teams/${team.id}`}
                    className="group rounded-2xl border border-border/60 border-l-2 border-l-amber-500 bg-card p-5 hover:shadow-lg hover:border-amber-500/40 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-extrabold text-amber-500">{team.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                        <Crown className="h-3 w-3" />
                        Kapten
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors">{team.name}</h3>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{team.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {team.team_members?.[0]?.count || 0} Anggota
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}

                {/* Add new team card */}
                <Link href="/dashboard/teams/create"
                  className="rounded-2xl border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center p-8 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Buat Tim Baru</p>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-amber-500/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Belum Punya Tim</p>
                  <p className="text-xs text-muted-foreground mt-1">Buat tim dan ajak teman-teman Anda bergabung!</p>
                </div>
                <Button asChild size="sm" className="mt-2 gap-2">
                  <Link href="/dashboard/teams/create"><Plus className="h-3.5 w-3.5" />Buat Tim Pertama</Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── TIM SEBAGAI ANGGOTA ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold text-foreground">Tim yang Anda Ikuti</h2>
              {memberTeams && memberTeams.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {memberTeams.length} tim
                </span>
              )}
            </div>

            {memberTeams && memberTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {memberTeams.map((member: any) => (
                  <Link key={member.id} href={`/dashboard/teams/${member.teams.id}`}
                    className="group rounded-2xl border border-border/60 border-l-2 border-l-blue-500 bg-card p-5 hover:shadow-lg hover:border-blue-500/40 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {member.teams.logo_url ? (
                          <img src={member.teams.logo_url} alt={member.teams.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-extrabold text-blue-500">{member.teams.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                        <Users className="h-3 w-3" />
                        Anggota
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors">{member.teams.name}</h3>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {member.teams.team_members?.[0]?.count || 0} Anggota
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card flex flex-col items-center justify-center py-14 text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-blue-500/40" />
                </div>
                <p className="text-sm font-medium text-foreground">Belum Bergabung dengan Tim</p>
                <p className="text-xs text-muted-foreground">Anda dapat diundang oleh kapten tim untuk bergabung.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

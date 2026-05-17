import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  Gamepad2,
  Target,
  Star,
  Clock,
  Search,
  Sun,
  CircleCheck,
  Loader,
  AlertCircle,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { UserSidebar } from '@/components/user/sidebar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: teams } = await supabase.from('teams')
    .select('*, team_members(count)').eq('captain_id', user.id)

  const { data: memberTeams } = await supabase.from('team_members')
    .select('*, teams(*)').eq('user_id', user.id)

  const { data: registrations } = await supabase.from('tournament_registrations')
    .select('*, tournaments(*), teams(name)')
    .eq('registered_by', user.id)
    .order('registered_at', { ascending: false })
    .limit(8)

  const approvedCount = registrations?.filter((r: any) => r.status === 'approved').length || 0
  const pendingCount = registrations?.filter((r: any) => r.status === 'pending').length || 0

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: 'Menunggu', icon: Loader, color: 'text-amber-500' },
    approved: { label: 'Disetujui', icon: CircleCheck, color: 'text-emerald-500' },
    rejected: { label: 'Ditolak', icon: AlertCircle, color: 'text-red-500' },
    withdrawn: { label: 'Dibatalkan', icon: AlertCircle, color: 'text-muted-foreground' },
  }

  const stats = [
    {
      title: 'Tim Saya',
      value: teams?.length || 0,
      trend: '+12.5%',
      trendUp: true,
      desc: 'Sebagai kapten',
      sub: 'Kelola tim Anda',
    },
    {
      title: 'Tim Bergabung',
      value: memberTeams?.length || 0,
      trend: '+8%',
      trendUp: true,
      desc: 'Sebagai anggota',
      sub: 'Aktif berkompetisi',
    },
    {
      title: 'Turnamen Didaftar',
      value: registrations?.length || 0,
      trend: '+24.5%',
      trendUp: true,
      desc: 'Total pendaftaran',
      sub: 'Terus bertumbuh',
    },
    {
      title: 'Disetujui',
      value: approvedCount,
      trend: pendingCount > 0 ? `${pendingCount} pending` : 'Semua beres',
      trendUp: pendingCount === 0,
      desc: 'Pendaftaran diterima',
      sub: pendingCount > 0 ? `${pendingCount} menunggu review` : 'Tidak ada yang pending',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar — desktop only */}
        <header className="hidden md:flex sticky top-0 z-30 h-12 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-border/60 bg-muted/30 text-sm text-muted-foreground w-56">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-auto text-[10px] border border-border/60 rounded px-1 py-0.5 bg-background font-mono">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/tournaments" className="hover:text-foreground transition-colors text-xs">Turnamen</Link>
            <Link href="/dashboard/teams" className="hover:text-foreground transition-colors text-xs">Tim</Link>
            <Link href="/dashboard/settings" className="hover:text-foreground transition-colors text-xs">Profil</Link>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground hover:text-foreground transition-colors ml-1">
              <Sun className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto pt-16 md:pt-4">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Selamat datang, {profile?.full_name || 'Gamer'} 👾
              </p>
            </div>
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/tournaments">
                <Trophy className="h-3.5 w-3.5" />
                Cari Turnamen
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-3 md:p-5 hover:border-border transition-colors">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                  <div className={`flex items-center gap-1 text-[11px] md:text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-amber-500'} shrink-0 ml-1`}>
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">{stat.trend}</span>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight tabular-nums mb-2 md:mb-3">
                  {stat.value}
                </div>
                <div className="pt-2 md:pt-3 border-t border-border/60">
                  <p className="text-[11px] md:text-xs font-medium text-foreground truncate">{stat.desc}</p>
                  <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

            {/* Teams Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Tim Saya</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Tim yang Anda kelola sebagai kapten</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <Link href="/dashboard/teams/create">
                    <Plus className="h-3.5 w-3.5" />
                    Buat Tim
                  </Link>
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Nama Tim</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-center">Anggota</span>
                <span className="w-8"></span>
              </div>

              {teams && teams.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {teams.map((team: any) => (
                    <Link
                      key={team.id}
                      href={`/dashboard/teams/${team.id}`}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/60">
                          {(team as any).logo_url ? (
                            <img src={(team as any).logo_url} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-foreground">{team.name[0].toUpperCase()}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                      </div>
                      <div className="w-20 flex justify-center">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {team.team_members?.[0]?.count || 0}
                        </span>
                      </div>
                      <div className="w-8 flex justify-end">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada tim</p>
                  <Button asChild size="sm" className="mt-3 h-7 text-xs gap-1.5">
                    <Link href="/dashboard/teams/create">
                      <Plus className="h-3.5 w-3.5" />
                      Buat Tim Pertama
                    </Link>
                  </Button>
                </div>
              )}

              {teams && teams.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{teams.length} tim</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Baris per halaman</span>
                    <span className="text-xs border border-border/60 rounded px-2 py-0.5 bg-background">10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Registrations Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Pendaftaran Turnamen</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Status pendaftaran tim Anda</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <Link href="/tournaments">
                    Cari Turnamen
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Turnamen</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-center">Tim</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-center">Status</span>
                <span className="w-8"></span>
              </div>

              {registrations && registrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {registrations.map((reg: any) => {
                    const config = statusConfig[reg.status]
                    const StatusIcon = config?.icon
                    return (
                      <div key={reg.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{reg.tournaments?.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">{reg.tournaments?.game}</Badge>
                          </div>
                        </div>
                        <div className="w-20 flex justify-center">
                          <span className="text-xs text-muted-foreground truncate max-w-[76px]">{reg.teams?.name}</span>
                        </div>
                        <div className="w-20 flex justify-center">
                          {config && (
                            <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          )}
                        </div>
                        <div className="w-8 flex justify-end">
                          <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada pendaftaran</p>
                  <Button asChild size="sm" className="mt-3 h-7 text-xs">
                    <Link href="/tournaments">Jelajahi Turnamen</Link>
                  </Button>
                </div>
              )}

              {registrations && registrations.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{registrations.length} pendaftaran</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Baris per halaman</span>
                    <span className="text-xs border border-border/60 rounded px-2 py-0.5 bg-background">10</span>
                    <span className="text-xs text-muted-foreground">Hal. 1 dari 1</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

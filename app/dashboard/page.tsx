import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Trophy, Users, Plus, ArrowRight, Gamepad2,
  Target, CircleCheck, Loader, AlertCircle,
  MoreHorizontal, Star, Swords,
  ChevronRight, Flame,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

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

  // Upcoming tournaments
  const { data: upcomingTournaments } = await supabase.from('tournaments')
    .select('*')
    .in('status', ['upcoming'])
    .order('start_date', { ascending: true })
    .limit(3)

  const approvedCount = registrations?.filter((r: any) => r.status === 'approved').length || 0
  const pendingCount  = registrations?.filter((r: any) => r.status === 'pending').length  || 0

  const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pending:   { label: 'Menunggu',   icon: Loader,       color: 'text-amber-500',        bg: 'bg-amber-500/10',        border: 'border-amber-500/20' },
    approved:  { label: 'Disetujui',  icon: CircleCheck,  color: 'text-emerald-500',      bg: 'bg-emerald-500/10',      border: 'border-emerald-500/20' },
    rejected:  { label: 'Ditolak',    icon: AlertCircle,  color: 'text-red-500',          bg: 'bg-red-500/10',          border: 'border-red-500/20' },
    withdrawn: { label: 'Dibatalkan', icon: AlertCircle,  color: 'text-muted-foreground', bg: 'bg-muted/40',            border: 'border-border/40' },
  }

  const stats = [
    {
      title: 'Tim Saya', value: teams?.length || 0,
      icon: Users, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-500', accent: 'border-l-blue-500',
      sub: 'Sebagai kapten', href: '/dashboard/teams',
    },
    {
      title: 'Tim Bergabung', value: memberTeams?.length || 0,
      icon: Gamepad2, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-500', accent: 'border-l-violet-500',
      sub: 'Sebagai anggota', href: '/dashboard/teams',
    },
    {
      title: 'Turnamen Didaftar', value: registrations?.length || 0,
      icon: Trophy, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-500', accent: 'border-l-amber-500',
      sub: 'Total pendaftaran', href: '/tournaments',
    },
    {
      title: 'Disetujui', value: approvedCount,
      icon: CircleCheck, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-500', accent: 'border-l-emerald-500',
      sub: pendingCount > 0 ? `${pendingCount} menunggu review` : 'Tidak ada yang pending', href: '/tournaments',
    },
  ]

  const firstName = profile?.full_name?.split(' ')[0] || 'Gamer'

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 pt-16 md:pt-6">

          {/* ── WELCOME BANNER ── */}
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-500/5 to-card p-6 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-4 right-6 opacity-10">
              <Gamepad2 className="h-24 w-24 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Player Dashboard</span>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Hei, {firstName}! 👾
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {registrations?.length
                    ? `Kamu sudah mendaftar ${registrations.length} turnamen. Terus semangat!`
                    : 'Belum ada turnamen yang kamu ikuti. Yuk mulai bertanding!'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button asChild variant="outline" size="sm" className="h-9 gap-2">
                  <Link href="/dashboard/teams/create">
                    <Users className="h-3.5 w-3.5" />
                    Buat Tim
                  </Link>
                </Button>
                <Button asChild size="sm" className="h-9 gap-2 shadow-md shadow-primary/20">
                  <Link href="/tournaments">
                    <Trophy className="h-3.5 w-3.5" />
                    Cari Turnamen
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Link key={i} href={stat.href}
                  className={`rounded-xl border border-border/60 border-l-2 ${stat.accent} bg-card p-5 hover:shadow-md hover:border-border transition-all duration-200 group`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-9 w-9 rounded-lg ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-4.5 w-4.5 ${stat.iconColor}`} style={{height:'18px', width:'18px'}} />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 truncate">{stat.sub}</p>
                </Link>
              )
            })}
          </div>

          {/* ── UPCOMING TOURNAMENTS ── */}
          {upcomingTournaments && upcomingTournaments.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Turnamen Mendatang</h2>
                    <p className="text-xs text-muted-foreground">Segera daftar sebelum slot habis!</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/tournaments">Lihat Semua <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">
                {upcomingTournaments.map((t: any) => (
                  <Link key={t.id} href={`/tournaments/${t.id}`}
                    className="flex flex-col gap-2 px-5 py-4 hover:bg-muted/20 transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{t.game}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{t.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{format(new Date(t.start_date), 'dd MMM yyyy', { locale: id })}</span>
                      {t.prize_pool && (
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Trophy className="h-3 w-3" />{t.prize_pool}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── TABLES ROW ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

            {/* My Teams */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Tim Saya</h2>
                    <p className="text-xs text-muted-foreground">Tim yang Anda kelola sebagai kapten</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/teams/create">
                    <Plus className="h-3.5 w-3.5" /> Buat Tim
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Tim</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 text-center">Anggota</span>
                <span className="w-7" />
              </div>

              {teams && teams.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {teams.map((team: any) => (
                    <Link key={team.id} href={`/dashboard/teams/${team.id}`}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {team.logo_url ? (
                            <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-blue-500">{team.name[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                          <p className="text-[10px] text-muted-foreground">Kapten</p>
                        </div>
                      </div>
                      <div className="w-20 flex justify-center">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {team.team_members?.[0]?.count || 0}
                        </span>
                      </div>
                      <div className="w-7 flex justify-end">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Belum ada tim</p>
                  <p className="text-xs text-muted-foreground">Buat tim pertama Anda untuk mulai berkompetisi</p>
                  <Button asChild size="sm" className="mt-2 h-8 text-xs gap-1.5">
                    <Link href="/dashboard/teams/create">
                      <Plus className="h-3.5 w-3.5" /> Buat Tim Pertama
                    </Link>
                  </Button>
                </div>
              )}

              {teams && teams.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{teams.length} tim ditampilkan</p>
                  <Link href="/dashboard/teams" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Kelola tim <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Registrations */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Pendaftaran Turnamen</h2>
                    <p className="text-xs text-muted-foreground">Status pendaftaran tim Anda</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/tournaments">Cari Turnamen <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Turnamen / Tim</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center">Status</span>
                <span className="w-7" />
              </div>

              {registrations && registrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {registrations.map((reg: any) => {
                    const cfg = statusConfig[reg.status]
                    const StatusIcon = cfg?.icon
                    return (
                      <div key={reg.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{reg.tournaments?.name}</p>
                            <p className="text-[10px] text-muted-foreground">{reg.tournaments?.game} • {reg.teams?.name}</p>
                          </div>
                        </div>
                        <div className="w-24 flex justify-center">
                          {cfg && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                          )}
                        </div>
                        <div className="w-7 flex justify-end">
                          <button className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-amber-500/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Belum ada pendaftaran</p>
                  <p className="text-xs text-muted-foreground">Jelajahi turnamen dan daftarkan tim Anda</p>
                  <Button asChild size="sm" className="mt-2 h-8 text-xs gap-1.5">
                    <Link href="/tournaments">
                      <Trophy className="h-3.5 w-3.5" /> Jelajahi Turnamen
                    </Link>
                  </Button>
                </div>
              )}

              {registrations && registrations.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{registrations.length} pendaftaran ditampilkan</p>
                  <Link href="/tournaments" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Lihat turnamen <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
    </main>
  )
}

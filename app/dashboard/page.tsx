import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Users, 
  Calendar,
  Plus,
  ArrowRight,
  Gamepad2,
  Clock,
  Target,
  Star,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { UserSidebar } from '@/components/user/sidebar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: teams } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .eq('captain_id', user.id)

  const { data: memberTeams } = await supabase
    .from('team_members')
    .select('*, teams(*)')
    .eq('user_id', user.id)

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(*), teams(name)')
    .eq('registered_by', user.id)
    .order('registered_at', { ascending: false })
    .limit(5)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    withdrawn: 'bg-muted text-muted-foreground border-border',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', withdrawn: 'Dibatalkan',
  }

  const approvedRegistrations = registrations?.filter((r: any) => r.status === 'approved') || []

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Dashboard</span>
            </nav>
          </div>
          <Button asChild size="sm" className="h-9 gap-2 shadow-sm">
            <Link href="/tournaments">
              <Trophy className="h-4 w-4" />
              Cari Turnamen
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-xl font-bold text-primary">
                    {(profile?.full_name || 'G')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selamat Datang</p>
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.full_name || 'Gamer'} 👾
                  </h1>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Kelola tim dan daftar turnamen gaming favorit Anda. Jadilah yang terdepan!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Tim Anda', value: teams?.length || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/dashboard/teams/create', cta: 'Buat Tim' },
              { label: 'Tim Bergabung', value: memberTeams?.length || 0, icon: Gamepad2, color: 'text-violet-500', bg: 'bg-violet-500/10', href: '/teams', cta: 'Temukan Tim' },
              { label: 'Turnamen Didaftar', value: registrations?.length || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/tournaments', cta: 'Daftar Sekarang' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={i} className="border-border/60 hover:border-border hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{stat.value}</div>
                    <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
                    <Link href={stat.href} className={`text-xs ${stat.color} flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {stat.cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Teams */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Tim Saya</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Tim yang Anda kelola sebagai kapten</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                  <Link href="/dashboard/teams/create">
                    <Plus className="h-3.5 w-3.5" />
                    Buat Tim
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {teams && teams.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {teams.map((team: any) => (
                      <Link
                        key={team.id}
                        href={`/dashboard/teams/${team.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group/item"
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary transition-colors">
                          <span className="text-sm font-bold text-primary group-hover/item:text-primary-foreground transition-colors">
                            {team.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.team_members?.[0]?.count || 0} anggota
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/item:text-muted-foreground transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum Ada Tim</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Buat tim untuk mulai berkompetisi</p>
                    <Button asChild size="sm" className="h-8 text-xs">
                      <Link href="/dashboard/teams/create">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Buat Tim Pertama
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Registrations */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Pendaftaran Terakhir</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Status pendaftaran turnamen Anda</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/tournaments">
                    Cari Turnamen
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {registrations && registrations.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {registrations.map((reg: any) => (
                      <div
                        key={reg.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{reg.tournaments?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="truncate">{reg.teams?.name}</span>
                            <span>·</span>
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="shrink-0">{format(new Date(reg.registered_at), 'dd MMM', { locale: id })}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`shrink-0 text-[11px] font-medium ${statusColors[reg.status]}`}>
                          {statusLabels[reg.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum Ada Pendaftaran</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Daftar turnamen sekarang dan buktikan skill Anda!</p>
                    <Button asChild size="sm" className="h-8 text-xs">
                      <Link href="/tournaments">
                        <Trophy className="h-3.5 w-3.5 mr-1.5" />
                        Jelajahi Turnamen
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Approved Tournaments */}
          {approvedRegistrations.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Turnamen Disetujui</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Turnamen yang sudah Anda daftarkan dan disetujui</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {approvedRegistrations.map((reg: any) => (
                    <div key={reg.id} className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-[10px]">{reg.tournaments?.game}</Badge>
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">Disetujui</Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-2 line-clamp-1">{reg.tournaments?.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(reg.tournaments?.start_date), 'dd MMMM yyyy', { locale: id })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

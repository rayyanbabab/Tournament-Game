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
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminPageHeader } from '@/components/admin/page-header'
import { DashboardCharts } from '@/components/admin/dashboard-charts'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { count: totalTournaments } = await supabase
    .from('tournaments').select('*', { count: 'exact', head: true })
  const { count: totalTeams } = await supabase
    .from('teams').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
  const { count: pendingRegistrations } = await supabase
    .from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const { data: allRegistrations } = await supabase.from('tournament_registrations').select('status')
  const regCounts = allRegistrations?.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {}) || {}

  const registrationsChartData = [
    { name: 'Menunggu', value: regCounts.pending || 0 },
    { name: 'Disetujui', value: regCounts.approved || 0 },
    { name: 'Ditolak', value: regCounts.rejected || 0 },
  ]

  const { data: allTournaments } = await supabase.from('tournaments').select('game')
  const gameCounts = allTournaments?.reduce((acc: any, curr) => {
    const game = curr.game || 'Lainnya'
    acc[game] = (acc[game] || 0) + 1
    return acc
  }, {}) || {}
  const tournamentsByGameData = Object.keys(gameCounts).map(key => ({ name: key, value: gameCounts[key] }))

  const { data: recentRegistrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(name, game), teams(name), profiles:registered_by(full_name, email)')
    .order('registered_at', { ascending: false })
    .limit(5)

  const { data: recentTournaments } = await supabase
    .from('tournaments').select('*').order('created_at', { ascending: false }).limit(5)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    withdrawn: 'bg-muted text-muted-foreground border-border',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', withdrawn: 'Dibatalkan',
  }

  const stats = [
    {
      title: 'Total Turnamen',
      value: totalTournaments || 0,
      icon: Trophy,
      desc: 'Turnamen terdaftar',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: '+12%',
    },
    {
      title: 'Total Tim',
      value: totalTeams || 0,
      icon: Users,
      desc: 'Tim aktif di platform',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      trend: '+8%',
    },
    {
      title: 'Total Pengguna',
      value: totalUsers || 0,
      icon: Gamepad2,
      desc: 'Pengguna terdaftar',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: '+24%',
    },
    {
      title: 'Pending Review',
      value: pendingRegistrations || 0,
      icon: AlertCircle,
      desc: 'Perlu diproses segera',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: '',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Live Dashboard</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground leading-none">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-sm font-bold text-primary">
                {(profile?.full_name || 'A')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <AdminPageHeader
            title="Dashboard"
            description="Pantau dan kelola seluruh aktivitas platform GameArena"
            actions={
              <Button asChild size="sm" className="h-9 gap-2 shadow-sm">
                <Link href="/admin/tournaments/create">
                  <Plus className="h-4 w-4" />
                  Buat Turnamen
                </Link>
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={i} className="relative overflow-hidden border-border/60 hover:border-border transition-all duration-200 hover:shadow-md group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} shrink-0`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      {stat.trend && (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                          <TrendingUp className="h-3 w-3" />
                          {stat.trend}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                        {stat.value.toLocaleString()}
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{stat.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
                    </div>
                  </CardContent>
                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </Card>
              )
            })}
          </div>

          {/* Charts */}
          <DashboardCharts
            registrationsData={registrationsChartData}
            tournamentsByGameData={tournamentsByGameData}
          />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Pendaftaran Terbaru</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Memerlukan persetujuan admin</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/admin/registrations">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentRegistrations && recentRegistrations.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {recentRegistrations.map((reg: any) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{reg.teams?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {reg.tournaments?.name} · {format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-3 shrink-0 text-[11px] font-medium ${statusColors[reg.status]}`}
                        >
                          {statusLabels[reg.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Semua sudah diproses</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Tidak ada pendaftaran baru</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tournaments */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Turnamen Terbaru</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Turnamen yang baru dibuat</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/admin/tournaments">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentTournaments && recentTournaments.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {recentTournaments.map((tournament: any) => (
                      <Link
                        key={tournament.id}
                        href={`/admin/tournaments/${tournament.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary transition-colors">
                          <Trophy className="h-4 w-4 text-primary group-hover/item:text-primary-foreground transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{tournament.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{tournament.game}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover/item:text-muted-foreground shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Belum ada turnamen</p>
                    <Button asChild size="sm" className="mt-4 h-8 text-xs">
                      <Link href="/admin/tournaments/create">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Buat Sekarang
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

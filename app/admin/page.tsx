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
  Clock,
  Shield,
  Gamepad2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { DashboardCharts } from '@/components/admin/dashboard-charts'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get stats
  const { count: totalTournaments } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact', head: true })

  const { count: totalTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: pendingRegistrations } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Data for charts
  const { data: allRegistrations } = await supabase
    .from('tournament_registrations')
    .select('status')

  const regCounts = allRegistrations?.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {}) || {}

  const registrationsChartData = [
    { name: 'Menunggu', value: regCounts.pending || 0 },
    { name: 'Disetujui', value: regCounts.approved || 0 },
    { name: 'Ditolak', value: regCounts.rejected || 0 },
  ]

  const { data: allTournaments } = await supabase
    .from('tournaments')
    .select('game')

  const gameCounts = allTournaments?.reduce((acc: any, curr) => {
    const game = curr.game || 'Lainnya'
    acc[game] = (acc[game] || 0) + 1
    return acc
  }, {}) || {}

  const tournamentsByGameData = Object.keys(gameCounts).map(key => ({
    name: key,
    value: gameCounts[key]
  }))

  // Get recent registrations
  const { data: recentRegistrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      tournaments(name, game),
      teams(name),
      profiles:registered_by(full_name, email)
    `)
    .order('registered_at', { ascending: false })
    .limit(5)

  // Get recent tournaments
  const { data: recentTournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    withdrawn: 'bg-muted text-muted-foreground border-border',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    withdrawn: 'Dibatalkan',
  }

  return (
    <div className="min-h-screen flex bg-background/95">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Kelola turnamen dan pantau statistik platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300">
              <Link href="/admin/tournaments/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Turnamen
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-sm">
          {[
            { title: "Total Turnamen", value: totalTournaments || 0, icon: Trophy, desc: "Turnamen tercatat di sistem" },
            { title: "Total Tim", value: totalTeams || 0, icon: Users, desc: "Tim yang telah mendaftar" },
            { title: "Total Pengguna", value: totalUsers || 0, icon: Gamepad2, desc: "Pengguna platform aktif" },
            { title: "Menunggu Persetujuan", value: pendingRegistrations || 0, icon: AlertCircle, desc: "Pendaftaran perlu diproses" },
          ].map((stat, i) => (
            <Card key={i} data-slot="card">
              <CardHeader>
                <CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground shadow-sm">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardTitle>
                <CardDescription className="mt-2 font-medium text-foreground">{stat.title}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
                </div>
                <p className="text-muted-foreground text-xs mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <DashboardCharts 
          registrationsData={registrationsChartData} 
          tournamentsByGameData={tournamentsByGameData} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Registrations */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-sm overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-secondary/20 pb-4">
              <div>
                <CardTitle className="text-lg">Pendaftaran Terbaru</CardTitle>
                <CardDescription>Pendaftaran yang memerlukan persetujuan</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                <Link href="/admin/registrations">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentRegistrations && recentRegistrations.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentRegistrations.map((reg: any) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {reg.teams?.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] font-normal">{reg.tournaments?.name}</Badge>
                          <span className="text-xs">{format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}</span>
                        </div>
                      </div>
                      <Badge className={`${statusColors[reg.status]} ml-4 rounded-full px-3`}>
                        {statusLabels[reg.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Tidak ada pendaftaran baru</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tournaments */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-sm overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-secondary/20 pb-4">
              <div>
                <CardTitle className="text-lg">Turnamen Terbaru</CardTitle>
                <CardDescription>Turnamen yang baru dibuat</CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-primary/10 transition-colors">
                <Link href="/admin/tournaments">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentTournaments && recentTournaments.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentTournaments.map((tournament: any) => (
                    <Link
                      key={tournament.id}
                      href={`/admin/tournaments/${tournament.id}`}
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group/item"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-300">
                          <Trophy className="h-5 w-5 text-primary group-hover/item:text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{tournament.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Badge variant="secondary" className="text-[10px] font-normal">{tournament.game}</Badge>
                            <span className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3"/> {format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform translate-x-2 group-hover/item:translate-x-0">
                        <ArrowRight className="h-4 w-4 text-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium mb-4">Belum ada turnamen</p>
                  <Button asChild className="rounded-full shadow-lg">
                    <Link href="/admin/tournaments/create">Buat Turnamen Pertama</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

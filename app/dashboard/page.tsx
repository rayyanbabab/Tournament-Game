import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
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
  Gamepad2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function DashboardPage() {
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

  // Get user's teams
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      team_members(count)
    `)
    .eq('captain_id', user.id)

  // Get teams user is member of
  const { data: memberTeams } = await supabase
    .from('team_members')
    .select(`
      *,
      teams(*)
    `)
    .eq('user_id', user.id)

  // Get user's registrations
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      tournaments(*),
      teams(name)
    `)
    .eq('registered_by', user.id)
    .order('registered_at', { ascending: false })
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Selamat Datang, {profile?.full_name || 'Gamer'}!
            </h1>
            <p className="text-muted-foreground">Kelola tim dan pendaftaran turnamen Anda</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{teams?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Tim Anda</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{memberTeams?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Tim Bergabung</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{registrations?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Pendaftaran</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Teams */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tim Saya</CardTitle>
                  <CardDescription>Tim yang Anda kelola sebagai kapten</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/dashboard/teams/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Tim
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map((team: any) => (
                      <Link
                        key={team.id}
                        href={`/dashboard/teams/${team.id}`}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{team.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {team.team_members?.[0]?.count || 0} anggota
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Anda belum memiliki tim</p>
                    <Button asChild>
                      <Link href="/dashboard/teams/create">Buat Tim Pertama Anda</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Registrations */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pendaftaran Terakhir</CardTitle>
                  <CardDescription>Status pendaftaran turnamen Anda</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/registrations">
                    Lihat Semua
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {registrations && registrations.length > 0 ? (
                  <div className="space-y-3">
                    {registrations.map((reg: any) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {reg.tournaments?.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Tim: {reg.teams?.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </div>
                        <Badge className={statusColors[reg.status]}>
                          {statusLabels[reg.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Belum ada pendaftaran turnamen</p>
                    <Button asChild>
                      <Link href="/tournaments">Jelajahi Turnamen</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Tournaments */}
          <Card className="border-border/50 mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Turnamen Mendatang Anda</CardTitle>
                <CardDescription>Turnamen yang sudah Anda daftarkan</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {registrations && registrations.filter((r: any) => r.status === 'approved').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {registrations
                    .filter((r: any) => r.status === 'approved')
                    .map((reg: any) => (
                      <Card key={reg.id} className="border-border/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Gamepad2 className="h-5 w-5 text-primary" />
                            </div>
                            <Badge variant="secondary">{reg.tournaments?.game}</Badge>
                          </div>
                          <p className="font-medium text-foreground mb-2">{reg.tournaments?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(reg.tournaments?.start_date), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada turnamen yang disetujui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

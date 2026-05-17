import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  FileText,
  Gamepad2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { UpdateStatusButton } from './update-status-button'
import { RegistrationActions } from './registration-actions'
import { getTournamentStatus } from '@/lib/utils'
import { DeleteTournamentButton } from './delete-tournament-button'
import { Edit } from 'lucide-react'

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tournamentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Get registrations
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      teams(id, name, team_members(count)),
      profiles:registered_by(full_name, email)
    `)
    .eq('tournament_id', tournamentId)
    .order('registered_at', { ascending: false })

  const statusColors: Record<string, string> = {
    upcoming: 'bg-primary/10 text-primary border-primary/20',
    registration_closed: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    ongoing: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const statusLabels: Record<string, string> = {
    upcoming: 'Pendaftaran Buka',
    registration_closed: 'Pendaftaran Tutup',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  const regStatusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    withdrawn: 'bg-muted text-muted-foreground border-border',
  }

  const regStatusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    withdrawn: 'Dibatalkan',
  }

  const approvedCount = registrations?.filter(r => r.status === 'approved').length || 0
  const pendingCount = registrations?.filter(r => r.status === 'pending').length || 0

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Turnamen
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{tournament.game}</Badge>
                    <Badge className={statusColors[getTournamentStatus(tournament)]}>
                      {statusLabels[getTournamentStatus(tournament)]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                      <Link href={`/admin/tournaments/${tournament.id}/bracket`}>
                        <Trophy className="h-4 w-4" />
                        Bracket
                      </Link>
                    </Button>
                    <DeleteTournamentButton tournamentId={tournament.id} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                <CardDescription>
                  {tournament.description || 'Tidak ada deskripsi'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Mulai</p>
                    <p className="text-sm font-medium">{format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Selesai</p>
                    <p className="text-sm font-medium">{format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: id })}</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Tim</p>
                    <p className="text-sm font-medium">{tournament.team_size} pemain</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <Trophy className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Hadiah</p>
                    <p className="text-sm font-medium">{tournament.prize_pool || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registrations */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Pendaftaran Tim</CardTitle>
                <CardDescription>
                  {approvedCount} dari {tournament.max_teams} slot terisi • {pendingCount} menunggu persetujuan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registrations && registrations.length > 0 ? (
                  <div className="space-y-3">
                    {registrations.map((reg: any) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{reg.teams?.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{reg.teams?.team_members?.[0]?.count || 0} anggota</span>
                              <span>•</span>
                              <span>{format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={regStatusColors[reg.status]}>
                            {regStatusLabels[reg.status]}
                          </Badge>
                          {reg.status === 'pending' && (
                            <RegistrationActions registrationId={reg.id} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Belum ada pendaftaran</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Info Turnamen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Batas Pendaftaran</p>
                  <p className="font-medium">
                    {format(new Date(tournament.registration_deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slot Tersedia</p>
                  <p className="font-medium">
                    {tournament.max_teams - approvedCount} dari {tournament.max_teams}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">
                    {format(new Date(tournament.created_at), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {tournament.rules && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Peraturan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {tournament.rules}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

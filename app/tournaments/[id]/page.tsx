import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Calendar, Clock, Gamepad2, ArrowLeft, FileText, Banknote, MapPin, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { RegisterTournamentButton } from './register-button'
import { getTournamentStatus } from '@/lib/utils'

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles:created_by (full_name, email)
    `)
    .eq('id', tournamentId)
    .single()

  if (error || !tournament) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  let userTeams: { id: string; name: string }[] = []
  let existingRegistration = null

  if (user) {
    // Get user's teams where they are captain
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('captain_id', user.id)

    userTeams = teams || []

    // Check if user's team already registered
    if (userTeams.length > 0) {
      const teamIds = userTeams.map(t => t.id)
      const { data: registration } = await supabase
        .from('tournament_registrations')
        .select('*, teams(name)')
        .eq('tournament_id', tournamentId)
        .in('team_id', teamIds)
        .single()

      existingRegistration = registration
    }
  }

  // Get registration count
  const { count: registrationCount } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .in('status', ['pending', 'approved'])

  const statusColors: Record<string, string> = {
    upcoming: 'bg-primary/10 text-primary border-primary/20',
    registration_closed: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    ongoing: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const statusLabels: Record<string, string> = {
    upcoming: 'Pendaftaran Dibuka',
    registration_closed: 'Pendaftaran Ditutup',
    ongoing: 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  const currentStatus = getTournamentStatus(tournament);
  const isRegistrationOpen = currentStatus === 'upcoming';

  const slotsRemaining = tournament.max_teams - (registrationCount || 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/tournaments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Turnamen
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 overflow-hidden">
                {tournament.image_url ? (
                  <div className="w-full max-h-[400px] bg-muted/30 flex items-center justify-center border-b border-border/50">
                    <img src={tournament.image_url} alt={tournament.name} className="w-full h-full max-h-[400px] object-contain p-2" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-border/50">
                    <Gamepad2 className="h-24 w-24 text-primary/50" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{tournament.game}</Badge>
                    <Badge className={statusColors[currentStatus]}>
                      {statusLabels[currentStatus]}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                  <CardDescription>
                    {tournament.description || 'Turnamen seru dengan hadiah menarik!'}
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
                      <p className="text-sm font-medium">{tournament.team_size} pemain/tim</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <Trophy className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">Hadiah</p>
                      <p className="text-sm font-medium">{tournament.prize_pool || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors rounded-lg border border-border/50">
                      <Banknote className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">Biaya Pendaftaran</p>
                      <p className="text-sm font-medium text-primary">{tournament.registration_fee || 'Gratis'}</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors rounded-lg border border-border/50">
                      <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                      <p className="text-sm font-medium">{tournament.location || '-'}</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors rounded-lg border border-border/50 col-span-2 md:col-span-1">
                      <Phone className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">Info Kontak</p>
                      <p className="text-sm font-medium">{tournament.contact_info || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rules */}
              {tournament.rules && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Peraturan Turnamen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                      {tournament.rules}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card className="border-border/50 sticky top-24">
                <CardHeader>
                  <CardTitle>Pendaftaran</CardTitle>
                  <CardDescription>
                    Batas: {format(new Date(tournament.registration_deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Slot tersedia</span>
                    <span className="font-semibold text-foreground">
                      {slotsRemaining > 0 ? `${slotsRemaining} dari ${tournament.max_teams}` : 'Penuh'}
                    </span>
                  </div>

                  {existingRegistration ? (
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <p className="text-sm font-medium text-primary mb-1">
                        Tim Anda Sudah Terdaftar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tim: {existingRegistration.teams?.name}
                      </p>
                      <Badge className="mt-2" variant={
                        existingRegistration.status === 'approved' ? 'default' :
                        existingRegistration.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {existingRegistration.status === 'approved' ? 'Disetujui' :
                         existingRegistration.status === 'rejected' ? 'Ditolak' :
                         existingRegistration.status === 'pending' ? 'Menunggu' : existingRegistration.status}
                      </Badge>
                    </div>
                  ) : !user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        Silakan login untuk mendaftar turnamen
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Login untuk Mendaftar</Link>
                      </Button>
                    </div>
                  ) : userTeams.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        Anda belum memiliki tim. Buat tim terlebih dahulu.
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/dashboard/teams/create">Buat Tim</Link>
                      </Button>
                    </div>
                  ) : !isRegistrationOpen ? (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Pendaftaran telah ditutup
                      </p>
                    </div>
                  ) : slotsRemaining <= 0 ? (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Slot pendaftaran sudah penuh
                      </p>
                    </div>
                  ) : (
                    <RegisterTournamentButton
                      tournamentId={tournament.id}
                      teams={userTeams}
                      teamSize={tournament.team_size}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

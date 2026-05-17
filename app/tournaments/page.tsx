import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trophy, Users, Calendar, Gamepad2, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; game?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Sync status berdasarkan tanggal setiap halaman dimuat
  try { await supabase.rpc('sync_tournament_statuses') } catch { }

  let query = supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: true })

  if (params.status && params.status !== 'all') {
    const now = new Date().toISOString();
    if (params.status === 'upcoming') {
      query = query.gt('start_date', now)
    } else if (params.status === 'ongoing') {
      query = query.lte('start_date', now).gte('end_date', now)
    } else if (params.status === 'completed') {
      query = query.lt('end_date', now)
    }
  }

  if (params.game) {
    query = query.ilike('game', `%${params.game}%`)
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data: tournaments } = await query

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Daftar Turnamen</h1>
            <p className="text-muted-foreground">Temukan dan daftar turnamen game favoritmu</p>
          </div>

          {/* Filters */}
          <Card className="border-border/50 mb-8">
            <CardContent className="py-4">
              <form className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Cari turnamen..."
                    defaultValue={params.search || ''}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={!params.status || params.status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link href="/tournaments">Semua</Link>
                  </Button>
                  <Button
                    variant={params.status === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link href="/tournaments?status=upcoming">Segera</Link>
                  </Button>
                  <Button
                    variant={params.status === 'ongoing' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link href="/tournaments?status=ongoing">Berlangsung</Link>
                  </Button>
                  <Button
                    variant={params.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link href="/tournaments?status=completed">Selesai</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tournament Grid */}
          {tournaments && tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament: Tournament) => (
                <Card key={tournament.id} className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
                  {tournament.image_url ? (
                    <div className="h-40 relative overflow-hidden bg-muted/30 p-2">
                      <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Gamepad2 className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{tournament.game}</Badge>
                      <Badge className={statusColors[getTournamentStatus(tournament)]}>
                        {statusLabels[getTournamentStatus(tournament)]}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {tournament.description || 'Turnamen seru dengan hadiah menarik!'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: id })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {tournament.max_teams} tim ({tournament.team_size} pemain/tim)</span>
                      </div>
                      {tournament.prize_pool && (
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <Trophy className="h-4 w-4" />
                          <span>{tournament.prize_pool}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/tournaments/${tournament.id}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center">
                <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Tidak Ada Turnamen</h3>
                <p className="text-muted-foreground">
                  {params.search || params.status
                    ? 'Tidak ada turnamen yang sesuai dengan filter Anda.'
                    : 'Belum ada turnamen yang tersedia saat ini.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

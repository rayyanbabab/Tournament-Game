import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Plus,
  Calendar,
  Users,
  Gamepad2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { getTournamentStatus } from '@/lib/utils'

export default async function AdminTournamentsPage() {
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

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

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
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Turnamen</h1>
            <p className="text-muted-foreground">Buat dan kelola turnamen game online</p>
          </div>
          <Button asChild>
            <Link href="/admin/tournaments/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Turnamen
            </Link>
          </Button>
        </div>

        {tournaments && tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament: any) => (
              <Card key={tournament.id} className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
                {tournament.image_url ? (
                  <div className="h-32 relative overflow-hidden bg-muted/30 p-2">
                    <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Gamepad2 className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{tournament.game}</Badge>
                    <Badge className={statusColors[getTournamentStatus(tournament)]}>
                      {statusLabels[getTournamentStatus(tournament)]}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Max {tournament.max_teams} tim</span>
                    </div>
                    {tournament.prize_pool && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Trophy className="h-4 w-4" />
                        <span>{tournament.prize_pool}</span>
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/tournaments/${tournament.id}`}>
                      Kelola
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Turnamen</h3>
              <p className="text-muted-foreground mb-6">Buat turnamen pertama Anda sekarang</p>
              <Button asChild>
                <Link href="/admin/tournaments/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Turnamen
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Plus,
  Calendar,
  Users,
  Gamepad2,
  Search,
  ArrowRight,
  Edit,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminPageHeader } from '@/components/admin/page-header'
import { getTournamentStatus } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminTournamentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_registrations(count)')
    .order('created_at', { ascending: false })

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    upcoming: { label: 'Pendaftaran Buka', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', dot: 'bg-blue-500' },
    registration_closed: { label: 'Pendaftaran Tutup', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
    ongoing: { label: 'Berlangsung', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    completed: { label: 'Selesai', color: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <nav className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Kelola Turnamen</span>
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-4">
          <AdminPageHeader
            title="Kelola Turnamen"
            description="Buat, edit, dan kelola semua turnamen game online"
            breadcrumbs={[{ label: 'Turnamen' }]}
            actions={
              <Button asChild size="sm" className="h-9 gap-2 shadow-sm">
                <Link href="/admin/tournaments/create">
                  <Plus className="h-4 w-4" />
                  Buat Turnamen
                </Link>
              </Button>
            }
          />

          {tournaments && tournaments.length > 0 ? (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Turnamen</span>
                <span className="text-center w-28">Status</span>
                <span className="text-center w-20">Tim</span>
                <span className="text-center w-32">Mulai</span>
                <span className="text-center w-20">Aksi</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border/60 bg-background">
                {tournaments.map((tournament: any) => {
                  const status = getTournamentStatus(tournament)
                  const config = statusConfig[status]
                  const regCount = tournament.tournament_registrations?.[0]?.count || 0

                  return (
                    <div
                      key={tournament.id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors group"
                    >
                      {/* Tournament Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {tournament.image_url ? (
                            <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="h-5 w-5 text-primary/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{tournament.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">{tournament.game}</Badge>
                            {tournament.prize_pool && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {tournament.prize_pool}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="w-28 flex justify-center">
                        <Badge variant="outline" className={`text-[11px] font-medium ${config.color} flex items-center gap-1.5`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
                          {config.label}
                        </Badge>
                      </div>

                      {/* Teams */}
                      <div className="w-20 flex justify-center">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{regCount}/{tournament.max_teams}</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="w-32 flex justify-center">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-20 flex justify-center gap-1">
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/admin/tournaments/${tournament.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <Trophy className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Turnamen</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Mulai buat turnamen pertama Anda dan undang para gamer untuk berkompetisi!
                </p>
                <Button asChild className="h-9 gap-2">
                  <Link href="/admin/tournaments/create">
                    <Plus className="h-4 w-4" />
                    Buat Turnamen Pertama
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

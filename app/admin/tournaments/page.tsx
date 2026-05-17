import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Trophy, Plus, Calendar, Users, Gamepad2, ArrowRight, Edit, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { getTournamentStatus } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

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
    upcoming:             { label: 'Pendaftaran Buka',  color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',     dot: 'bg-blue-500' },
    registration_closed:  { label: 'Pendaftaran Tutup', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',   dot: 'bg-amber-500' },
    ongoing:              { label: 'Berlangsung',        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    completed:            { label: 'Selesai',            color: 'bg-muted text-muted-foreground border-border',        dot: 'bg-muted-foreground' },
    cancelled:            { label: 'Dibatalkan',         color: 'bg-red-500/10 text-red-600 border-red-500/20',        dot: 'bg-red-500' },
  }

  const totalActive = tournaments?.filter(t => ['upcoming','ongoing'].includes(getTournamentStatus(t))).length || 0

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Kelola Turnamen</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Button asChild size="sm" className="h-8 gap-2 shadow-sm shadow-primary/20">
              <Link href="/admin/tournaments/create">
                <Plus className="h-3.5 w-3.5" />
                Buat Turnamen
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* Page Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Kelola Turnamen</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tournaments?.length || 0} total turnamen &bull; <span className="text-emerald-500 font-medium">{totalActive} aktif</span>
              </p>
            </div>
          </div>

          {/* Tournaments Table */}
          {tournaments && tournaments.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/20 border-b border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Turnamen</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-32">Status</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-20">Tim</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-28">Mulai</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-20">Aksi</span>
              </div>

              <div className="divide-y divide-border/40">
                {tournaments.map((tournament: any) => {
                  const status = getTournamentStatus(tournament)
                  const config = statusConfig[status] ?? statusConfig.completed
                  const regCount = tournament.tournament_registrations?.[0]?.count || 0
                  const fillPct = tournament.max_teams > 0
                    ? Math.round((regCount / tournament.max_teams) * 100)
                    : 0

                  return (
                    <div key={tournament.id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors group">

                      {/* Tournament Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {tournament.image_url ? (
                            <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
                          ) : (
                            <Trophy className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{tournament.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded">
                              {tournament.game}
                            </span>
                            {tournament.prize_pool && (
                              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                                <Trophy className="h-2.5 w-2.5" />{tournament.prize_pool}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="w-32 flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
                          {config.label}
                        </span>
                      </div>

                      {/* Teams / Slot */}
                      <div className="w-20 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-foreground tabular-nums">{regCount}/{tournament.max_teams}</span>
                        <div className="w-14 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>

                      {/* Date */}
                      <div className="w-28 flex justify-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tournament.start_date), 'dd MMM yy', { locale: id })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="w-20 flex justify-center gap-1">
                        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-primary">
                          <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-primary">
                          <Link href={`/admin/tournaments/${tournament.id}`}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{tournaments.length} turnamen ditampilkan</p>
                <span className="text-xs text-muted-foreground">{totalActive} sedang aktif</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-500/40" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Belum Ada Turnamen</p>
                <p className="text-sm text-muted-foreground mt-1">Buat turnamen pertama dan undang para gamer!</p>
              </div>
              <Button asChild className="mt-2 gap-2">
                <Link href="/admin/tournaments/create">
                  <Plus className="h-4 w-4" />
                  Buat Turnamen Pertama
                </Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

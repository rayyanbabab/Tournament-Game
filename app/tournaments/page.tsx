import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Users, Calendar, Gamepad2, MapPin, Banknote, Search, Swords } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'
import { TournamentFilters } from '@/components/tournament-filters'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Daftar Turnamen | GameArena',
  description: 'Temukan dan daftar turnamen gaming favoritmu di GameArena',
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; game?: string; search?: string; location?: string; prize?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  try { await supabase.rpc('sync_tournament_statuses') } catch { }

  const { data: allForFilters } = await supabase.from('tournaments').select('game, location')
  const games: string[] = Array.from(new Set<string>((allForFilters ?? []).map((t: any) => t.game).filter(Boolean))).sort()
  const locations: string[] = Array.from(new Set<string>((allForFilters ?? []).map((t: any) => t.location).filter(Boolean))).sort()

  let query = supabase.from('tournaments').select('*').order('start_date', { ascending: true })

  if (params.status && params.status !== 'all') {
    const now = new Date().toISOString()
    if (params.status === 'upcoming')  query = query.gt('start_date', now)
    if (params.status === 'ongoing')   query = query.lte('start_date', now).gte('end_date', now)
    if (params.status === 'completed') query = query.lt('end_date', now)
  }
  if (params.game)     query = query.ilike('game', `%${params.game}%`)
  if (params.search)   query = query.ilike('name', `%${params.search}%`)
  if (params.location) query = query.ilike('location', `%${params.location}%`)
  if (params.prize === 'has')  query = query.not('prize_pool', 'is', null)
  if (params.prize === 'free') query = query.is('registration_fee', null)

  const { data: tournaments } = await query

  // Fetch approved registration counts for all fetched tournaments at once
  const tournamentIds = (tournaments ?? []).map((t: any) => t.id)
  const { data: regCounts } = tournamentIds.length > 0
    ? await supabase
        .from('tournament_registrations')
        .select('tournament_id')
        .in('tournament_id', tournamentIds)
        .in('status', ['pending', 'approved'])
    : { data: [] }

  // Build a map: tournamentId -> count
  const countMap: Record<string, number> = {}
  ;(regCounts ?? []).forEach((r: any) => {
    countMap[r.tournament_id] = (countMap[r.tournament_id] ?? 0) + 1
  })

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    upcoming:             { label: 'Pendaftaran Buka',  color: 'bg-primary/10 text-primary border-primary/20',             dot: 'bg-primary' },
    registration_closed:  { label: 'Slot Penuh',         color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',       dot: 'bg-amber-500' },
    ongoing:              { label: 'Berlangsung',        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    completed:            { label: 'Selesai',            color: 'bg-muted text-muted-foreground border-border',             dot: 'bg-muted-foreground' },
    cancelled:            { label: 'Dibatalkan',         color: 'bg-red-500/10 text-red-600 border-red-500/20',            dot: 'bg-red-500' },
  }

  const isFiltered = !!(params.search || params.status || params.game || params.location || params.prize)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Header Banner ── */}
      <div className="border-b border-border bg-card/50 py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 inline-block">
              Kompetisi Resmi
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Daftar Turnamen Esports
            </h1>
            <p className="text-sm text-muted-foreground">
              Jelajahi turnamen game aktif, filter berdasarkan cabang atau lokasi, dan daftarkan tim Anda sekarang.
            </p>

            {/* Quick stats strip */}
            <div className="flex items-center gap-6 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Trophy className="h-4 w-4 text-amber-500" />
                <strong className="tabular-nums">{tournaments?.length ?? 0}</strong> Turnamen
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <strong className="tabular-nums">{games.length}</strong> Cabang Game
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Filters */}
          <TournamentFilters games={games} locations={locations} />

          {/* Result count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-muted-foreground">
              {tournaments && tournaments.length > 0
                ? <>Menampilkan <span className="font-bold text-foreground tabular-nums">{tournaments.length}</span> turnamen</>
                : 'Tidak ada hasil ditemukan'}
            </p>
          </div>

          {/* Tournament Grid */}
          {tournaments && tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.map((tournament: Tournament) => {
                const status = getTournamentStatus(tournament, countMap[tournament.id])
                const cfg = statusConfig[status] ?? statusConfig.completed
                const isOngoing = status === 'ongoing'
                const isUpcoming = status === 'upcoming'

                return (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-border/80 hover:shadow-md transition-all duration-150"
                  >
                    {/* Image / Fallback Header */}
                    <div className="relative h-44 overflow-hidden bg-muted shrink-0">
                      {tournament.image_url ? (
                        <img
                          src={tournament.image_url}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.color} bg-background/90`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Prize badge */}
                      {tournament.prize_pool && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono shadow-sm">
                            <Trophy className="h-3 w-3" />
                            {tournament.prize_pool}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded w-fit">
                        {tournament.game}
                      </span>

                      <div>
                        <h2 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {tournament.name}
                        </h2>
                        {tournament.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {tournament.description}
                          </p>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="space-y-1.5 mt-auto pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>Maksimal {tournament.max_teams} tim · {tournament.team_size} pemain/tim</span>
                        </div>
                        {tournament.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        )}
                        {tournament.registration_fee && (
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                            <Banknote className="h-3.5 w-3.5 shrink-0" />
                            <span>Biaya: {tournament.registration_fee}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Button */}
                      <div className={`mt-2 w-full text-center text-xs font-bold py-2 rounded-lg transition-all
                        ${isUpcoming
                          ? 'bg-primary text-primary-foreground group-hover:bg-primary/90'
                          : isOngoing
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        {isUpcoming ? 'Daftar Sekarang' : isOngoing ? 'Sedang Berlangsung' : 'Lihat Detail'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border p-6">
              <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-base font-bold text-foreground">
                {isFiltered ? 'Tidak Ada Turnamen yang Sesuai' : 'Belum Ada Turnamen'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {isFiltered
                  ? 'Coba ubah kata kunci atau reset filter pencarian untuk melihat turnamen lainnya.'
                  : 'Nantikan turnamen baru yang akan segera ditambahkan panitia.'}
              </p>
              {isFiltered && (
                <Link
                  href="/tournaments"
                  className="mt-4 text-xs font-bold text-primary hover:underline"
                >
                  Reset Semua Filter
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

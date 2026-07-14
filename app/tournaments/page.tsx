import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Users, Calendar, Gamepad2, MapPin, Banknote, Zap, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'
import { TournamentFilters } from '@/components/tournament-filters'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Daftar Turnamen – GameArena',
  description: 'Temukan dan daftar turnamen gaming favoritmu',
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
  const games     = [...new Set(allForFilters?.map(t => t.game).filter(Boolean) ?? [])].sort()
  const locations = [...new Set(allForFilters?.map(t => t.location).filter(Boolean) ?? [])].sort()

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

  // Build a map: tournamentId → count
  const countMap: Record<string, number> = {}
  ;(regCounts ?? []).forEach((r: any) => {
    countMap[r.tournament_id] = (countMap[r.tournament_id] ?? 0) + 1
  })

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    upcoming:             { label: 'Pendaftaran Buka',  color: 'bg-blue-500/15 text-blue-500 border-blue-500/30',         dot: 'bg-blue-500' },
    registration_closed:  { label: 'Slot Penuh',         color: 'bg-amber-500/15 text-amber-500 border-amber-500/30',       dot: 'bg-amber-500' },
    ongoing:              { label: 'Berlangsung',        color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', dot: 'bg-emerald-400' },
    completed:            { label: 'Selesai',            color: 'bg-muted text-muted-foreground border-border',             dot: 'bg-muted-foreground' },
    cancelled:            { label: 'Dibatalkan',         color: 'bg-red-500/15 text-red-500 border-red-500/30',            dot: 'bg-red-500' },
  }

  const isFiltered = !!(params.search || params.status || params.game || params.location || params.prize)


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-violet-500/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                🎮 GameArena
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">
              Daftar Turnamen
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              Temukan turnamen gaming favoritmu, daftarkan tim, dan buktikan kemampuanmu!
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-6 flex-wrap">
              {[
                { icon: Trophy, label: `${tournaments?.length ?? 0} Turnamen`, color: 'text-amber-500' },
                { icon: Gamepad2, label: `${games.length} Game`, color: 'text-primary' },
                { icon: Zap, label: 'Live Sekarang', color: 'text-emerald-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">

          {/* Filters */}
          <TournamentFilters games={games} locations={locations} />

          {/* Result count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">
              {tournaments && tournaments.length > 0
                ? <><span className="font-semibold text-foreground">{tournaments.length}</span> turnamen ditemukan</>
                : 'Tidak ada hasil'}
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
                    className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    {/* Image / Placeholder */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/20 via-violet-500/10 to-background shrink-0">
                      {tournament.image_url ? (
                        <img
                          src={tournament.image_url}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-16 w-16 text-primary/20" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                      {/* Status badge on image */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${isOngoing ? 'animate-pulse' : ''}`} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Prize badge on image */}
                      {tournament.prize_pool && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-sm border border-amber-400/30">
                            <Trophy className="h-3 w-3" />
                            {tournament.prize_pool}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      {/* Game tag */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md w-fit">
                        {tournament.game}
                      </span>

                      {/* Title */}
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
                      <div className="space-y-1.5 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span>Max {tournament.max_teams} tim · {tournament.team_size} pemain/tim</span>
                        </div>
                        {tournament.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        )}
                        {tournament.registration_fee && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                            <Banknote className="h-3.5 w-3.5 shrink-0" />
                            <span>Biaya: {tournament.registration_fee}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className={`mt-1 w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-all
                        ${isUpcoming
                          ? 'bg-primary text-primary-foreground group-hover:bg-primary/90 shadow-sm shadow-primary/20'
                          : isOngoing
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 group-hover:bg-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        {isUpcoming ? 'Daftar Sekarang →' : isOngoing ? 'Sedang Berlangsung' : 'Lihat Detail →'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Search className="h-10 w-10 text-primary/30" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {isFiltered ? 'Tidak Ada Hasil' : 'Belum Ada Turnamen'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {isFiltered
                    ? 'Coba ubah atau hapus filter untuk melihat lebih banyak turnamen.'
                    : 'Admin belum menambahkan turnamen. Cek lagi nanti!'}
                </p>
              </div>
              {isFiltered && (
                <Link
                  href="/tournaments"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Hapus semua filter
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

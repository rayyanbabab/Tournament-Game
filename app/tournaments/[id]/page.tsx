import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  Trophy, Users, Calendar, Clock, Gamepad2, ArrowLeft,
  FileText, Banknote, MapPin, Phone, CheckCircle, AlertCircle,
  Lock, ChevronRight, Shuffle, CalendarDays, Swords, Star, MessageCircle,
} from 'lucide-react'
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
    .select('*, profiles:created_by (full_name, email)')
    .eq('id', tournamentId)
    .single()

  if (error || !tournament) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  let existingRegistration: any = null

  if (user) {
    const { data: registration } = await supabase
      .from('tournament_registrations')
      .select('*, teams(name)')
      .eq('tournament_id', tournamentId)
      .eq('registered_by', user.id)
      .maybeSingle()
    existingRegistration = registration
  }

  const { count: registrationCount } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .in('status', ['pending', 'approved'])

  const { data: approvedRegistrations } = await supabase
    .from('tournament_registrations')
    .select('*, teams(id, name, logo_url)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')

  const { data: matches } = await supabase
    .from('matches')
    .select('*, team1:team1_id(id, name), team2:team2_id(id, name), winner:winner_id(id, name)')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('match_number', { ascending: true })

  const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    upcoming:             { label: 'Pendaftaran Dibuka',   color: 'text-blue-600',    dot: 'bg-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20' },
    registration_closed:  { label: 'Pendaftaran Ditutup',  color: 'text-amber-600',   dot: 'bg-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20' },
    ongoing:              { label: 'Sedang Berlangsung',   color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    completed:            { label: 'Selesai',              color: 'text-muted-foreground', dot: 'bg-muted-foreground', bg: 'bg-muted border-border' },
    cancelled:            { label: 'Dibatalkan',           color: 'text-red-600',     dot: 'bg-red-500',     bg: 'bg-red-500/10 border-red-500/20' },
  }

  const currentStatus = getTournamentStatus(tournament)
  const scfg = statusConfig[currentStatus] ?? statusConfig.upcoming
  const isRegistrationOpen = currentStatus === 'upcoming'
  const slotsUsed = registrationCount ?? 0
  const slotsRemaining = tournament.max_teams - slotsUsed
  const fillPct = tournament.max_teams > 0 ? Math.round((slotsUsed / tournament.max_teams) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero cover */}
        <div className="relative w-full h-72 md:h-96 overflow-hidden bg-muted">
          {tournament.image_url ? (
            <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-violet-500/10 flex items-center justify-center">
              <Gamepad2 className="h-24 w-24 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Back + status floating overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link href="/tournaments"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />
              Turnamen
            </Link>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${scfg.bg} ${scfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${scfg.dot}`} />
              {scfg.label}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── MAIN CONTENT ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Title Card */}
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {tournament.game}
                  </span>
                  {tournament.prize_pool && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />{tournament.prize_pool}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{tournament.name}</h1>
                {tournament.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{tournament.description}</p>
                )}

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  {[
                    { icon: Calendar, label: 'Mulai',      value: format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id }) },
                    { icon: Clock,    label: 'Selesai',    value: format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: id }) },
                    { icon: Users,    label: 'Per Tim',    value: `${tournament.team_size} pemain` },
                    { icon: Trophy,   label: 'Max Tim',    value: `${tournament.max_teams} slot` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center">
                      <Icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Extra Info Row */}
                {(tournament.registration_fee || tournament.location || tournament.contact_info) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    {tournament.registration_fee && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                        <Banknote className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Biaya Daftar</p>
                          <p className="text-sm font-semibold text-emerald-600">{tournament.registration_fee}</p>
                        </div>
                      </div>
                    )}
                    {tournament.location && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                        <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Lokasi</p>
                          <p className="text-sm font-semibold text-foreground">{tournament.location}</p>
                        </div>
                      </div>
                    )}
                    {tournament.contact_info && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                        <Phone className="h-4 w-4 text-violet-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Kontak</p>
                          <p className="text-sm font-semibold text-foreground">{tournament.contact_info}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rules */}
              {tournament.rules && (
                <div className="rounded-2xl border border-border/60 bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Peraturan Turnamen</h2>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{tournament.rules}</p>
                </div>
              )}

              {/* Match Schedule & Results */}
              {matches && matches.length > 0 && (() => {
                const rounds = Array.from(new Set(matches.map((m: any) => m.round))).sort((a: any, b: any) => a - b) as number[]
                const totalRounds = rounds.length
                const roundLabel = (r: number) =>
                  r === totalRounds ? 'Grand Final' : r === totalRounds - 1 && totalRounds > 1 ? 'Semifinal' : `Babak ${r}`
                return (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      <h2 className="text-sm font-semibold text-foreground">Jadwal & Hasil Pertandingan</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {rounds.map((round: number) => {
                        const roundMatches = matches.filter((m: any) => m.round === round)
                        return (
                          <div key={round}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{roundLabel(round)}</p>
                            <div className="space-y-2">
                              {roundMatches.map((match: any) => {
                                const isBye = match.status === 'bye'
                                const isCompleted = match.status === 'completed'
                                const team1Name = match.team1?.name ?? 'TBD'
                                const team2Name = match.team2?.name ?? 'TBD'
                                return (
                                  <div key={match.id} className="rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-3 min-w-0">
                                        {isBye ? (
                                          <span className="text-sm text-muted-foreground">{team1Name} <span className="text-xs bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded border border-violet-500/20">BYE</span></span>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${match.winner_id === match.team1_id ? 'text-emerald-600' : 'text-foreground'}`}>{team1Name}</span>
                                            {isCompleted ? (
                                              <span className="text-sm font-extrabold text-foreground">{match.score_team1} – {match.score_team2}</span>
                                            ) : (
                                              <Swords className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <span className={`text-sm font-bold ${match.winner_id === match.team2_id ? 'text-emerald-600' : 'text-foreground'}`}>{team2Name}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {match.scheduled_at && (
                                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(match.scheduled_at), 'dd MMM, HH:mm', { locale: id })}
                                          </span>
                                        )}
                                        {match.venue && (
                                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {match.venue}
                                          </span>
                                        )}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                          isCompleted ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                          : isBye ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                                          : match.scheduled_at ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                          : 'bg-muted text-muted-foreground border-border'
                                        }`}>
                                          {isCompleted ? 'Selesai' : isBye ? 'BYE' : match.scheduled_at ? 'Dijadwalkan' : 'Menunggu'}
                                        </span>
                                      </div>
                                    </div>
                                    {isCompleted && match.winner && (
                                      <div className="flex items-center gap-1.5 mt-1.5">
                                        <Star className="h-3 w-3 text-amber-500" />
                                        <span className="text-[11px] text-amber-600 font-semibold">Pemenang: {match.winner.name}</span>
                                      </div>
                                    )}
                                    {match.notes && (
                                      <p className="text-[11px] text-muted-foreground mt-1">{match.notes}</p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Registered Teams */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Tim Terdaftar</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {approvedRegistrations?.length || 0}/{tournament.max_teams}
                    </span>
                  </div>
                  {/* Slot fill bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fillPct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{fillPct}%</span>
                  </div>
                </div>

                {approvedRegistrations && approvedRegistrations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-5">
                    {approvedRegistrations.map((reg: any) => (
                      <Link key={reg.id} href={`/teams/${reg.teams?.id}`} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {reg.teams?.logo_url ? (
                            <img src={reg.teams.logo_url} alt={reg.teams.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-extrabold text-primary">{reg.teams?.name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{reg.teams?.name}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Gamepad2 className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Belum ada tim yang terdaftar</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div>
              <div className="rounded-2xl border border-border/60 bg-card p-6 sticky top-24 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">Pendaftaran</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Batas: {format(new Date(tournament.registration_deadline), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>

                {/* Slot progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Slot terisi</span>
                    <span className="font-semibold text-foreground">{slotsUsed}/{tournament.max_teams}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fillPct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {slotsRemaining > 0 ? `${slotsRemaining} slot tersisa` : 'Slot penuh'}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-4">
                  {existingRegistration ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                      <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-bold text-foreground">Tim Anda Sudah Terdaftar</p>
                      <p className="text-xs text-muted-foreground mt-1">{existingRegistration.teams?.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-2 px-3 py-1 rounded-full border ${
                        existingRegistration.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : existingRegistration.status === 'rejected'
                          ? 'bg-red-500/10 text-red-600 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {existingRegistration.status === 'approved' ? 'Disetujui'
                          : existingRegistration.status === 'rejected' ? 'Ditolak'
                          : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                  ) : !user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">Login untuk mendaftar turnamen ini</p>
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Login untuk Mendaftar</Link>
                      </Button>
                    </div>
                  ) : !isRegistrationOpen ? (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex flex-col items-center gap-2">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground text-center">Pendaftaran telah ditutup</p>
                    </div>
                  ) : slotsRemaining <= 0 ? (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex flex-col items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground text-center">Slot pendaftaran sudah penuh</p>
                    </div>
                  ) : (
                    <RegisterTournamentButton
                      tournamentId={tournament.id}
                      teamSize={tournament.team_size}
                      registrationFee={tournament.registration_fee}
                    />
                  )}
                </div>

                {/* Tournament meta */}
                <div className="border-t border-border/40 pt-4 space-y-2.5">
                  {[
                    { icon: Calendar, label: 'Mulai', value: format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id }) },
                    { icon: Clock, label: 'Berakhir', value: format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: id }) },
                    { icon: Users, label: 'Ukuran Tim', value: `${tournament.team_size} pemain/tim` },
                    ...(tournament.registration_fee ? [{ icon: Banknote, label: 'Biaya', value: tournament.registration_fee }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                      <span className="font-medium text-foreground text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Bracket link */}
                <div className="border-t border-border/40 pt-4 space-y-2">
                  <Button asChild variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10">
                    <Link href={`/tournaments/${tournament.id}/bracket`}>
                      <Shuffle className="h-4 w-4" />
                      Lihat Bracket Turnamen
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                    <Link href={`/tournaments/${tournament.id}/chat`}>
                      <MessageCircle className="h-4 w-4" />
                      Lobby Chat Peserta
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

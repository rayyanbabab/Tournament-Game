import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Users, Calendar, ArrowLeft, Gamepad2, Crown, Mail, Phone, Globe, Star } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const TEAM_BADGES = [
  { slug: 'first_tournament', name: 'Debut',        emoji: '🎮', desc: 'Ikut turnamen pertama',  check: (j: number, w: number) => j >= 1 },
  { slug: 'veteran_team',     name: 'Tim Veteran',   emoji: '⚔️', desc: 'Ikut 5+ turnamen',       check: (j: number, w: number) => j >= 5 },
  { slug: 'champion_team',    name: 'Tim Champion',  emoji: '🏆', desc: 'Menang 1+ turnamen',     check: (j: number, w: number) => w >= 1 },
  { slug: 'dynasty',          name: 'Dynasty',       emoji: '👑', desc: 'Menang 3+ turnamen',     check: (j: number, w: number) => w >= 3 },
]

export default async function PublicTeamProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, captain:captain_id(id, full_name, email, avatar_url)')
    .eq('id', teamId)
    .single()
  if (error || !team) notFound()

  const { data: members } = await supabase
    .from('team_members')
    .select('*, profiles:user_id(id, full_name, email, avatar_url)')
    .eq('team_id', teamId)
    .order('role', { ascending: true })

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(id, name, game, start_date, end_date, image_url, prize_pool)')
    .eq('team_id', teamId)
    .in('status', ['approved', 'pending', 'rejected'])
    .order('registered_at', { ascending: false })

  // Win count: matches won by this team in the final round
  let tournamentWins = 0, matchWins = 0
  const { data: winMatches } = await supabase
    .from('matches').select('tournament_id, round').eq('winner_id', teamId).eq('status', 'completed')
  matchWins = winMatches?.length ?? 0
  const byTournament: Record<string, number[]> = {}
  winMatches?.forEach((m: any) => {
    if (!byTournament[m.tournament_id]) byTournament[m.tournament_id] = []
    byTournament[m.tournament_id].push(m.round)
  })
  for (const [tid, rounds] of Object.entries(byTournament)) {
    const { data: allM } = await supabase.from('matches').select('round').eq('tournament_id', tid).order('round', { ascending: false }).limit(1)
    if (allM?.[0] && rounds.includes(allM[0].round)) tournamentWins++
  }

  const approvedCount = registrations?.filter(r => r.status === 'approved').length ?? 0
  const captain = team.captain as any

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative border-b border-border/40 bg-gradient-to-br from-violet-500/10 via-primary/5 to-background py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <Link href="/teams" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Semua Tim
            </Link>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-primary/10">
                {team.logo_url
                  ? <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                  : <span className="text-3xl font-extrabold text-primary">{team.name[0]?.toUpperCase()}</span>}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-extrabold text-foreground">{team.name}</h1>
                {team.description && <p className="text-sm text-muted-foreground mt-1 max-w-lg">{team.description}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap justify-center sm:justify-start">
                  <span className="text-xs text-muted-foreground">
                    Kapten: <span className="font-semibold text-foreground">{captain?.full_name || captain?.email}</span>
                  </span>
                  <span className="text-xs text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">
                    Dibuat {format(new Date(team.created_at), 'MMMM yyyy', { locale: idLocale })}
                  </span>
                </div>
                {/* Team badges */}
                <div className="flex gap-1 mt-2 flex-wrap justify-center sm:justify-start">
                  {TEAM_BADGES.filter(b => b.check(approvedCount, tournamentWins)).map(b => (
                    <span key={b.slug} title={`${b.name}: ${b.desc}`} className="text-lg cursor-default">{b.emoji}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Turnamen Diikuti', value: approvedCount, icon: Trophy, color: 'text-blue-500' },
              { label: 'Match Menang',     value: matchWins,     icon: Star,   color: 'text-amber-500' },
              { label: 'Turnamen Menang',  value: tournamentWins,icon: Crown,  color: 'text-emerald-500' },
              { label: 'Anggota',          value: members?.length ?? 0, icon: Users, color: 'text-violet-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-card p-5 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roster */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-bold text-foreground">Roster</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{members?.length ?? 0} anggota</span>
                </div>
                <div className="divide-y divide-border/40">
                  {members?.map((member: any) => {
                    const p = member.profiles
                    const isCaptain = team.captain_id === p?.id
                    const init = (p?.full_name || p?.email || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <Link key={member.id} href={`/players/${p?.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {p?.avatar_url
                            ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                            : <span className="text-[10px] font-bold text-primary">{init}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {p?.full_name || p?.email?.split('@')[0]}
                          </p>
                          {member.in_game_name && (
                            <p className="text-[10px] text-muted-foreground">{member.in_game_name}</p>
                          )}
                        </div>
                        {isCaptain && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">Kapten</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Contact info */}
              {(team.contact_email || team.whatsapp_number || team.discord_link) && (
                <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Kontak</h3>
                  {team.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" /> {team.contact_email}
                    </div>
                  )}
                  {team.whatsapp_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" /> {team.whatsapp_number}
                    </div>
                  )}
                  {team.discord_link && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 shrink-0" /> {team.discord_link}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tournament History */}
            <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Riwayat Turnamen</h2>
              </div>
              {registrations && registrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {registrations.map((reg: any) => {
                    const statusCfg: Record<string, { label: string; cls: string }> = {
                      approved: { label: 'Disetujui', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
                      pending:  { label: 'Menunggu',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                      rejected: { label: 'Ditolak',   cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
                    }
                    const scfg = statusCfg[reg.status] ?? statusCfg.pending
                    return (
                      <Link key={reg.id} href={`/tournaments/${reg.tournaments?.id}`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {reg.tournaments?.image_url
                            ? <img src={reg.tournaments.image_url} alt="" className="h-full w-full object-cover" />
                            : <Gamepad2 className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{reg.tournaments?.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{reg.tournaments?.game}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {reg.tournaments?.start_date && format(new Date(reg.tournaments.start_date), 'dd MMM yyyy', { locale: idLocale })}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${scfg.cls}`}>{scfg.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Gamepad2 className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">Belum mengikuti turnamen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

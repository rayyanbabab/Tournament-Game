import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Calendar, Shield, ArrowLeft, Gamepad2, Award, Crown, Zap, Medal } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const BADGES = [
  { slug: 'first_step',       name: 'First Step',       emoji: '🎮', desc: 'Ikut turnamen pertama',   color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',    check: (j: number, w: number) => j >= 1  },
  { slug: 'veteran',          name: 'Veteran',           emoji: '⚔️', desc: 'Ikut 5+ turnamen',        color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', check: (j: number, w: number) => j >= 5  },
  { slug: 'legend',           name: 'Legend',            emoji: '👑', desc: 'Ikut 10+ turnamen',       color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',   check: (j: number, w: number) => j >= 10 },
  { slug: 'champion',         name: 'Champion',          emoji: '🏆', desc: 'Menang 1 turnamen',       color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', check: (j: number, w: number) => w >= 1  },
  { slug: 'double_champion',  name: 'Double Champion',   emoji: '🥇', desc: 'Menang 2 turnamen',       color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',   check: (j: number, w: number) => w >= 2  },
  { slug: 'triple_champion',  name: 'Triple Champion',   emoji: '💎', desc: 'Menang 3+ turnamen',      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',      check: (j: number, w: number) => w >= 3  },
]

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: playerId } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('id', playerId).single()
  if (error || !profile) notFound()

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(id, name, game, start_date, image_url), teams(id, name, logo_url)')
    .eq('registered_by', playerId).eq('status', 'approved')
    .order('registered_at', { ascending: false })

  const teamIds = (registrations ?? []).map((r: any) => r.teams?.id).filter(Boolean)
  let matchWins = 0, tournamentWins = 0

  if (teamIds.length > 0) {
    const { data: winMatches } = await supabase
      .from('matches').select('tournament_id, round, winner_id')
      .in('winner_id', teamIds).eq('status', 'completed')
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
  }

  const totalJoined = registrations?.length ?? 0
  const earnedCount = BADGES.filter(b => b.check(totalJoined, tournamentWins)).length
  const initials = (profile.full_name || profile.email || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="relative border-b border-border/40 bg-gradient-to-br from-primary/10 via-violet-500/5 to-background py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <Link href="/leaderboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali
            </Link>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-primary/10">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  : <span className="text-3xl font-extrabold text-primary">{initials}</span>}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl font-extrabold text-foreground">{profile.full_name || 'Anonymous'}</h1>
                  {profile.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Bergabung {format(new Date(profile.created_at), 'MMMM yyyy', { locale: idLocale })}
                </p>
                {earnedCount > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap justify-center sm:justify-start">
                    {BADGES.filter(b => b.check(totalJoined, tournamentWins)).map(b => (
                      <span key={b.slug} title={b.name} className="text-lg">{b.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Trophy, label: 'Turnamen Diikuti', value: totalJoined, color: 'text-blue-500' },
              { icon: Zap, label: 'Match Menang', value: matchWins, color: 'text-amber-500' },
              { icon: Crown, label: 'Turnamen Menang', value: tournamentWins, color: 'text-emerald-500' },
              { icon: Medal, label: 'Badge Diperoleh', value: earnedCount, color: 'text-violet-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-card p-5 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Badges Panel */}
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">Badge & Pencapaian</h2>
                <span className="ml-auto text-[10px] text-muted-foreground">{earnedCount}/{BADGES.length}</span>
              </div>
              <div className="space-y-2">
                {BADGES.map(badge => {
                  const earned = badge.check(totalJoined, tournamentWins)
                  return (
                    <div key={badge.slug} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${earned ? badge.color : 'border-border/30 bg-muted/10 opacity-40 grayscale'}`}>
                      <span className="text-xl">{badge.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                      </div>
                      {earned && <span className="ml-auto shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600">✓</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tournament History */}
            <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Riwayat Turnamen</h2>
                <span className="ml-auto text-xs text-muted-foreground">{totalJoined} turnamen</span>
              </div>
              {registrations && registrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {registrations.map((reg: any) => (
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
                      <span className="text-xs text-muted-foreground shrink-0">{reg.teams?.name}</span>
                    </Link>
                  ))}
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

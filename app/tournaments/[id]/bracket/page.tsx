import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BracketView } from '@/components/bracket/bracket-view'
import { Trophy, ArrowLeft, ChevronRight } from 'lucide-react'

export default async function PublicBracketPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from('tournaments').select('id, name, game, max_teams').eq('id', tournamentId).single()
  if (error || !tournament) notFound()

  const { data: rawMatches } = await supabase
    .from('matches')
    .select('id, round, match_number, status, team1_id, team2_id, winner_id, team1_score, team2_score, notes, next_match_id, next_match_slot')
    .eq('tournament_id', tournamentId)
    .order('round').order('match_number')

  const teamIds = new Set<string>()
  rawMatches?.forEach((m: any) => {
    if (m.team1_id) teamIds.add(m.team1_id)
    if (m.team2_id) teamIds.add(m.team2_id)
    if (m.winner_id) teamIds.add(m.winner_id)
  })

  const { data: teams } = await supabase
    .from('teams').select('id, name, logo_url')
    .in('id', teamIds.size > 0 ? [...teamIds] : ['00000000-0000-0000-0000-000000000000'])

  const teamMap: Record<string, any> = {}
  teams?.forEach((t: any) => { teamMap[t.id] = t })

  const matches = (rawMatches ?? []).map((m: any) => ({
    ...m, scheduled_at: null,
    team1: m.team1_id ? teamMap[m.team1_id] : null,
    team2: m.team2_id ? teamMap[m.team2_id] : null,
    winner: m.winner_id ? teamMap[m.winner_id] : null,
  }))

  const completedCount = matches.filter((m: any) => m.status === 'completed').length
  const totalMatchable = matches.filter((m: any) => m.status !== 'bye').length
  const progress = totalMatchable > 0 ? Math.round((completedCount / totalMatchable) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-border/60 bg-muted/[0.04]">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link href="/tournaments" className="text-muted-foreground hover:text-foreground transition-colors">Turnamen</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              <Link href={`/tournaments/${tournamentId}`} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[180px]">{tournament.name}</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-foreground font-medium">Bracket</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{tournament.name}</h1>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{tournament.game}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Single Elimination Bracket</p>
                </div>
              </div>
              {matches.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5">
                  <div className="text-center">
                    <p className="text-lg font-extrabold tabular-nums text-foreground">{completedCount}/{totalMatchable}</p>
                    <p className="text-[10px] text-muted-foreground">Selesai</p>
                  </div>
                  <div className="w-px h-8 bg-border/60" />
                  <div className="w-24">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{progress}% progress</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-400/40" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Bracket Belum Tersedia</p>
                <p className="text-sm text-muted-foreground mt-1">Bracket akan ditampilkan setelah admin generate dari peserta yang terdaftar.</p>
              </div>
              <Link href={`/tournaments/${tournamentId}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                <ArrowLeft className="h-3.5 w-3.5" />Kembali ke Detail Turnamen
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <BracketView matches={matches} isAdmin={false} tournamentId={tournamentId} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

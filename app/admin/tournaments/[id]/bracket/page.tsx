import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BracketView } from '@/components/bracket/bracket-view'
import { GenerateBracketButton } from './generate-button'
import { ChevronRight, Trophy, Users, Shuffle, ExternalLink, CalendarDays, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminBracketPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tournament, error } = await supabase
    .from('tournaments').select('*').eq('id', tournamentId).single()
  if (error || !tournament) notFound()

  const { data: approvedRegs } = await supabase
    .from('tournament_registrations')
    .select('team_id, teams(id, name, logo_url)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')

  const approvedTeams = approvedRegs?.map((r: any) => r.teams).filter(Boolean) ?? []

  const { data: rawMatches } = await supabase
    .from('matches')
    .select('id, round, match_number, status, team1_id, team2_id, winner_id, team1_score, team2_score, scheduled_at, notes, next_match_id, next_match_slot')
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
    ...m,
    team1: m.team1_id ? teamMap[m.team1_id] : null,
    team2: m.team2_id ? teamMap[m.team2_id] : null,
    winner: m.winner_id ? teamMap[m.winner_id] : null,
  }))

  const hasBracket = matches.length > 0
  const completedCount = matches.filter((m: any) => m.status === 'completed').length
  const totalMatchable = matches.filter((m: any) => m.status !== 'bye').length

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/tournaments" className="text-muted-foreground hover:text-foreground transition-colors">Turnamen</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <Link href={`/admin/tournaments/${tournamentId}`} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[140px]">{tournament.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-foreground font-medium">Bracket</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/tournaments/${tournamentId}/bracket`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />Lihat Publik
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Bracket Turnamen</h1>
                <p className="text-sm text-muted-foreground">{tournament.name}</p>
              </div>
            </div>
            <GenerateBracketButton tournamentId={tournamentId} hasBracket={hasBracket} approvedCount={approvedTeams.length} />
          </div>

          {/* Info banner — redirect to schedule for score input */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
            <Info className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-600 flex-1">
              Halaman ini hanya untuk melihat bracket. Input skor & hasil dilakukan di halaman
              <span className="font-semibold"> Jadwal &amp; Hasil Pertandingan</span>.
            </p>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 shrink-0">
              <Link href={`/admin/tournaments/${tournamentId}/schedule`}>
                <CalendarDays className="h-3.5 w-3.5" /> Jadwal &amp; Hasil
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tim Disetujui',      value: approvedTeams.length, accent: 'border-l-primary' },
              { label: 'Total Pertandingan', value: totalMatchable,        accent: 'border-l-violet-500' },
              { label: 'Selesai',            value: completedCount,        accent: 'border-l-emerald-500' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border border-border/60 border-l-2 ${s.accent} bg-card p-4`}>
                <p className="text-2xl font-extrabold tabular-nums text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Single Elimination Bracket</h2>
              {hasBracket && (
                <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {completedCount}/{totalMatchable} selesai
                </span>
              )}
            </div>
            <BracketView matches={matches} isAdmin={false} tournamentId={tournamentId} />
          </div>

          {approvedTeams.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Tim Peserta ({approvedTeams.length})</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-5">
                {approvedTeams.map((team: any) => (
                  <div key={team.id} className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden text-xs font-extrabold text-primary">
                      {team.logo_url ? <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" /> : team.name[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

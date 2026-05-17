'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BracketView, type BracketMatch, type MatchTeam } from '@/components/bracket/bracket-view'
import { AdminSidebar } from '@/components/admin/sidebar'
import {
  Trophy, Loader2, Shuffle, Save, X, CheckCircle2, AlertCircle,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

interface Registration {
  id: string
  team: MatchTeam
}

export default function AdminBracketPage({ params }: Props) {
  const { id: tournamentId } = use(params)
  const supabase = createClient()
  const [tournament, setTournament] = useState<{ name: string; game: string } | null>(null)
  const [matches, setMatches] = useState<BracketMatch[]>([])
  const [totalRounds, setTotalRounds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null)
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchMatches = useCallback(async () => {
    const { data } = await supabase
      .from('tournament_matches')
      .select(`
        id, tournament_id, round, match_number,
        team1_score, team2_score, winner_id, status, scheduled_at,
        team1:teams!tournament_matches_team1_id_fkey(id, name),
        team2:teams!tournament_matches_team2_id_fkey(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .order('round').order('match_number')

    if (data && data.length > 0) {
      const maxRound = Math.max(...data.map((m: any) => m.round))
      setTotalRounds(maxRound)
      setMatches(data.map((m: any) => ({
        ...m,
        team1: Array.isArray(m.team1) ? m.team1[0] ?? null : m.team1,
        team2: Array.isArray(m.team2) ? m.team2[0] ?? null : m.team2,
      })))
    } else {
      setMatches([])
      setTotalRounds(0)
    }
  }, [tournamentId, supabase])

  useEffect(() => {
    const init = async () => {
      const { data: trn } = await supabase
        .from('tournaments').select('name, game').eq('id', tournamentId).single()
      if (trn) setTournament(trn)
      await fetchMatches()
      setLoading(false)
    }
    init()
  }, [tournamentId, supabase, fetchMatches])

  // Generate bracket from approved registrations
  const generateBracket = async () => {
    setGenerating(true)
    try {
      // Fetch approved teams
      const { data: regs } = await supabase
        .from('registrations')
        .select('id, teams(id, name)')
        .eq('tournament_id', tournamentId)
        .eq('status', 'approved')

      if (!regs || regs.length < 2) {
        showToast('error', 'Minimal 2 tim yang disetujui untuk membuat bracket')
        return
      }

      // Round up to nearest power of 2
      const teamCount = regs.length
      const slots = Math.pow(2, Math.ceil(Math.log2(teamCount)))
      const rounds = Math.log2(slots)

      // Shuffle teams (seeding random)
      const teams = regs.map((r: any) => ({
        id: (Array.isArray(r.teams) ? r.teams[0] : r.teams)?.id,
        name: (Array.isArray(r.teams) ? r.teams[0] : r.teams)?.name,
      })).filter((t: any) => t.id)
      for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]]
      }

      // Delete existing bracket
      await supabase.from('tournament_matches').delete().eq('tournament_id', tournamentId)

      // Build all match rows
      const matchRows: any[] = []

      // Round 1: pair teams
      for (let mi = 0; mi < slots / 2; mi++) {
        const t1 = teams[mi * 2] ?? null
        const t2 = teams[mi * 2 + 1] ?? null
        matchRows.push({
          tournament_id: tournamentId,
          round: 1,
          match_number: mi,
          team1_id: t1?.id ?? null,
          team2_id: t2?.id ?? null,
          // If one slot is empty (bye), auto-set winner
          winner_id: !t2 ? t1?.id ?? null : !t1 ? t2?.id ?? null : null,
          status: !t1 || !t2 ? 'completed' : 'pending',
        })
      }

      // Remaining rounds: empty slots
      for (let r = 2; r <= rounds; r++) {
        const count = slots / Math.pow(2, r)
        for (let mi = 0; mi < count; mi++) {
          matchRows.push({
            tournament_id: tournamentId,
            round: r,
            match_number: mi,
            team1_id: null,
            team2_id: null,
            winner_id: null,
            status: 'pending',
          })
        }
      }

      const { error } = await supabase.from('tournament_matches').insert(matchRows)
      if (error) throw error

      await fetchMatches()
      showToast('success', `Bracket berhasil dibuat dengan ${teamCount} tim!`)
    } catch (e: any) {
      showToast('error', e.message || 'Gagal membuat bracket')
    } finally {
      setGenerating(false)
    }
  }

  // Submit score and auto-advance winner
  const submitScore = async () => {
    if (!selectedMatch || score1 === '' || score2 === '') return
    const s1 = parseInt(score1)
    const s2 = parseInt(score2)
    if (isNaN(s1) || isNaN(s2)) return
    if (s1 === s2) { showToast('error', 'Skor tidak boleh seri'); return }

    setSaving(true)
    try {
      const winnerId = s1 > s2 ? selectedMatch.team1?.id : selectedMatch.team2?.id
      const winner = s1 > s2 ? selectedMatch.team1 : selectedMatch.team2

      // Update the match
      await supabase.from('tournament_matches').update({
        team1_score: s1,
        team2_score: s2,
        winner_id: winnerId,
        status: 'completed',
      }).eq('id', selectedMatch.id)

      // Advance winner to next round
      if (selectedMatch.round < totalRounds && winner) {
        const nextMatchNum = Math.floor(selectedMatch.match_number / 2)
        const isTeam1Slot = selectedMatch.match_number % 2 === 0

        const { data: nextMatch } = await supabase
          .from('tournament_matches')
          .select('id, team1_id, team2_id')
          .eq('tournament_id', tournamentId)
          .eq('round', selectedMatch.round + 1)
          .eq('match_number', nextMatchNum)
          .single()

        if (nextMatch) {
          await supabase.from('tournament_matches').update(
            isTeam1Slot ? { team1_id: winner.id } : { team2_id: winner.id }
          ).eq('id', nextMatch.id)
        }
      }

      await fetchMatches()
      setSelectedMatch(null)
      setScore1('')
      setScore2('')
      showToast('success', 'Skor berhasil disimpan & pemenang melaju!')
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menyimpan skor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Bracket — {tournament?.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola bagan pertandingan & input skor
            </p>
          </div>
          <button
            onClick={generateBracket}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
            {matches.length > 0 ? 'Generate Ulang' : 'Generate Bracket'}
          </button>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <BracketView
                matches={matches}
                totalRounds={totalRounds}
                isAdmin
                onMatchClick={(m) => {
                  if (m.status !== 'completed' && m.team1 && m.team2) {
                    setSelectedMatch(m)
                    setScore1(m.team1_score?.toString() ?? '')
                    setScore2(m.team2_score?.toString() ?? '')
                  }
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Score Input Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h2 className="font-semibold text-foreground">Input Skor Pertandingan</h2>
              <button
                onClick={() => { setSelectedMatch(null); setScore1(''); setScore2('') }}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Team 1 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  {selectedMatch.team1?.name}
                </label>
                <input
                  type="number"
                  min={0}
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-center text-xs font-semibold text-muted-foreground">VS</div>

              {/* Team 2 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  {selectedMatch.team2?.name}
                </label>
                <input
                  type="number"
                  min={0}
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Tim dengan skor lebih tinggi otomatis melaju ke babak berikutnya
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => { setSelectedMatch(null); setScore1(''); setScore2('') }}
                className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitScore}
                disabled={saving || score1 === '' || score2 === ''}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-in slide-in-from-bottom-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

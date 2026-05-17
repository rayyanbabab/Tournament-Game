'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BracketView, type BracketMatch } from '@/components/bracket/bracket-view'
import { Trophy, Loader2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function PublicBracketPage({ params }: Props) {
  const { id } = use(params)
  const [matches, setMatches] = useState<BracketMatch[]>([])
  const [tournament, setTournament] = useState<{ name: string; game: string } | null>(null)
  const [totalRounds, setTotalRounds] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: trn }, { data: raw }] = await Promise.all([
        supabase.from('tournaments').select('name, game').eq('id', params.id).single(),
        supabase
          .from('tournament_matches')
          .select(`
            id, tournament_id, round, match_number,
            team1_score, team2_score, winner_id, status, scheduled_at,
            team1:teams!tournament_matches_team1_id_fkey(id, name),
            team2:teams!tournament_matches_team2_id_fkey(id, name)
          `)
          .eq('tournament_id', params.id)
          .order('round').order('match_number'),
      ])

      if (trn) setTournament(trn)

      if (raw && raw.length > 0) {
        const maxRound = Math.max(...raw.map((m: any) => m.round))
        setTotalRounds(maxRound)
        setMatches(raw.map((m: any) => ({
          ...m,
          team1: Array.isArray(m.team1) ? m.team1[0] ?? null : m.team1,
          team2: Array.isArray(m.team2) ? m.team2[0] ?? null : m.team2,
        })))
      }
      setLoading(false)
    }

    fetchData()

    // Realtime subscription
    const channel = supabase
      .channel('bracket-public')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tournament_matches',
        filter: `tournament_id=eq.${params.id}`,
      }, () => fetchData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id, supabase])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {tournament?.name || 'Bracket Turnamen'}
              </h1>
              <p className="text-sm text-muted-foreground">{tournament?.game}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : totalRounds === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <Trophy className="h-12 w-12 opacity-20" />
            <p>Bracket belum tersedia</p>
            <p className="text-sm">Admin sedang menyiapkan bagan pertandingan</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <BracketView matches={matches} totalRounds={totalRounds} />
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Trophy, Crown, Minus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setMatchResult } from '@/app/actions/bracket'

interface Team { id: string; name: string; logo_url?: string | null }
interface Match {
  id: string; round: number; match_number: number
  team1_id: string | null; team2_id: string | null; winner_id: string | null
  team1_score: number; team2_score: number; status: string
  notes: string | null; next_match_id: string | null; next_match_slot: number | null
  team1?: Team | null; team2?: Team | null; winner?: Team | null
}
interface BracketViewProps { matches: Match[]; isAdmin?: boolean; tournamentId: string }

function TeamSlot({ team, isWinner, score, isEmpty }: {
  team?: Team | null; isWinner?: boolean; score?: number; isEmpty?: boolean
}) {
  if (isEmpty || !team) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/40 bg-muted/10">
      <div className="h-6 w-6 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
        <Minus className="h-3 w-3 text-muted-foreground/30" />
      </div>
      <span className="text-xs text-muted-foreground/40 italic">TBD</span>
    </div>
  )
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
      isWinner ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-border/50 bg-card'
    }`}>
      <div className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-extrabold ${
        isWinner ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-600' : 'border-border/40 bg-muted/40 text-muted-foreground'
      }`}>
        {team.logo_url ? <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" /> : team.name[0]?.toUpperCase()}
      </div>
      <span className={`text-xs font-semibold truncate flex-1 ${isWinner ? 'text-emerald-600' : 'text-foreground'}`}>{team.name}</span>
      {score !== undefined && <span className={`text-xs font-bold tabular-nums ml-auto ${isWinner ? 'text-emerald-600' : 'text-muted-foreground'}`}>{score}</span>}
      {isWinner && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
    </div>
  )
}

function MatchCard({ match, isAdmin, onResult }: { match: Match; isAdmin?: boolean; onResult?: (m: Match) => void }) {
  const isBye = match.status === 'bye'
  const isDone = match.status === 'completed'
  const canInput = isAdmin && !isDone && !isBye && match.team1_id && match.team2_id

  return (
    <div className={`rounded-xl border w-52 overflow-hidden shadow-sm transition-all bg-card ${
      isDone ? 'border-emerald-500/25' : isBye ? 'border-border/30 opacity-60' : 'border-border/60 hover:border-primary/30 hover:shadow-md'
    }`}>
      <div className={`flex items-center justify-between px-3 py-1.5 text-[10px] font-bold border-b ${
        isDone ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
          : isBye ? 'border-border/30 bg-muted/30 text-muted-foreground'
          : 'border-border/40 bg-muted/20 text-muted-foreground'
      }`}>
        <span>M{match.match_number}</span>
        <span className="uppercase tracking-wider text-[9px]">
          {isDone ? '✓ Selesai' : isBye ? 'BYE' : 'Menunggu'}
        </span>
      </div>
      <div className="p-2 space-y-1.5">
        <TeamSlot team={match.team1} isWinner={isDone && match.winner_id === match.team1_id} score={isDone ? match.team1_score : undefined} isEmpty={!match.team1_id} />
        <div className="text-center text-[9px] text-muted-foreground/40 font-bold">VS</div>
        <TeamSlot team={match.team2} isWinner={isDone && match.winner_id === match.team2_id} score={isDone ? match.team2_score : undefined} isEmpty={!match.team2_id} />
      </div>
      {canInput && (
        <div className="px-2 pb-2">
          <Button size="sm" variant="outline" className="w-full h-7 text-[11px] border-primary/30 text-primary hover:bg-primary/10" onClick={() => onResult?.(match)}>
            Input Hasil
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultDialog({ match, onClose }: { match: Match; onClose: () => void }) {
  const [s1, setS1] = useState(match.team1_score || 0)
  const [s2, setS2] = useState(match.team2_score || 0)
  const [notes, setNotes] = useState(match.notes || '')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()

  const save = (winnerId: string) => start(async () => {
    const res = await setMatchResult(match.id, winnerId, s1, s2, notes)
    if (res?.error) { setMsg(res.error); return }
    onClose()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-border/60 bg-card w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h3 className="text-sm font-bold text-foreground">Input Hasil</h3>
            <p className="text-xs text-muted-foreground">Round {match.round} · Match {match.match_number}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 items-center">
            {[
              { team: match.team1, score: s1, setScore: setS1 },
              null,
              { team: match.team2, score: s2, setScore: setS2 },
            ].map((item, i) => item === null ? (
              <div key="vs" className="text-center text-lg font-bold text-muted-foreground">vs</div>
            ) : (
              <div key={i} className="text-center">
                <p className="text-xs font-semibold text-foreground truncate mb-2">{item.team?.name}</p>
                <input type="number" min={0} value={item.score}
                  onChange={e => item.setScore(Number(e.target.value))}
                  className="w-full text-center text-2xl font-extrabold bg-muted/30 border border-border/60 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Catatan</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opsional..."
              className="w-full text-sm bg-muted/20 border border-border/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/40" />
          </div>
          {msg && <p className="text-xs text-red-500">{msg}</p>}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { team: match.team1, id: match.team1_id },
              { team: match.team2, id: match.team2_id },
            ].map(({ team, id }) => (
              <Button key={id} disabled={pending} onClick={() => save(id!)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />}
                {team?.name?.split(' ')[0]} Menang
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BracketView({ matches, isAdmin }: BracketViewProps) {
  const [active, setActive] = useState<Match | null>(null)

  if (!matches.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <Trophy className="h-12 w-12 text-muted-foreground/20" />
      <p className="text-sm text-muted-foreground">Bracket belum digenerate</p>
    </div>
  )

  const rounds: Record<number, Match[]> = {}
  matches.forEach(m => { if (!rounds[m.round]) rounds[m.round] = []; rounds[m.round].push(m) })
  const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b)
  const totalRounds = Math.max(...sortedRounds)

  const label = (r: number) => {
    const rem = totalRounds - r
    if (rem === 0) return 'Grand Final'
    if (rem === 1) return 'Semi Final'
    if (rem === 2) return 'Quarter Final'
    return `Round ${r}`
  }

  const champion = matches.find(m => m.round === totalRounds && m.status === 'completed')?.winner

  return (
    <>
      {champion && (
        <div className="flex items-center justify-center gap-3 mb-8 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <Crown className="h-6 w-6 text-amber-400" />
          <div className="text-center">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-0.5">🏆 Juara Turnamen</p>
            <p className="text-xl font-extrabold text-foreground">{champion.name}</p>
          </div>
          <Crown className="h-6 w-6 text-amber-400" />
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-10 min-w-max px-2 items-start">
          {sortedRounds.map(round => (
            <div key={round} className="flex flex-col">
              <div className="text-center mb-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 rounded-full border border-border/40 bg-muted/20">
                  {label(round)}
                </span>
              </div>
              <div className="flex flex-col justify-around gap-6">
                {[...rounds[round]].sort((a, b) => a.match_number - b.match_number).map(m => (
                  <MatchCard key={m.id} match={m} isAdmin={isAdmin} onResult={setActive} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && <ResultDialog match={active} onClose={() => setActive(null)} />}
    </>
  )
}

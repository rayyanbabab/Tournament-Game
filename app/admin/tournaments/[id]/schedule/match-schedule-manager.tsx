'use client'

import { useState } from 'react'
import { updateMatchSchedule, updateMatchScore } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Calendar, MapPin, Trophy, Clock, CheckCircle2,
  Loader2, Save, Swords, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Team { id: string; name: string }
interface Match {
  id: string
  round: number
  match_number: number
  status: string
  team1_id: string | null
  team2_id: string | null
  winner_id: string | null
  score_team1: number | null
  score_team2: number | null
  scheduled_at: string | null
  venue: string | null
  notes: string | null
  team1: Team | null
  team2: Team | null
  winner: Team | null
}

function MatchCard({ match, tournamentId }: { match: Match; tournamentId: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [savingSched, setSavingSched] = useState(false)
  const [savingScore, setSavingScore] = useState(false)
  const [scheduledAt, setScheduledAt] = useState(
    match.scheduled_at ? match.scheduled_at.slice(0, 16) : ''
  )
  const [venue, setVenue] = useState(match.venue ?? '')
  const [notes, setNotes] = useState(match.notes ?? '')
  const [score1, setScore1] = useState(String(match.score_team1 ?? ''))
  const [score2, setScore2] = useState(String(match.score_team2 ?? ''))

  const isBye = match.status === 'bye'
  const isCompleted = match.status === 'completed'
  const hasBothTeams = match.team1_id && match.team2_id
  const team1Name = match.team1?.name ?? 'TBD'
  const team2Name = match.team2?.name ?? 'TBD'

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Menunggu', color: 'bg-muted text-muted-foreground border-border' },
    bye:       { label: 'BYE',      color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
    ongoing:   { label: 'Berlangsung', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    completed: { label: 'Selesai',  color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  }
  const scfg = statusConfig[match.status] ?? statusConfig.pending

  async function handleSaveSchedule() {
    setSavingSched(true)
    const res = await updateMatchSchedule(matchId, tournamentId, {
      scheduled_at: scheduledAt || null,
      venue: venue || null,
      notes: notes || null,
    })
    setSavingSched(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Jadwal disimpan' + (scheduledAt ? ' & notifikasi dikirim' : ''))
    router.refresh()
  }

  async function handleSaveScore() {
    if (!hasBothTeams) { toast.error('Kedua tim belum ditentukan'); return }
    const s1 = parseInt(score1)
    const s2 = parseInt(score2)
    if (isNaN(s1) || isNaN(s2)) { toast.error('Masukkan skor yang valid'); return }
    setSavingScore(true)
    const res = await updateMatchScore(matchId, tournamentId, { score_team1: s1, score_team2: s2 })
    setSavingScore(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Skor disimpan & bracket diperbarui')
    router.refresh()
  }

  const matchId = match.id

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden transition-all',
      isCompleted ? 'border-emerald-500/30' : 'border-border/60'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
            M{match.match_number}
          </span>
          {isBye ? (
            <span className="text-sm font-semibold text-muted-foreground">{team1Name} — BYE (auto-lanjut)</span>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <span className={cn('text-sm font-bold truncate max-w-[120px]', match.winner_id === match.team1_id ? 'text-emerald-600' : 'text-foreground')}>
                {team1Name}
              </span>
              {isCompleted ? (
                <span className="text-sm font-extrabold text-foreground shrink-0">
                  {match.score_team1} – {match.score_team2}
                </span>
              ) : (
                <Swords className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={cn('text-sm font-bold truncate max-w-[120px]', match.winner_id === match.team2_id ? 'text-emerald-600' : 'text-foreground')}>
                {team2Name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {match.scheduled_at && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(match.scheduled_at), 'dd MMM, HH:mm', { locale: idLocale })}
            </span>
          )}
          <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border', scfg.color)}>
            {scfg.label}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded Form */}
      {expanded && !isBye && (
        <div className="border-t border-border/40 bg-muted/10 px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Schedule */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Jadwal Pertandingan
            </p>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Tanggal & Waktu</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Venue / Lokasi</label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="cth: Server Asia, Room 5"
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Catatan</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Instruksi tambahan..."
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <Button size="sm" className="w-full gap-2" onClick={handleSaveSchedule} disabled={savingSched}>
              {savingSched ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Jadwal{scheduledAt ? ' & Kirim Notifikasi' : ''}
            </Button>
          </div>

          {/* Score */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> Input Skor
            </p>
            {!hasBothTeams ? (
              <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Tunggu kedua tim ditentukan</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide truncate block">{team1Name}</label>
                    <input
                      type="number"
                      min={0}
                      value={score1}
                      onChange={e => setScore1(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-2xl font-extrabold text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <span className="text-lg font-bold text-muted-foreground mt-4">:</span>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide truncate block">{team2Name}</label>
                    <input
                      type="number"
                      min={0}
                      value={score2}
                      onChange={e => setScore2(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-2xl font-extrabold text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                {isCompleted && match.winner && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      Pemenang: <span className="font-bold">{match.winner.name}</span>
                    </p>
                  </div>
                )}
                <Button
                  size="sm"
                  variant={isCompleted ? 'outline' : 'default'}
                  className="w-full gap-2"
                  onClick={handleSaveScore}
                  disabled={savingScore}
                >
                  {savingScore ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                  {isCompleted ? 'Perbarui Skor' : 'Simpan Skor & Tentukan Pemenang'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function MatchScheduleManager({
  matches,
  tournamentId,
}: {
  matches: Match[]
  tournamentId: string
}) {
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b)
  const totalRounds = rounds.length

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <Swords className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-base font-semibold text-foreground">Bracket belum dibuat</p>
        <p className="text-sm text-muted-foreground">Generate bracket terlebih dahulu di halaman Bracket</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {rounds.map(round => {
        const roundMatches = matches.filter(m => m.round === round)
        const roundLabel = round === totalRounds ? 'Grand Final' : round === totalRounds - 1 ? 'Semifinal' : `Babak ${round}`
        const completedCount = roundMatches.filter(m => m.status === 'completed' || m.status === 'bye').length
        return (
          <div key={round}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-foreground">{roundLabel}</h3>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                  {completedCount}/{roundMatches.length} selesai
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {roundMatches.map(match => (
                <MatchCard key={match.id} match={match} tournamentId={tournamentId} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

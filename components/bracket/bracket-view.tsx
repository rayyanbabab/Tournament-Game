'use client'

import { cn } from '@/lib/utils'
import { Trophy, Swords, Clock } from 'lucide-react'

export interface MatchTeam {
  id: string
  name: string
}

export interface BracketMatch {
  id: string
  tournament_id: string
  round: number
  match_number: number
  team1: MatchTeam | null
  team2: MatchTeam | null
  team1_score: number | null
  team2_score: number | null
  winner_id: string | null
  status: 'pending' | 'ongoing' | 'completed'
  scheduled_at: string | null
}

interface BracketViewProps {
  matches: BracketMatch[]
  totalRounds: number
  onMatchClick?: (match: BracketMatch) => void
  isAdmin?: boolean
}

const CARD_H = 96    // height of each match card
const CARD_W = 196   // width of each match card
const COL_GAP = 56   // gap between rounds

function getRoundName(round: number, total: number) {
  const fromEnd = total - round
  if (fromEnd === 0) return 'Grand Final'
  if (fromEnd === 1) return 'Semi Final'
  if (fromEnd === 2) return 'Perempat Final'
  if (fromEnd === 3) return 'Babak 16 Besar'
  return `Babak ${round}`
}

function TeamRow({
  team, score, isWinner, showScore,
}: {
  team: MatchTeam | null
  score: number | null
  isWinner: boolean
  showScore: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 h-[44px]',
      isWinner && 'bg-primary/10',
    )}>
      <div className={cn(
        'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 bg-muted',
        !team && 'opacity-40 border border-dashed border-border bg-transparent',
      )}>
        {team ? team.name[0]?.toUpperCase() : '?'}
      </div>
      <span className={cn(
        'text-xs font-medium flex-1 truncate',
        isWinner ? 'text-primary font-semibold' : 'text-foreground',
        !team && 'text-muted-foreground',
      )}>
        {team?.name || 'TBD'}
      </span>
      {showScore && score !== null && (
        <span className={cn(
          'text-xs font-bold tabular-nums px-1.5 py-0.5 rounded shrink-0',
          isWinner ? 'bg-primary/20 text-primary' : 'text-muted-foreground',
        )}>
          {score}
        </span>
      )}
    </div>
  )
}

function MatchCard({ match, onClick, isAdmin }: {
  match: BracketMatch
  onClick?: () => void
  isAdmin?: boolean
}) {
  const done = match.status === 'completed'
  const live = match.status === 'ongoing'
  const clickable = !!onClick && (match.team1 || match.team2)

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={cn(
        'rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm select-none',
        'w-[196px]',
        live && 'border-primary/60 shadow-primary/10',
        clickable && 'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-150',
        isAdmin && !done && (match.team1 && match.team2) && 'ring-1 ring-primary/20',
      )}
    >
      {/* Top color bar */}
      <div className={cn(
        'h-[3px]',
        done ? 'bg-emerald-500' : live ? 'bg-primary animate-pulse' : 'bg-border',
      )} />

      <TeamRow
        team={match.team1}
        score={match.team1_score}
        isWinner={done && match.winner_id === match.team1?.id}
        showScore={done}
      />
      <div className="h-px bg-border/40 mx-3" />
      <TeamRow
        team={match.team2}
        score={match.team2_score}
        isWinner={done && match.winner_id === match.team2?.id}
        showScore={done}
      />

      {/* Footer */}
      <div className={cn(
        'px-3 py-1 flex items-center gap-1 text-[10px]',
        done ? 'text-emerald-600 dark:text-emerald-400' :
        live ? 'text-primary' : 'text-muted-foreground',
      )}>
        {done ? <><Trophy className="h-2.5 w-2.5" />Selesai</>
          : live ? <><Swords className="h-2.5 w-2.5" />Berlangsung</>
          : <><Clock className="h-2.5 w-2.5" />Menunggu</>}
        {isAdmin && !done && match.team1 && match.team2 && (
          <span className="ml-auto text-primary font-medium">Klik → Input skor</span>
        )}
      </div>
    </div>
  )
}

export function BracketView({ matches, totalRounds, onMatchClick, isAdmin }: BracketViewProps) {
  if (totalRounds === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Trophy className="h-12 w-12 opacity-20" />
        <p className="text-sm">Bracket belum dibuat</p>
      </div>
    )
  }

  const totalH = Math.pow(2, totalRounds) * CARD_H
  const totalW = totalRounds * (CARD_W + COL_GAP)

  return (
    <div className="overflow-auto pb-4">
      <div className="relative" style={{ width: totalW, height: totalH + 52 }}>
        {Array.from({ length: totalRounds }, (_, ri) => {
          const round = ri + 1
          const matchCount = Math.pow(2, totalRounds - round)
          const slotH = totalH / matchCount
          const colX = ri * (CARD_W + COL_GAP)
          const roundMatches = matches
            .filter(m => m.round === round)
            .sort((a, b) => a.match_number - b.match_number)

          return (
            <div key={round}>
              {/* Round label */}
              <div
                className="absolute flex justify-center"
                style={{ left: colX, width: CARD_W, top: 0 }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  {getRoundName(round, totalRounds)}
                </span>
              </div>

              {/* Match cards */}
              {Array.from({ length: matchCount }, (_, mi) => {
                const match = roundMatches[mi]
                const cardY = 40 + mi * slotH + slotH / 2 - CARD_H / 2

                // Empty placeholder if match not yet created
                const placeholder: BracketMatch = {
                  id: `ph-${round}-${mi}`, tournament_id: '', round, match_number: mi,
                  team1: null, team2: null, team1_score: null, team2_score: null,
                  winner_id: null, status: 'pending', scheduled_at: null,
                }

                return (
                  <div key={mi} className="absolute" style={{ left: colX, top: cardY }}>
                    <MatchCard
                      match={match || placeholder}
                      onClick={match && onMatchClick ? () => onMatchClick(match) : undefined}
                      isAdmin={isAdmin}
                    />
                  </div>
                )
              })}

              {/* SVG connector lines to next round */}
              {round < totalRounds && (() => {
                const nextMatchCount = matchCount / 2
                const nextSlotH = totalH / nextMatchCount
                const lineStartX = colX + CARD_W
                const lineEndX = lineStartX + COL_GAP

                return (
                  <svg
                    className="absolute pointer-events-none"
                    style={{ left: lineStartX, top: 40, width: COL_GAP, height: totalH }}
                    overflow="visible"
                  >
                    {Array.from({ length: nextMatchCount }, (_, ni) => {
                      const topY = ni * 2 * slotH + slotH / 2
                      const botY = (ni * 2 + 1) * slotH + slotH / 2
                      const midX = COL_GAP
                      const midY = (topY + botY) / 2

                      return (
                        <g key={ni}>
                          {/* Line from top match → midpoint */}
                          <path
                            d={`M 0 ${topY} H ${COL_GAP / 2} V ${midY}`}
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth={1.5}
                          />
                          {/* Line from bottom match → midpoint */}
                          <path
                            d={`M 0 ${botY} H ${COL_GAP / 2} V ${midY}`}
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth={1.5}
                          />
                          {/* Midpoint → next round card */}
                          <path
                            d={`M ${COL_GAP / 2} ${midY} H ${midX}`}
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth={1.5}
                          />
                        </g>
                      )
                    })}
                  </svg>
                )
              })()}
            </div>
          )
        })}

        {/* Champion badge (rightmost) */}
        {(() => {
          const champion = matches.find(m => m.round === totalRounds && m.winner_id)
          const finalMatch = matches.find(m => m.round === totalRounds)
          const winner = finalMatch?.winner_id === finalMatch?.team1?.id
            ? finalMatch?.team1
            : finalMatch?.team2
          if (!winner) return null
          const champX = totalRounds * (CARD_W + COL_GAP) - COL_GAP + 8
          return (
            <div
              className="absolute flex flex-col items-center gap-1"
              style={{ left: champX, top: 40 + totalH / 2 - 40 }}
            >
              <div className="p-3 rounded-full bg-amber-500/10 border-2 border-amber-500/40">
                <Trophy className="h-7 w-7 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 text-center max-w-[80px] truncate">
                {winner.name}
              </span>
              <span className="text-[10px] text-muted-foreground">Juara</span>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

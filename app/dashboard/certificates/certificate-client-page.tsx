'use client'

import { useState } from 'react'
import { CertificateData } from '@/components/certificate/certificate-canvas'
import { CertificateDownload } from '@/components/certificate/certificate-download'
import { Award, Trophy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types'

interface CertificateItem {
  registrationId: string
  teamId: string
  teamName: string
  tournamentId: string
  tournamentName: string
  game: string
  startDate: string
  endDate: string
  prizePool: string | null
  rank: number
  rankLabel: string
  organizerName: string
  primaryColor: string
  secondaryColor: string
}

interface Props {
  certificates: CertificateItem[]
  userName: string
  profile?: Profile | null
}

function getRankBadge(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return '🏅'
}

export function CertificateClientPage({ certificates, userName, profile }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const winners      = certificates.filter(c => c.rank > 0).sort((a, b) => a.rank - b.rank)
  const participants = certificates.filter(c => c.rank === 0)

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  const CertCard = ({ cert }: { cert: CertificateItem }) => {
    const certData: CertificateData = {
      teamName: cert.teamName,
      tournamentName: cert.tournamentName,
      game: cert.game,
      startDate: cert.startDate,
      endDate: cert.endDate,
      rankLabel: cert.rankLabel,
      rank: cert.rank,
      prizePool: cert.prizePool,
      organizerName: cert.organizerName,
      primaryColor: cert.primaryColor,
      secondaryColor: cert.secondaryColor,
    }

    const isWinner = cert.rank > 0 && cert.rank <= 3

    return (
      <div className={`rounded-xl border overflow-hidden transition-all ${
        isWinner
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/50'
          : 'border-border/60 bg-card hover:border-border'
      }`}>
        <button
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/10 transition-colors text-left"
          onClick={() => toggle(cert.registrationId)}
        >
          {/* Rank emoji */}
          <span className="text-2xl shrink-0">{getRankBadge(cert.rank)}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{cert.tournamentName}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded">
                {cert.game}
              </span>
              <span className="text-xs text-muted-foreground">{cert.teamName}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{cert.startDate}</p>
          </div>

          {/* Rank badge + chevron */}
          <div className="shrink-0 flex items-center gap-2">
            <span className={`hidden sm:inline text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              cert.rank === 1 ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' :
              cert.rank === 2 ? 'bg-slate-400/15 text-slate-400 border-slate-400/30' :
              cert.rank === 3 ? 'bg-orange-600/15 text-orange-500 border-orange-500/30' :
              'bg-purple-500/10 text-purple-500 border-purple-500/20'
            }`}>
              {cert.rankLabel}
            </span>
            {expanded === cert.registrationId
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </div>
        </button>

        {expanded === cert.registrationId && (
          <div className="px-5 pb-5 border-t border-border/40 pt-4">
            <CertificateDownload
              data={certData}
              fileName={`sertifikat-${cert.rankLabel.toLowerCase().replace(' ', '')}-${cert.tournamentName.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sertifikat Saya</h1>
              <p className="text-sm text-muted-foreground">Hai, {userName}! 👋</p>
            </div>
          </div>

          {certificates.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Award className="h-10 w-10 text-purple-500/30" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Belum Ada Sertifikat</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Kamu belum mengikuti turnamen yang sertifikatnya sudah diterbitkan.
                </p>
              </div>
              <Button asChild className="mt-2 gap-2">
                <Link href="/tournaments">
                  <Trophy className="h-4 w-4" />
                  Cari Turnamen
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* ── Stats ── */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Sertifikat', value: certificates.length, icon: '📜', color: 'border-purple-500/20 bg-purple-500/5' },
                  { label: 'Sebagai Pemenang', value: winners.length, icon: '🏆', color: 'border-amber-500/20 bg-amber-500/5' },
                  { label: 'Sebagai Peserta', value: participants.length, icon: '🎮', color: 'border-border/60 bg-card' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border ${s.color} p-4 text-center`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Winners ── */}
              {winners.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-foreground">Prestasi Terbaikmu 🎉</h2>
                  </div>
                  <div className="space-y-2">
                    {winners.map(c => <CertCard key={c.registrationId} cert={c} />)}
                  </div>
                </div>
              )}

              {/* ── Participants ── */}
              {participants.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground">Sertifikat Partisipasi</h2>
                  </div>
                  <div className="space-y-2">
                    {participants.map(c => <CertCard key={c.registrationId} cert={c} />)}
                  </div>
                </div>
              )}
            </>
          )}
    </main>
  )
}

'use client'

import { useState } from 'react'
import { CertificateData, drawCertificate } from '@/components/certificate/certificate-canvas'
import { CertificateDownload } from '@/components/certificate/certificate-download'
import { SetResultsForm } from '@/components/certificate/set-results-form'
import { Button } from '@/components/ui/button'
import { Award, Trophy, Users, ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'

interface Team {
  id: string
  name: string
  rank: number
  rankLabel: string
}

interface TournamentInfo {
  id: string
  name: string
  game: string
  startDate: string
  endDate: string
  prizePool: string | null
  organizerName: string
  primaryColor: string
  secondaryColor: string
}

interface Props {
  tournament: TournamentInfo
  teams: Team[]
  existingResults: { team_id: string; rank: number }[]
}

export function CertificateManagerClient({ tournament, teams, existingResults }: Props) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [results, setResults] = useState(existingResults)
  const [bulkDownloading, setBulkDownloading] = useState(false)

  const getCertData = (team: Team): CertificateData => ({
    teamName: team.name,
    tournamentName: tournament.name,
    game: tournament.game,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    rankLabel: team.rankLabel,
    rank: team.rank,
    prizePool: tournament.prizePool,
    organizerName: tournament.organizerName,
    primaryColor: tournament.primaryColor,
    secondaryColor: tournament.secondaryColor,
  })

  const handleBulkDownload = async () => {
    if (teams.length === 0) return
    setBulkDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      toast.info(`Memproses ${teams.length} sertifikat...`)

      for (let i = 0; i < teams.length; i++) {
        const team = teams[i]
        // Draw each certificate to an offscreen canvas using pure Canvas 2D API
        const canvas = document.createElement('canvas')
        drawCertificate(canvas, getCertData(team))
        const imgData = canvas.toDataURL('image/png', 1.0)
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
      }

      pdf.save(`sertifikat-${tournament.name.toLowerCase().replace(/\s+/g, '-')}-all.pdf`)
      toast.success(`${teams.length} sertifikat berhasil digabung dalam 1 PDF!`)
    } catch (err: any) {
      toast.error(`Gagal bulk download: ${err.message}`)
      console.error(err)
    } finally {
      setBulkDownloading(false)
    }
  }

  const winners = teams.filter(t => t.rank > 0).sort((a, b) => a.rank - b.rank)
  const participants = teams.filter(t => t.rank === 0)

  return (
    <div className="space-y-6">
      {/* Set Results Form */}
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Atur Pemenang Turnamen</h2>
        </div>
        <SetResultsForm
          tournamentId={tournament.id}
          teams={teams.map(t => ({ id: t.id, name: t.name }))}
          existingResults={results}
          onSaved={() => window.location.reload()}
        />
      </div>

      {/* Bulk Download */}
      {teams.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">Unduh Semua Sertifikat</p>
              <p className="text-xs text-muted-foreground">{teams.length} sertifikat dalam 1 file PDF</p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={handleBulkDownload}
            disabled={bulkDownloading}
          >
            {bulkDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {bulkDownloading ? 'Memproses...' : 'Unduh Semua'}
          </Button>
        </div>
      )}

      {/* Winners Section */}
      {winners.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Sertifikat Pemenang ({winners.length})
          </h2>
          <div className="space-y-2">
            {winners.map(team => (
              <div key={team.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-500/10 transition-colors"
                  onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                >
                  <span className="text-xl">{team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">{team.name}</p>
                    <p className="text-xs text-amber-600">{team.rankLabel}</p>
                  </div>
                  {expandedTeam === team.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedTeam === team.id && (
                  <div className="px-4 pb-4">
                    <CertificateDownload
                      data={getCertData(team)}
                      fileName={`sertifikat-${team.rankLabel.toLowerCase().replace(' ', '')}-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants Section */}
      {participants.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Sertifikat Peserta ({participants.length})
          </h2>
          <div className="space-y-2">
            {participants.map(team => (
              <div key={team.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                >
                  <span className="text-xl">🏅</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">Peserta</p>
                  </div>
                  {expandedTeam === team.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedTeam === team.id && (
                  <div className="px-4 pb-4">
                    <CertificateDownload
                      data={getCertData(team)}
                      fileName={`sertifikat-peserta-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {teams.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada peserta yang di-approve untuk turnamen ini.</p>
        </div>
      )}
    </div>
  )
}

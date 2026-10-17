'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import {
  Upload,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Trophy,
  RefreshCw,
  Plus,
  Trash2,
  Flame,
  FileText,
  Eye,
  SlidersHorizontal,
  Copy,
  ExternalLink,
  Award,
  Scan,
} from 'lucide-react'
import { GridPlayLogo } from '@/components/gridplay-logo'

// Official Free Fire FFWS / FFML standard scoring system
export const FF_POINT_SYSTEM: Record<number, number> = {
  1: 12, // Booyah
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
}

export interface TeamMatchEntry {
  placement: number
  teamName: string
  kills: number
  placementPoints: number
  totalPoints: number
  confidence?: number // 0 - 100%
  needsReview?: boolean
}

export interface MatchRound {
  id: number
  name: string
  map: string
  entries: TeamMatchEntry[]
  isScanned?: boolean
  scanDuration?: string
}

export const SAMPLE_TEAMS = [
  'EVOS Divine',
  'RRQ Kazu',
  'ONIC Olympus',
  'Bigetron RA',
  'Alter Ego',
  'Dewa United Esports',
  'Genesis Dogma',
  'Morph Team',
  'Thorrad',
  'Tiger Wong Esports',
  'Kagendra',
  'SES Alfaink',
]

// Generate initial sample rounds with realistic Free Fire esports match data
const getInitialRounds = (): MatchRound[] => [
  {
    id: 1,
    name: 'Ronde 1',
    map: 'Bermuda',
    scanDuration: '1.8 dtk',
    isScanned: true,
    entries: [
      { placement: 1, teamName: 'EVOS Divine', kills: 14, placementPoints: 12, totalPoints: 26, confidence: 99 },
      { placement: 2, teamName: 'RRQ Kazu', kills: 9, placementPoints: 9, totalPoints: 18, confidence: 98 },
      { placement: 3, teamName: 'ONIC Olympus', kills: 8, placementPoints: 8, totalPoints: 16, confidence: 97 },
      { placement: 4, teamName: 'Bigetron RA', kills: 6, placementPoints: 7, totalPoints: 13, confidence: 96 },
      { placement: 5, teamName: 'Alter Ego', kills: 5, placementPoints: 6, totalPoints: 11, confidence: 95 },
      { placement: 6, teamName: 'Dewa United Esports', kills: 4, placementPoints: 5, totalPoints: 9, confidence: 94 },
      { placement: 7, teamName: 'Genesis Dogma', kills: 3, placementPoints: 4, totalPoints: 7, confidence: 92 },
      { placement: 8, teamName: 'Morph Team', kills: 3, placementPoints: 3, totalPoints: 6, confidence: 91 },
      { placement: 9, teamName: 'Thorrad', kills: 2, placementPoints: 2, totalPoints: 4, confidence: 89 },
      { placement: 10, teamName: 'Tiger Wong Esports', kills: 1, placementPoints: 1, totalPoints: 2, confidence: 88 },
      { placement: 11, teamName: 'Kagendra', kills: 2, placementPoints: 0, totalPoints: 2, confidence: 85 },
      { placement: 12, teamName: 'SES Alfaink', kills: 1, placementPoints: 0, totalPoints: 1, confidence: 84 },
    ],
  },
  {
    id: 2,
    name: 'Ronde 2',
    map: 'Purgatory',
    scanDuration: '1.9 dtk',
    isScanned: true,
    entries: [
      { placement: 1, teamName: 'RRQ Kazu', kills: 12, placementPoints: 12, totalPoints: 24, confidence: 99 },
      { placement: 2, teamName: 'ONIC Olympus', kills: 10, placementPoints: 9, totalPoints: 19, confidence: 98 },
      { placement: 3, teamName: 'EVOS Divine', kills: 7, placementPoints: 8, totalPoints: 15, confidence: 97 },
      { placement: 4, teamName: 'Alter Ego', kills: 8, placementPoints: 7, totalPoints: 15, confidence: 96 },
      { placement: 5, teamName: 'Bigetron RA', kills: 4, placementPoints: 6, totalPoints: 10, confidence: 95 },
      { placement: 6, teamName: 'Thorrad', kills: 5, placementPoints: 5, totalPoints: 10, confidence: 94 },
      { placement: 7, teamName: 'Dewa United Esports', kills: 3, placementPoints: 4, totalPoints: 7, confidence: 93 },
      { placement: 8, teamName: 'Tiger Wong Esports', kills: 4, placementPoints: 3, totalPoints: 7, confidence: 91 },
      { placement: 9, teamName: 'Genesis Dogma', kills: 2, placementPoints: 2, totalPoints: 4, confidence: 89 },
      { placement: 10, teamName: 'SES Alfaink', kills: 2, placementPoints: 1, totalPoints: 3, confidence: 88 },
      { placement: 11, teamName: 'Morph Team', kills: 1, placementPoints: 0, totalPoints: 1, confidence: 86 },
      { placement: 12, teamName: 'Kagendra', kills: 0, placementPoints: 0, totalPoints: 0, confidence: 84 },
    ],
  },
  {
    id: 3,
    name: 'Ronde 3',
    map: 'Kalahari',
    scanDuration: '1.7 dtk',
    isScanned: true,
    entries: [
      { placement: 1, teamName: 'Bigetron RA', kills: 13, placementPoints: 12, totalPoints: 25, confidence: 99 },
      { placement: 2, teamName: 'EVOS Divine', kills: 11, placementPoints: 9, totalPoints: 20, confidence: 98 },
      { placement: 3, teamName: 'Alter Ego', kills: 7, placementPoints: 8, totalPoints: 15, confidence: 96 },
      { placement: 4, teamName: 'RRQ Kazu', kills: 5, placementPoints: 7, totalPoints: 12, confidence: 95 },
      { placement: 5, teamName: 'ONIC Olympus', kills: 6, placementPoints: 6, totalPoints: 12, confidence: 94 },
      { placement: 6, teamName: 'Genesis Dogma', kills: 5, placementPoints: 5, totalPoints: 10, confidence: 93 },
      { placement: 7, teamName: 'Dewa United Esports', kills: 3, placementPoints: 4, totalPoints: 7, confidence: 91 },
      { placement: 8, teamName: 'Morph Team', kills: 4, placementPoints: 3, totalPoints: 7, confidence: 90 },
      { placement: 9, teamName: 'Thorrad', kills: 2, placementPoints: 2, totalPoints: 4, confidence: 89 },
      { placement: 10, teamName: 'Kagendra', kills: 3, placementPoints: 1, totalPoints: 4, confidence: 87 },
      { placement: 11, teamName: 'SES Alfaink', kills: 1, placementPoints: 0, totalPoints: 1, confidence: 85 },
      { placement: 12, teamName: 'Tiger Wong Esports', kills: 0, placementPoints: 0, totalPoints: 0, confidence: 83 },
    ],
  },
]

export function GridPlayScanner() {
  const [rounds, setRounds] = useState<MatchRound[]>(getInitialRounds)
  const [activeRoundId, setActiveRoundId] = useState<number>(1)
  const [tournamentName, setTournamentName] = useState('GRIDPLAY COMMUNITY CUP SEASON 4')
  const [organizerName, setOrganizerName] = useState('Norvus Community')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'standings' | 'round_editor' | 'certificate' | 'overlay'>('standings')
  const [exportingImage, setExportingImage] = useState(false)

  const leaderboardRef = useRef<HTMLDivElement>(null)
  const certificateRef = useRef<HTMLDivElement>(null)

  const currentRound = rounds.find((r) => r.id === activeRoundId) || rounds[0]

  // Calculate Cumulative Standings across all rounds
  const overallStandings = React.useMemo(() => {
    const stats: Record<
      string,
      {
        teamName: string
        matches: number
        booyahs: number
        placementPoints: number
        killPoints: number
        totalPoints: number
        historyPoints: number[]
      }
    > = {}

    // Initialize all known teams
    rounds.forEach((round) => {
      round.entries.forEach((entry) => {
        if (!stats[entry.teamName]) {
          stats[entry.teamName] = {
            teamName: entry.teamName,
            matches: 0,
            booyahs: 0,
            placementPoints: 0,
            killPoints: 0,
            totalPoints: 0,
            historyPoints: [],
          }
        }
      })
    })

    // Aggregate round by round
    rounds.forEach((round) => {
      round.entries.forEach((entry) => {
        if (stats[entry.teamName]) {
          stats[entry.teamName].matches += 1
          if (entry.placement === 1) {
            stats[entry.teamName].booyahs += 1
          }
          stats[entry.teamName].placementPoints += entry.placementPoints
          stats[entry.teamName].killPoints += entry.kills
          stats[entry.teamName].totalPoints += entry.totalPoints
          stats[entry.teamName].historyPoints.push(entry.totalPoints)
        }
      })
    })

    // Sort by Total Points (descending), then Booyahs, then Kill Points
    const sorted = Object.values(stats).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      if (b.booyahs !== a.booyahs) return b.booyahs - a.booyahs
      return b.killPoints - a.killPoints
    })

    // Assign rank and delta indicators
    return sorted.map((team, idx) => {
      const rank = idx + 1
      // Realistic rank delta simulation based on performance
      let delta = 0
      if (idx === 0) delta = 0 // Top leader
      else if (idx === 1) delta = 1 // Moved up
      else if (idx === 2) delta = -1 // Moved down
      else if (idx === 3) delta = 2
      else if (idx % 2 === 0) delta = -1
      else delta = 0

      return {
        ...team,
        rank,
        delta,
      }
    })
  }, [rounds])

  // Top fragger (Most Kills)
  const topFragger = React.useMemo(() => {
    return [...overallStandings].sort((a, b) => b.killPoints - a.killPoints)[0] || null
  }, [overallStandings])

  // Handle OCR simulated scanner on image upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string)
      runOcrSimulation()
    }
    reader.readAsDataURL(file)
  }

  const runOcrSimulation = () => {
    setIsScanning(true)
    setScanProgress(10)

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 15
      })
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setIsScanning(false)
      setScanProgress(100)

      // Randomize or update round entries to simulate successful OCR capture
      const updatedEntries: TeamMatchEntry[] = SAMPLE_TEAMS.map((team, index) => {
        const placement = index + 1
        const kills = Math.max(0, Math.floor(Math.random() * 12) - index)
        const placementPoints = FF_POINT_SYSTEM[placement] || 0
        const totalPoints = placementPoints + kills
        const confidence = Math.floor(Math.random() * 8) + 92
        return {
          placement,
          teamName: team,
          kills,
          placementPoints,
          totalPoints,
          confidence,
          needsReview: confidence < 90,
        }
      })

      setRounds((prev) =>
        prev.map((r) =>
          r.id === activeRoundId
            ? { ...r, entries: updatedEntries, isScanned: true, scanDuration: '1.8 dtk' }
            : r
        )
      )

      toast.success(`OCR Berhasil! 12 tim terbaca dalam 1.8 detik.`)
    }, 1800)
  }

  // Update a single entry's kills or placement manually
  const handleUpdateEntry = (
    roundId: number,
    placement: number,
    field: 'teamName' | 'kills' | 'placement',
    value: string | number
  ) => {
    setRounds((prev) =>
      prev.map((round) => {
        if (round.id !== roundId) return round

        const newEntries = round.entries.map((entry) => {
          if (entry.placement !== placement) return entry

          const updated = { ...entry }
          if (field === 'teamName') updated.teamName = String(value)
          if (field === 'kills') {
            const kills = Math.max(0, Number(value) || 0)
            updated.kills = kills
            updated.totalPoints = updated.placementPoints + kills
          }
          if (field === 'placement') {
            const newPl = Math.max(1, Math.min(12, Number(value) || 1))
            updated.placement = newPl
            updated.placementPoints = FF_POINT_SYSTEM[newPl] || 0
            updated.totalPoints = updated.placementPoints + updated.kills
          }
          return updated
        })

        // Sort by placement
        newEntries.sort((a, b) => a.placement - b.placement)

        return { ...round, entries: newEntries }
      })
    )
  }

  // Add new round
  const handleAddRound = () => {
    const newId = rounds.length + 1
    const maps = ['Bermuda', 'Purgatory', 'Kalahari', 'Nexterra', 'Alpine']
    const assignedMap = maps[(newId - 1) % maps.length]

    const emptyEntries: TeamMatchEntry[] = SAMPLE_TEAMS.map((team, idx) => ({
      placement: idx + 1,
      teamName: team,
      kills: 0,
      placementPoints: FF_POINT_SYSTEM[idx + 1] || 0,
      totalPoints: FF_POINT_SYSTEM[idx + 1] || 0,
    }))

    const newRound: MatchRound = {
      id: newId,
      name: `Ronde ${newId}`,
      map: assignedMap,
      entries: emptyEntries,
      isScanned: false,
    }

    setRounds((prev) => [...prev, newRound])
    setActiveRoundId(newId)
    toast.success(`Ronde ${newId} (${assignedMap}) ditambahkan.`)
  }

  // Export Leaderboard Standings as HD Image PNG
  const handleExportPNG = async () => {
    if (!leaderboardRef.current) return
    setExportingImage(true)
    try {
      const canvas = await html2canvas(leaderboardRef.current, {
        scale: 2,
        backgroundColor: '#09090b',
        useCORS: true,
      })
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `Klasemen-${tournamentName.replace(/\s+/g, '-')}.png`
      link.click()
      toast.success('Gambar klasemen berhasil diunduh (HD PNG)!')
    } catch {
      toast.error('Gagal mengekspor gambar.')
    } finally {
      setExportingImage(false)
    }
  }

  // Copy share link
  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/overlay` : 'https://gridplay.my.id'
    navigator.clipboard.writeText(url)
    toast.success('Link live klasemen disalin ke clipboard!')
  }

  return (
    <div className="space-y-10">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
              — AUTO HITUNG POINT & KLASEMEN FREE FIRE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              OCR ONLINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hitung Poin Otomatis & Klasemen FF
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Scan screenshot endgame Free Fire, hitung point per match, cetak sertifikat juara, dan unduh papan skor PNG.
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5 transition-all"
          >
            <Copy className="h-3.5 w-3.5" />
            Salin Link Live
          </button>
          <button
            onClick={handleExportPNG}
            disabled={exportingImage}
            className="px-5 py-2 rounded-full text-xs font-medium bg-foreground text-background hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingImage ? 'Memproses PNG...' : 'Ekspor PNG HD'}
          </button>
        </div>
      </div>

      {/* ── Interactive OCR Upload Banner ── */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left instructions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-mono text-muted-foreground">
              <Scan className="h-3.5 w-3.5 text-foreground" />
              SCANNER MATCH · STANDAR FFWS / FFML
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Unggah Screenshot Match {currentRound.name} ({currentRound.map})
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tarik atau pilih tangkapan layar tabel hasil akhir game Free Fire. Sistem scanner otomatis membaca nama tim, rank, dan total kill tanpa perlu rekap manual di spreadsheet.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm">
                <Upload className="h-4 w-4" />
                Pilih Screenshot dari Galeri
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
                  }}
                />
              </label>

              <button
                onClick={runOcrSimulation}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                Uji Coba dengan Sample Match
              </button>
            </div>
          </div>

          {/* Right OCR Preview Box */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-xl overflow-hidden min-h-[160px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-3 border-b border-zinc-800">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  STATUS SCANNER: {isScanning ? 'MEMINDAI TABEL...' : 'SIAP DIGUNAKAN'}
                </span>
                <span>{currentRound.scanDuration || '1.8 DTK'}</span>
              </div>

              <div className="py-4">
                {isScanning ? (
                  <div className="space-y-2 text-center py-2">
                    <p className="text-xs font-mono text-zinc-300 tracking-wide">
                      Membaca data tabel hasil pertandingan...
                    </p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Mengekstrak 12 Baris Tim & Menghitung Booyah...
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        12 Tim Terdeteksi di {currentRound.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Akurasi OCR: 98.4% · Format Poin 12-9-8-7-6-5-4-3-2-1
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80 flex justify-between">
                <span>MODEL: GRIDPLAY-VISION-V4</span>
                <span>TIE-BREAKER: BOOYAH &gt; KILLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'standings', label: 'Klasemen Keseluruhan', icon: Trophy },
            { id: 'round_editor', label: 'Detail & Edit Ronde', icon: SlidersHorizontal },
            { id: 'certificate', label: 'Cetak Sertifikat Juara', icon: Award },
            { id: 'overlay', label: 'OBS Live Overlay', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Round Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoundId(r.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeRoundId === r.id
                  ? 'bg-muted border border-border font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.name}
            </button>
          ))}
          <button
            onClick={handleAddRound}
            className="p-1 px-2 rounded-lg text-xs font-medium border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 transition-all"
            title="Tambah Ronde Baru"
          >
            <Plus className="h-3 w-3" />
            Ronde
          </button>
        </div>
      </div>

      {/* ── TAB 1: KLASEMEN KESELURUHAN (STANDINGS) ── */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          {/* Card Leaderboard for Export & Display */}
          <div
            ref={leaderboardRef}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Header Leaderboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold text-zinc-100">
                  GP
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-white font-sans">
                    {tournamentName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono">
                    <span>{rounds.length} MATCH SELESAI</span>
                    <span>•</span>
                    <span>ORGANIZER: {organizerName}</span>
                    <span>•</span>
                    <span className="text-emerald-400">OFFICIAL STANDINGS</span>
                  </div>
                </div>
              </div>

              {topFragger && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                      PREDATOR / MOST KILL
                    </span>
                    <p className="text-xs font-bold text-white">
                      {topFragger.teamName} ({topFragger.killPoints} Kills)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Table Standings */}
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-4">TIM</th>
                    <th className="py-3 px-3 text-center">MATCH</th>
                    <th className="py-3 px-3 text-center">BOOYAH</th>
                    <th className="py-3 px-3 text-center">PLACE PTS</th>
                    <th className="py-3 px-3 text-center">KILL PTS</th>
                    <th className="py-3 px-4 text-right font-bold text-white">TOTAL POIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {overallStandings.map((team, idx) => {
                    const isPodium = idx < 3
                    return (
                      <tr
                        key={team.teamName}
                        className={`hover:bg-zinc-900/60 transition-colors ${
                          idx === 0 ? 'bg-zinc-900/40' : ''
                        }`}
                      >
                        {/* Rank with indicator */}
                        <td className="py-3.5 px-3 text-center font-mono">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`font-bold ${
                                idx === 0
                                  ? 'text-amber-400'
                                  : idx === 1
                                  ? 'text-zinc-300'
                                  : idx === 2
                                  ? 'text-amber-600'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {String(team.rank).padStart(2, '0')}
                            </span>
                            {/* Delta movement indicator */}
                            {team.delta > 0 && (
                              <span className="text-[10px] text-emerald-400 font-bold">▲</span>
                            )}
                            {team.delta < 0 && (
                              <span className="text-[10px] text-rose-500 font-bold">▼</span>
                            )}
                            {team.delta === 0 && (
                              <span className="text-[10px] text-zinc-600 font-bold">—</span>
                            )}
                          </div>
                        </td>

                        {/* Team Name with tag badge */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 uppercase">
                              {team.teamName.slice(0, 3)}
                            </div>
                            <span className="font-semibold text-white tracking-tight">
                              {team.teamName}
                            </span>
                            {idx === 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                LEADER
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Matches */}
                        <td className="py-3.5 px-3 text-center font-mono text-zinc-400">
                          {team.matches}
                        </td>

                        {/* Booyahs */}
                        <td className="py-3.5 px-3 text-center font-mono">
                          {team.booyahs > 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              🏆 {team.booyahs}
                            </span>
                          ) : (
                            <span className="text-zinc-600">0</span>
                          )}
                        </td>

                        {/* Placement Pts */}
                        <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                          {team.placementPoints}
                        </td>

                        {/* Kill Pts */}
                        <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                          {team.killPoints}
                        </td>

                        {/* Total Points */}
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-base text-white">
                          {team.totalPoints}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer graphic */}
            <div className="mt-8 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-zinc-500">
              <span>GENERATED BY GRIDPLAY.MY.ID · PLATFORM AUTO HITUNG POINT FREE FIRE</span>
              <span>SISTEM POIN RESMI GARENA ESPORTS FFWS</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DETAIL & EDIT RONDE (ROUND EDITOR) ── */}
      {activeTab === 'round_editor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-muted/20">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tabel Hasil {currentRound.name} — Map: {currentRound.map}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nilai point dihitung otomatis berdasarkan placement (12, 9, 8, 7...) + 1 poin per kill.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Map:</span>
              <select
                value={currentRound.map}
                onChange={(e) => {
                  const newMap = e.target.value
                  setRounds((prev) =>
                    prev.map((r) => (r.id === activeRoundId ? { ...r, map: newMap } : r))
                  )
                }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium"
              >
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Nexterra">Nexterra</option>
                <option value="Alpine">Alpine</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-mono uppercase text-muted-foreground">
                    <th className="py-3 px-3 text-center w-14">RANK</th>
                    <th className="py-3 px-4">NAMA TIM</th>
                    <th className="py-3 px-3 text-center w-24">KILLS</th>
                    <th className="py-3 px-3 text-center w-28">PLACE PTS</th>
                    <th className="py-3 px-4 text-right w-28 font-bold">TOTAL POIN</th>
                    <th className="py-3 px-3 text-center w-24">STATUS OCR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {currentRound.entries.map((entry) => (
                    <tr key={entry.placement} className="hover:bg-muted/30 transition-colors">
                      {/* Placement */}
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        #{entry.placement}
                      </td>

                      {/* Team Name Input */}
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={entry.teamName}
                          onChange={(e) =>
                            handleUpdateEntry(currentRound.id, entry.placement, 'teamName', e.target.value)
                          }
                          className="w-full max-w-sm px-2.5 py-1 rounded-md border border-border/60 bg-background text-xs font-medium focus:border-foreground focus:outline-none"
                        />
                      </td>

                      {/* Kills Input */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={entry.kills}
                          onChange={(e) =>
                            handleUpdateEntry(currentRound.id, entry.placement, 'kills', e.target.value)
                          }
                          className="w-16 px-2 py-1 rounded-md border border-border/60 bg-background text-xs text-center font-mono focus:border-foreground focus:outline-none"
                        />
                      </td>

                      {/* Placement Points (Auto computed) */}
                      <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                        {entry.placementPoints} pts
                      </td>

                      {/* Total Points */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {entry.totalPoints}
                      </td>

                      {/* Status / Confidence */}
                      <td className="py-3 px-3 text-center">
                        {entry.confidence ? (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            ✓ {entry.confidence}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground">Manual</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CETAK SERTIFIKAT JUARA ── */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Generator Sertifikat E-Turnamen Otomatis
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cetak sertifikat resmi untuk Juara 1 (Champion), Juara 2, Juara 3, dan Predator (Most Kill).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nama Penyelenggara"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
              />
              <button
                onClick={async () => {
                  if (!certificateRef.current) return
                  const canvas = await html2canvas(certificateRef.current, { scale: 2 })
                  const img = canvas.toDataURL('image/png')
                  const a = document.createElement('a')
                  a.href = img
                  a.download = `Sertifikat-${overallStandings[0]?.teamName || 'Juara'}.png`
                  a.click()
                  toast.success('Sertifikat berhasil diunduh!')
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Sertifikat (PNG)
              </button>
            </div>
          </div>

          {/* Certificate Canvas Preview */}
          <div
            ref={certificateRef}
            className="w-full max-w-4xl mx-auto rounded-3xl border-8 border-amber-500/20 bg-zinc-950 text-zinc-100 p-10 sm:p-14 relative shadow-2xl overflow-hidden"
          >
            {/* Elegant corner accents */}
            <div className="absolute top-4 left-4 h-12 w-12 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-4 right-4 h-12 w-12 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-amber-400" />

            <div className="text-center space-y-6 relative z-10">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-amber-400" />
                </div>
              </div>

              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
                  SERTIFIKAT PENGHARGAAN
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 uppercase">
                  JUARA 1 · BOOYAH CHAMPION
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-widest">
                  {tournamentName}
                </p>
              </div>

              <div className="py-6 border-y border-zinc-800 max-w-md mx-auto space-y-2">
                <p className="text-xs text-zinc-400">Diberikan dengan bangga kepada Tim:</p>
                <h3 className="text-3xl font-extrabold text-amber-300 tracking-tight uppercase">
                  {overallStandings[0]?.teamName || 'EVOS Divine'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Total Poin: {overallStandings[0]?.totalPoints} · Total Booyah: {overallStandings[0]?.booyahs} · Kills: {overallStandings[0]?.killPoints}
                </p>
              </div>

              <div className="flex justify-between items-end pt-8 max-w-lg mx-auto text-xs text-zinc-400">
                <div className="text-center">
                  <div className="h-0.5 w-32 bg-zinc-700 mb-2 mx-auto" />
                  <p className="font-semibold text-white">{organizerName}</p>
                  <p className="text-[10px] text-zinc-500">Penyelenggara Turnamen</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center mx-auto mb-2 text-[9px] font-mono text-amber-300">
                    VERIFIED
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">GRIDPLAY CERTIFIED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: OBS LIVE OVERLAY PREVIEW ── */}
      {activeTab === 'overlay' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                OBS Studio / Streamlabs Live Overlay
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tambahkan URL ini sebagai Browser Source di OBS Studio untuk menampilkan papan skor transparan siaran langsung.
              </p>
            </div>
            <Link
              href="/overlay"
              target="_blank"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 flex items-center gap-1.5 shadow-sm"
            >
              Buka Tab Siaran OBS <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border/80 bg-zinc-950 p-6 text-zinc-100">
            <p className="text-xs font-mono text-zinc-400 mb-4 uppercase tracking-wider">
              PRATINJAU TAMPILAN OBS (TRANSPARENT TICKER)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {overallStandings.slice(0, 6).map((team) => (
                <div
                  key={team.teamName}
                  className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      #{team.rank}
                    </span>
                    <span className="text-xs font-bold text-white">{team.teamName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-extrabold text-white">
                      {team.totalPoints} PTS
                    </span>
                    <p className="text-[10px] text-zinc-500 font-mono">{team.killPoints} Kills</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

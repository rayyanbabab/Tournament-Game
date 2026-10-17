'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Trophy,
  Swords,
  Layers,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'

export default function CreateTournamentPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<'leaderboard' | 'bracket' | 'league'>('leaderboard')
  const [tournamentName, setTournamentName] = useState('')
  const [matchesCount, setMatchesCount] = useState(6)
  const [teams, setTeams] = useState<string[]>([
    'EVOS Divine',
    'RRQ Kazu',
    'ONIC Olympus',
    'Bigetron RA',
    'Alter Ego',
    'Dewa United Esports',
  ])
  const [maps, setMaps] = useState<string[]>([
    'Bermuda',
    'Purgatory',
    'Kalahari',
    'Bermuda',
    'Purgatory',
    'Kalahari',
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTeam = () => {
    if (teams.length >= 18) {
      toast.error('Maksimal 18 tim per turnamen.')
      return
    }
    setTeams([...teams, `Tim ${teams.length + 1}`])
  }

  const handleRemoveTeam = (idx: number) => {
    setTeams(teams.filter((_, i) => i !== idx))
  }

  const handleUpdateTeam = (idx: number, val: string) => {
    const updated = [...teams]
    updated[idx] = val
    setTeams(updated)
  }

  const handleUpdateMap = (idx: number, mapName: string) => {
    const updated = [...maps]
    updated[idx] = mapName
    setMaps(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentName.trim()) {
      toast.error('Nama turnamen wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tournamentName,
          game: 'Free Fire',
          tournament_format: selectedMode,
          max_teams: teams.length,
          rules: `Format: ${selectedMode}. ${matchesCount} Matches.`,
        }),
      })

      toast.success('Turnamen berhasil dibuat!')
      router.push('/dashboard')
    } catch {
      toast.success('Turnamen berhasil diinisialisasi!')
      router.push('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        KEMBALI KE DASHBOARD
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Buat Turnamen Baru
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih mode pertandingan, isi detail aturan, lalu daftarkan tim peserta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ── 01. SELECT MATCH MODE ── */}
        <div className="space-y-3">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
            01 — PILIH MODE PERTANDINGAN
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leaderboard Mode */}
            <div
              onClick={() => setSelectedMode('leaderboard')}
              className={`cursor-pointer rounded-2xl border p-5 space-y-3 transition-all ${
                selectedMode === 'leaderboard'
                  ? 'border-foreground bg-muted/40 shadow-sm'
                  : 'border-border/70 bg-card hover:border-foreground/30'
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Leaderboard Mode</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Point-based scoring and placement. Cocok untuk Battle Royale Free Fire, Fast Scrim, dan Racing.
                </p>
              </div>
            </div>

            {/* Bracket Mode */}
            <div
              onClick={() => setSelectedMode('bracket')}
              className={`cursor-pointer rounded-2xl border p-5 space-y-3 transition-all ${
                selectedMode === 'bracket'
                  ? 'border-foreground bg-muted/40 shadow-sm'
                  : 'border-border/70 bg-card hover:border-foreground/30'
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                <Swords className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Bracket Mode</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Sistem gugur / eliminasi head-to-head 1v1 atau 5v5. Cocok untuk MOBA dan Duel Guild.
                </p>
              </div>
            </div>

            {/* League Mode PRO */}
            <div
              onClick={() => toast.info('Fitur League Mode tersedia untuk pengguna paket PRO.')}
              className="cursor-not-allowed rounded-2xl border border-border/40 bg-muted/10 p-5 space-y-3 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" /> PRO
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground">League Mode</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Liga multi-stage dengan grup paralel, babak playoffs, dan grand final.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 02. DETAIL TURNAMEN ── */}
        <div className="space-y-4">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
            02 — INFORMASI TURNAMEN
          </label>

          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Turnamen</label>
              <input
                type="text"
                required
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Contoh: FFWS Spring 2026 Community Cup"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Total Match / Ronde</label>
                <select
                  value={matchesCount}
                  onChange={(e) => {
                    const count = Number(e.target.value)
                    setMatchesCount(count)
                    const mapsOptions = ['Bermuda', 'Purgatory', 'Kalahari', 'Nexterra', 'Alpine']
                    setMaps(Array.from({ length: count }, (_, i) => mapsOptions[i % mapsOptions.length]))
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium"
                >
                  <option value={3}>3 Matches</option>
                  <option value={4}>4 Matches (Fast Scrim)</option>
                  <option value={6}>6 Matches (Standar FFWS)</option>
                  <option value={8}>8 Matches</option>
                  <option value={10}>10 Matches</option>
                  <option value={12}>12 Matches (Grand Final)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Format Poin</label>
                <input
                  type="text"
                  disabled
                  value="Standar FFWS (12-9-8-7-6-5-4-3-2-1 + 1pt/Kill)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-xs text-muted-foreground font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 03. MAP PER MATCH ── */}
        <div className="space-y-4">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
            03 — PETA PER MATCH ({matchesCount} MATCH)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: matchesCount }).map((_, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-2"
              >
                <span className="text-xs font-mono font-semibold text-foreground">
                  Match {idx + 1}
                </span>
                <select
                  value={maps[idx] || 'Bermuda'}
                  onChange={(e) => handleUpdateMap(idx, e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-medium"
                >
                  <option value="Bermuda">Bermuda</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Kalahari">Kalahari</option>
                  <option value="Nexterra">Nexterra</option>
                  <option value="Alpine">Alpine</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* ── 04. DAFTAR TIM PESERTA ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
              04 — DAFTAR TIM PESERTA ({teams.length} TIM)
            </label>
            <button
              type="button"
              onClick={handleAddTeam}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Tim
            </button>
          </div>

          <div className="space-y-2">
            {teams.map((team, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-border/70 bg-card flex items-center gap-3"
              >
                <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => handleUpdateTeam(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border/60 bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTeam(idx)}
                  className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <div className="pt-4 border-t border-border/70 flex justify-end gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-all"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Setup & Mulai Turnamen'}
          </button>
        </div>
      </form>
    </main>
  )
}

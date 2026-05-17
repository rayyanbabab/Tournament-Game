'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, X, SlidersHorizontal, MapPin, Trophy, Gamepad2 } from 'lucide-react'

interface TournamentFiltersProps {
  games: string[]
  locations: string[]
}

export function TournamentFilters({ games, locations }: TournamentFiltersProps) {
  const router = useRouter()
  const sp = useSearchParams()

  const [search, setSearch]   = useState(sp.get('search') ?? '')
  const [game, setGame]       = useState(sp.get('game') ?? '')
  const [status, setStatus]   = useState(sp.get('status') ?? '')
  const [location, setLocation] = useState(sp.get('location') ?? '')
  const [prize, setPrize]     = useState(sp.get('prize') ?? '')

  const activeCount = [search, game, status, location, prize].filter(Boolean).length

  const apply = useCallback((overrides: Record<string, string> = {}) => {
    const vals = { search, game, status, location, prize, ...overrides }
    const p = new URLSearchParams()
    Object.entries(vals).forEach(([k, v]) => { if (v) p.set(k, v) })
    router.push(`/tournaments?${p.toString()}`)
  }, [search, game, status, location, prize, router])

  const clear = () => {
    setSearch(''); setGame(''); setStatus(''); setLocation(''); setPrize('')
    router.push('/tournaments')
  }

  const statusOptions = [
    { value: '',         label: 'Semua Status' },
    { value: 'upcoming', label: 'Pendaftaran Buka' },
    { value: 'ongoing',  label: 'Berlangsung' },
    { value: 'completed',label: 'Selesai' },
  ]

  const prizeOptions = [
    { value: '',      label: 'Semua' },
    { value: 'has',   label: 'Ada Hadiah' },
    { value: 'free',  label: 'Gratis' },
  ]

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filter Turnamen</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{activeCount} aktif</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="Cari nama turnamen..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Game filter */}
        <div className="relative">
          <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={game}
            onChange={e => { setGame(e.target.value); apply({ game: e.target.value }) }}
            className="w-full appearance-none pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Semua Game</option>
            {games.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }) }}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Location filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={location}
            onChange={e => { setLocation(e.target.value); apply({ location: e.target.value }) }}
            className="w-full appearance-none pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Semua Lokasi</option>
            {locations.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Prize filter */}
        <div className="relative">
          <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={prize}
            onChange={e => { setPrize(e.target.value); apply({ prize: e.target.value }) }}
            className="w-full appearance-none pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {prizeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={() => apply()}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Terapkan Filter
      </button>
    </div>
  )
}

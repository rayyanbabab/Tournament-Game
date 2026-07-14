'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, Trophy, BarChart3, Network, Layers, Check,
  Users, Swords, Calendar, Image as ImageIcon, MapPin, Phone,
  FileText, Coins, Info, Gamepad2,
} from 'lucide-react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { cn } from '@/lib/utils'
import {
  GAME_CONFIGS, getGameConfig,
  FFIM_PLACEMENT, PMGC_PLACEMENT,
  LB_SCORING_OPTIONS, LB_DURATION_OPTIONS, LB_SLOTS,
  BRACKET_FORMAT_OPTIONS, LEAGUE_SLOTS,
  MatchMode, BracketFormat, LBScoringFormat, LBDuration,
} from '@/lib/game-config'

const TARGET_POINTS = [60, 80, 100, 120]

const MODES: { key: MatchMode; icon: React.ElementType; title: string; desc: string; color: string }[] = [
  { key: 'leaderboard', icon: BarChart3, title: 'Leaderboard Mode', desc: 'Point-based scoring. Great for Battle Royale, Racing, FFA.', color: 'border-amber-500 bg-amber-500/10 text-amber-500' },
  { key: 'bracket',     icon: Network,   title: 'Bracket Mode',     desc: 'Elimination system. Great for MOBA, Tactical Shooter, Sports.', color: 'border-red-500 bg-red-500/10 text-red-500' },
  { key: 'league',      icon: Layers,    title: 'League Mode',      desc: 'Multi-stage league with Playoffs, Play-ins, Grand Final.', color: 'border-violet-500 bg-violet-500/10 text-violet-500' },
]

// ── Helper ────────────────────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  )
}

function FieldBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card p-5 space-y-4', className)}>
      {children}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreateTournamentPage() {
  const [matchMode, setMatchMode] = useState<MatchMode | null>(null)
  const [bracketFormat, setBracketFormat] = useState<BracketFormat>('single')
  const [leagueSlot, setLeagueSlot] = useState<number>(24)
  // Leaderboard-specific
  const [lbScoring, setLbScoring] = useState<LBScoringFormat | null>(null)
  const [lbDuration, setLbDuration] = useState<LBDuration | null>(null)
  const [lbTargetPts, setLbTargetPts] = useState(80)
  const [lbSlot, setLbSlot] = useState<number | null>(null)
  const [lbMatchCount, setLbMatchCount] = useState(6)
  const [lbMaps, setLbMaps] = useState<string[]>([])
  const [lbCustomScoring, setLbCustomScoring] = useState(false)
  const [lbKillPts, setLbKillPts] = useState(1)
  const [lbPlacement, setLbPlacement] = useState<number[]>([...FFIM_PLACEMENT])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  // DB game configs (fetched on mount, fallback to static)
  const [dbGames, setDbGames] = useState(GAME_CONFIGS)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('game_configs').select('*').order('category').order('label')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbGames(data.map((g: any) => ({
            value: g.value, label: g.label, emoji: g.emoji, category: g.category,
            defaultMode: g.default_mode, scoringPreset: g.scoring_preset,
            maps: g.maps, defaultBracketFormat: g.default_bracket_format,
            defaultLeagueSlot: g.default_league_slot,
          })))
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleMap = (m: string) => setLbMaps(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  // ── Auto-apply format when game is selected ──────────────────────────────────
  const handleGameSelect = (gameValue: string) => {
    setFormData(prev => ({ ...prev, game: gameValue }))
    // Try DB config first, fallback to static
    const dbCfg = dbGames.find(g => g.value === gameValue)
    const cfg = dbCfg ?? getGameConfig(gameValue)
    if (!cfg) return
    setMatchMode(cfg.defaultMode)
    if (cfg.defaultMode === 'bracket') {
      setBracketFormat(cfg.defaultBracketFormat ?? 'single')
    }
    if (cfg.defaultMode === 'league') {
      setLeagueSlot(cfg.defaultLeagueSlot ?? 24)
    }
    if (cfg.defaultMode === 'leaderboard') {
      setLbMaps(cfg.maps ?? [])
      setLbPlacement(cfg.scoringPreset === 'pmgc' ? [...PMGC_PLACEMENT] : [...FFIM_PLACEMENT])
    }
  }

  const [formData, setFormData] = useState({
    name: '', game: '', description: '', start_date: '', end_date: '',
    registration_deadline: '', max_teams: 8, team_size: 5,
    prize_pool: '', registration_fee: '', location: '', contact_info: '', rules: '',
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchMode) { toast.error('Pilih Match Mode terlebih dahulu!'); return }
    if (!formData.game) { toast.error('Pilih game terlebih dahulu!'); return }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Silakan login terlebih dahulu'); router.push('/auth/login'); return }

      let image_url = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('tournaments').upload(fileName, imageFile)
        if (uploadError) { toast.error('Gagal mengupload foto.'); setLoading(false); return }
        const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(fileName)
        image_url = publicUrl
      }

      // Encode extra config into description
      const extraConfig = JSON.stringify({
        match_mode: matchMode,
        bracket_format: matchMode === 'bracket' ? bracketFormat : undefined,
        league_slot: matchMode === 'league' ? leagueSlot : undefined,
      })

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          ...formData,
          max_teams: Number(formData.max_teams),
          team_size: Number(formData.team_size),
          image_url,
          created_by: user.id,
          status: 'upcoming',
          rules: formData.rules ? `${formData.rules}\n\n---CONFIG:${extraConfig}` : `---CONFIG:${extraConfig}`,
        })
        .select().single()

      if (error) { toast.error(error.message); return }
      toast.success('Turnamen berhasil dibuat! 🎉')
      router.push(`/admin/tournaments/${tournament.id}`)
    } catch {
      toast.error('Terjadi kesalahan saat membuat turnamen')
    } finally {
      setLoading(false)
    }
  }

  // league slot pipeline helper
  const leagueSelected = LEAGUE_SLOTS.find(l => l.slot === leagueSlot)

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Back */}
          <Link href="/admin/tournaments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create New Tournament</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Choose a mode, fill in details, and start.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Step 1: Match Mode ── */}
            <FieldBox>
              <SectionLabel icon={Swords} label="Select Match Mode" />
              <div className="space-y-3">
                {MODES.map(({ key, icon: Icon, title, desc, color }) => {
                  const active = matchMode === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMatchMode(key)}
                      className={cn(
                        'w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        active ? `${color} border-2` : 'border-border/40 bg-muted/10 hover:border-border hover:bg-muted/20'
                      )}
                    >
                      <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', active ? color : 'bg-muted/50 text-muted-foreground')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-bold', active ? '' : 'text-foreground')}>{title}</p>
                        <p className={cn('text-xs mt-0.5 leading-relaxed', active ? 'opacity-80' : 'text-muted-foreground')}>{desc}</p>
                      </div>
                      {active && <Check className="h-5 w-5 shrink-0 mt-0.5" />}
                    </button>
                  )
                })}
              </div>
            </FieldBox>

            {/* ── Step 2: Tournament Name & Game ── */}
            <FieldBox>
              <SectionLabel icon={Trophy} label="Tournament Name" />
              <Input
                id="name" name="name" placeholder="e.g.: GameArena Cup Season 5"
                value={formData.name} onChange={set('name')} required disabled={loading}
                className="bg-muted/20 border-border/60"
              />

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Pilih Game</span>
                </div>
                {formData.game && (() => {
                  const cfg = getGameConfig(formData.game)
                  if (!cfg) return null
                  const colors = { leaderboard: 'bg-amber-500/10 text-amber-600 border-amber-500/30', bracket: 'bg-red-500/10 text-red-500 border-red-500/30', league: 'bg-violet-500/10 text-violet-500 border-violet-500/30' }
                  const labels = { leaderboard: '⚡ Leaderboard Mode', bracket: '🔀 Bracket Mode', league: '🏅 League Mode' }
                  return (
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', colors[cfg.defaultMode])}>
                      {labels[cfg.defaultMode]} — auto applied
                    </span>
                  )
                })()}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dbGames.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleGameSelect(g.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all text-left',
                      formData.game === g.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    <span className="text-base shrink-0">{g.emoji}</span>
                    <span className="truncate text-xs">{g.label}</span>
                    {formData.game === g.value && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>

              <SectionLabel icon={FileText} label="Deskripsi (Opsional)" />
              <Textarea
                id="description" name="description" placeholder="Deskripsi singkat tentang turnamen..."
                value={formData.description} onChange={set('description')} rows={2} disabled={loading}
                className="bg-muted/20 border-border/60"
              />
            </FieldBox>

            {/* ── Mode-specific options ── */}
            {matchMode === 'bracket' && (
              <FieldBox>
                <SectionLabel icon={Users} label="Number of Teams" />
                <Input
                  id="max_teams" name="max_teams" type="number" min={2}
                  value={formData.max_teams} onChange={set('max_teams')} required disabled={loading}
                  className="bg-muted/20 border-border/60"
                />
                <p className="text-xs text-muted-foreground -mt-2">Enter number of teams (Min 3). System will auto-arrange BYE slots if not a power of two.</p>

                <SectionLabel icon={Network} label="Bracket Format" />
                <div className="space-y-2">
                  {BRACKET_FORMAT_OPTIONS.map(({ key, title, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBracketFormat(key)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                        bracketFormat === key
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-border/40 bg-muted/10 hover:border-border'
                      )}
                    >
                      <div className={cn('h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                        bracketFormat === key ? 'border-red-500' : 'border-border'
                      )}>
                        {bracketFormat === key && <div className="h-2 w-2 rounded-full bg-red-500" />}
                      </div>
                      <div>
                        <p className={cn('text-sm font-semibold', bracketFormat === key ? '' : 'text-foreground')}>{title}</p>
                        <p className={cn('text-xs', bracketFormat === key ? 'opacity-70' : 'text-muted-foreground')}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </FieldBox>
            )}

            {matchMode === 'leaderboard' && (
              <FieldBox>
                {/* Tournament Format: 2x2+1 grid - NO default selected */}
                <SectionLabel icon={Swords} label="Tournament Format" />
                <div className="grid grid-cols-2 gap-2">
                  {LB_SCORING_OPTIONS.map(({ key, title, desc }) => (
                    <button key={key} type="button" onClick={() => setLbScoring(lbScoring === key ? null : key)}
                      className={cn('flex flex-col rounded-xl border-2 px-3 py-3 text-left transition-all',
                        lbScoring === key ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 hover:border-border text-foreground'
                      )}>
                      <span className="text-sm font-bold">{title}</span>
                      <span className={cn('text-xs mt-0.5', lbScoring === key ? 'opacity-70' : 'text-muted-foreground')}>{desc}</span>
                    </button>
                  ))}
                  {LB_DURATION_OPTIONS.map(({ key, title, desc }) => (
                    <button key={key} type="button" onClick={() => { setLbDuration(lbDuration === key ? null : key); setLbSlot(null) }}
                      className={cn('flex flex-col rounded-xl border-2 px-3 py-3 text-left transition-all',
                        lbDuration === key ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 hover:border-border text-foreground'
                      )}>
                      <span className="text-sm font-bold">{title}</span>
                      <span className={cn('text-xs mt-0.5', lbDuration === key ? 'opacity-70' : 'text-muted-foreground')}>{desc}</span>
                    </button>
                  ))}
                </div>

                {/* Champions Rush: Target Points */}
                {lbScoring === 'champions_rush' && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🔥</span>
                      <span className="text-sm font-semibold text-foreground">Target Points</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Team must reach this score then get Booyah to win.</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {TARGET_POINTS.map(pt => (
                        <button key={pt} type="button" onClick={() => setLbTargetPts(pt)}
                          className={cn('rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all',
                            lbTargetPts === pt ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 text-foreground hover:border-border'
                          )}>{pt} pts</button>
                      ))}
                    </div>
                    <Input type="number" min={1} value={lbTargetPts} onChange={e => setLbTargetPts(Number(e.target.value))}
                      className="bg-muted/20 border-border/60" />
                  </div>
                )}

                {/* Slot Count per duration */}
                {lbDuration && (
                  <div>
                    <SectionLabel icon={Users} label="Slot Count" />
                    <div className="grid grid-cols-2 gap-2">
                      {LB_SLOTS[lbDuration].map(({ slot, desc }) => (
                        <button key={slot} type="button" onClick={() => setLbSlot(slot)}
                          className={cn('flex flex-col rounded-xl border-2 px-3 py-3 text-left transition-all',
                            lbSlot === slot ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 hover:border-border text-foreground'
                          )}>
                          <span className="text-sm font-bold">{slot} Slot</span>
                          <span className={cn('text-xs mt-0.5', lbSlot === slot ? 'opacity-70' : 'text-muted-foreground')}>{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Count / Round */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-foreground"># Match Count / Round</span>
                  </div>
                  <Input type="number" min={1} value={lbMatchCount} onChange={e => setLbMatchCount(Number(e.target.value))}
                    className="bg-muted/20 border-border/60" />
                </div>

                {/* Select Map */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Select Map</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Select one or more maps to use.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(getGameConfig(formData.game)?.maps ?? ['Map 1', 'Map 2', 'Map 3', 'Map 4']).map((map: string) => (
                      <button key={map} type="button" onClick={() => toggleMap(map)}
                        className={cn('rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all',
                          lbMaps.includes(map) ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border hover:text-foreground'
                        )}>{map}</button>
                    ))}
                  </div>
                </div>

                {/* Custom Scoring Rules */}
                <div className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <span className="text-sm font-semibold text-foreground">Custom Scoring Rules</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lbCustomScoring ? 'Aturan kustom aktif' : `Default ${formData.game === 'Free Fire' ? 'FFIM (12/9/8/...)' : formData.game === 'PUBG Mobile' ? 'PMGC (15/12/10/...)' : 'FFIM (12/9/8/...)'} + 1pt/kill`}
                      </p>
                    </div>
                    <button type="button" onClick={() => setLbCustomScoring(p => !p)}
                      className={cn('h-6 w-11 rounded-full border-2 transition-all relative shrink-0',
                        lbCustomScoring ? 'bg-amber-500 border-amber-500' : 'bg-muted border-border'
                      )}>
                      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                        lbCustomScoring ? 'left-[22px]' : 'left-0.5'
                      )} />
                    </button>
                  </div>

                  {lbCustomScoring && (
                    <div className="space-y-4 pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground">Atur sendiri poin per placement & per kill</p>

                      {/* Preset buttons */}
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => { setLbPlacement([...FFIM_PLACEMENT]); setLbKillPts(1) }}
                          className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium bg-muted/20 hover:border-amber-500 hover:text-amber-600 transition-all">
                          FFIM Standard
                        </button>
                        <button type="button"
                          onClick={() => { setLbPlacement([...PMGC_PLACEMENT]); setLbKillPts(1) }}
                          className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium bg-muted/20 hover:border-amber-500 hover:text-amber-600 transition-all">
                          PMGC Style
                        </button>
                        <button type="button"
                          onClick={() => { setLbPlacement([...FFIM_PLACEMENT]); setLbKillPts(1) }}
                          className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium bg-muted/20 hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-1">
                          ↺ Reset
                        </button>
                      </div>

                      {/* Kill points */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Poin per Kill</p>
                        <Input type="number" min={0} value={lbKillPts}
                          onChange={e => setLbKillPts(Number(e.target.value))}
                          className="bg-background border-border/60 w-full" />
                      </div>

                      {/* Placement grid Rank 1-12 */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-3">Poin Placement (Rank 1–12)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {lbPlacement.map((pts, idx) => (
                            <div key={idx}>
                              <p className="text-[10px] text-muted-foreground mb-1">#{idx + 1}</p>
                              <Input
                                type="number" min={0} value={pts}
                                onChange={e => {
                                  const next = [...lbPlacement]
                                  next[idx] = Number(e.target.value)
                                  setLbPlacement(next)
                                }}
                                className="bg-background border-border/60 text-center font-bold text-base h-12"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </FieldBox>
            )}

            {matchMode === 'league' && (
              <FieldBox>
                <SectionLabel icon={Layers} label="League Slot Count" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEAGUE_SLOTS.map(({ slot, groups, stages }) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => { setLeagueSlot(slot); setFormData(prev => ({ ...prev, max_teams: slot })) }}
                      className={cn(
                        'flex flex-col rounded-xl border-2 px-3 py-3 text-left transition-all',
                        leagueSlot === slot
                          ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                          : 'border-border/40 bg-muted/10 hover:border-border text-foreground'
                      )}
                    >
                      <span className="text-lg font-extrabold">{slot} Slot</span>
                      <span className={cn('text-xs', leagueSlot === slot ? 'opacity-70' : 'text-muted-foreground')}>
                        {groups} Grup · {stages} Stage
                      </span>
                    </button>
                  ))}
                </div>

                {leagueSelected && (
                  <div className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-2">
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest">Stage Pipeline</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />Group Stage — {leagueSelected.groups} grup × {Math.round(leagueSlot / leagueSelected.groups)} tim</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />Grand Final — Rank 1-6 · Top 6 lolos</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />Play-ins — Rank 7-12 · Top 6 lolos</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />Playoff — Rank 13-24 · Top 3 lolos</div>
                    </div>
                  </div>
                )}
              </FieldBox>
            )}

            {/* ── Dates ── */}
            <FieldBox>
              <SectionLabel icon={Calendar} label="Jadwal Turnamen" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date" className="text-xs text-muted-foreground">Tanggal Mulai *</Label>
                  <Input id="start_date" name="start_date" type="datetime-local" value={formData.start_date} onChange={set('start_date')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_date" className="text-xs text-muted-foreground">Tanggal Selesai *</Label>
                  <Input id="end_date" name="end_date" type="datetime-local" value={formData.end_date} onChange={set('end_date')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registration_deadline" className="text-xs text-muted-foreground">Batas Pendaftaran *</Label>
                  <Input id="registration_deadline" name="registration_deadline" type="datetime-local" value={formData.registration_deadline} onChange={set('registration_deadline')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
              </div>
            </FieldBox>

            {/* ── Info Tambahan ── */}
            <FieldBox>
              <SectionLabel icon={Info} label="Informasi Tambahan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prize_pool" className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> Hadiah</Label>
                  <Input id="prize_pool" name="prize_pool" placeholder="Rp 10.000.000" value={formData.prize_pool} onChange={set('prize_pool')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registration_fee" className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> Biaya Daftar</Label>
                  <Input id="registration_fee" name="registration_fee" placeholder="Gratis / Rp 50.000" value={formData.registration_fee} onChange={set('registration_fee')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Lokasi</Label>
                  <Input id="location" name="location" placeholder="Online / Jakarta" value={formData.location} onChange={set('location')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_info" className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Kontak</Label>
                  <Input id="contact_info" name="contact_info" placeholder="WA / Discord" value={formData.contact_info} onChange={set('contact_info')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="team_size" className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Pemain per Tim</Label>
                <Input id="team_size" name="team_size" type="number" min={1} value={formData.team_size} onChange={set('team_size')} required disabled={loading} className="bg-muted/20 border-border/60" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Banner Turnamen</Label>
                <Input id="image" name="image" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} disabled={loading} className="bg-muted/20 border-border/60" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rules" className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Peraturan</Label>
                <Textarea id="rules" name="rules" placeholder="Tuliskan peraturan turnamen di sini..." value={formData.rules} onChange={set('rules')} rows={4} disabled={loading} className="bg-muted/20 border-border/60" />
              </div>
            </FieldBox>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.game || !matchMode}
              className="w-full h-12 text-base font-bold rounded-2xl gap-2 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Membuat...</>
              ) : (
                <><Trophy className="h-4 w-4" /> + Create Tournament 🎮</>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

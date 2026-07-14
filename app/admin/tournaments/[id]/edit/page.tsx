'use client'

import { useState, useEffect, use } from 'react'
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

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [matchMode, setMatchMode] = useState<MatchMode | null>(null)
  const [bracketFormat, setBracketFormat] = useState<BracketFormat>('single')
  const [leagueSlot, setLeagueSlot] = useState<number>(24)
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
  const [dbGames, setDbGames] = useState(GAME_CONFIGS)
  const [formData, setFormData] = useState({
    name: '', game: '', description: '', start_date: '', end_date: '',
    registration_deadline: '', max_teams: 8, team_size: 5,
    prize_pool: '', registration_fee: '', location: '', contact_info: '', rules: '',
  })

  // Fetch DB game configs
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

  // Fetch existing tournament and pre-fill
  useEffect(() => {
    supabase.from('tournaments').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (!data) return
        // Parse CONFIG block from rules
        const configMatch = data.rules?.match(/---CONFIG:(\{[^}]*\})/)
        const config = configMatch ? JSON.parse(configMatch[1]) : {}
        const cleanRules = data.rules
          ? data.rules.replace(/\n*---CONFIG:\{[^}]*\}/g, '').trim()
          : ''

        setFormData({
          name: data.name || '',
          game: data.game || '',
          description: data.description || '',
          start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
          registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString().slice(0, 16) : '',
          max_teams: data.max_teams || 8,
          team_size: data.team_size || 5,
          prize_pool: data.prize_pool || '',
          registration_fee: data.registration_fee || '',
          location: data.location || '',
          contact_info: data.contact_info || '',
          rules: cleanRules,
        })
        if (config.match_mode) setMatchMode(config.match_mode)
        if (config.bracket_format) setBracketFormat(config.bracket_format)
        if (config.league_slot) setLeagueSlot(config.league_slot)
        // Pre-fill maps from game config
        if (config.match_mode === 'leaderboard') {
          const cfg = getGameConfig(data.game)
          if (cfg?.maps) setLbMaps(cfg.maps)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }))

  const toggleMap = (m: string) => setLbMaps(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const handleGameSelect = (gameValue: string) => {
    setFormData(prev => ({ ...prev, game: gameValue }))
    const cfg = dbGames.find(g => g.value === gameValue) ?? getGameConfig(gameValue)
    if (!cfg) return
    setMatchMode(cfg.defaultMode)
    if (cfg.defaultMode === 'bracket') setBracketFormat(cfg.defaultBracketFormat ?? 'single')
    if (cfg.defaultMode === 'league') setLeagueSlot(cfg.defaultLeagueSlot ?? 24)
    if (cfg.defaultMode === 'leaderboard') {
      setLbMaps(cfg.maps ?? [])
      setLbPlacement(cfg.scoringPreset === 'pmgc' ? [...PMGC_PLACEMENT] : [...FFIM_PLACEMENT])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchMode) { toast.error('Pilih Match Mode terlebih dahulu!'); return }
    setLoading(true)
    try {
      let image_url: string | null = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('tournaments').upload(fileName, imageFile)
        if (uploadError) { toast.error('Gagal upload foto.'); setLoading(false); return }
        const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(fileName)
        image_url = publicUrl
      }

      const extraConfig = JSON.stringify({
        match_mode: matchMode,
        bracket_format: matchMode === 'bracket' ? bracketFormat : undefined,
        league_slot: matchMode === 'league' ? leagueSlot : undefined,
      })

      const { error } = await supabase.from('tournaments').update({
        ...formData,
        max_teams: Number(formData.max_teams),
        team_size: Number(formData.team_size),
        ...(image_url ? { image_url } : {}),
        rules: formData.rules
          ? `${formData.rules}\n\n---CONFIG:${extraConfig}`
          : `---CONFIG:${extraConfig}`,
      }).eq('id', id)

      if (error) { toast.error(error.message); return }
      toast.success('Turnamen berhasil diperbarui! ✅')
      router.push(`/admin/tournaments/${id}`)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const leagueSelected = LEAGUE_SLOTS.find(l => l.slot === leagueSlot)

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <Link href={`/admin/tournaments/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Turnamen
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Turnamen</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Ubah detail dan konfigurasi turnamen.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Match Mode */}
            <FieldBox>
              <SectionLabel icon={Swords} label="Match Mode" />
              <div className="space-y-3">
                {MODES.map(({ key, icon: Icon, title, desc, color }) => {
                  const active = matchMode === key
                  return (
                    <button key={key} type="button" onClick={() => setMatchMode(key)}
                      className={cn('w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        active ? `${color} border-2` : 'border-border/40 bg-muted/10 hover:border-border hover:bg-muted/20'
                      )}>
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

            {/* Name & Game */}
            <FieldBox>
              <SectionLabel icon={Trophy} label="Nama Turnamen" />
              <Input placeholder="e.g.: GameArena Cup Season 5" value={formData.name} onChange={set('name')} required disabled={loading} className="bg-muted/20 border-border/60" />

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Pilih Game</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dbGames.map(g => (
                  <button key={g.value} type="button" onClick={() => handleGameSelect(g.value)}
                    className={cn('flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all text-left',
                      formData.game === g.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border hover:text-foreground'
                    )}>
                    <span className="text-base shrink-0">{g.emoji}</span>
                    <span className="truncate text-xs">{g.label}</span>
                    {formData.game === g.value && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>

              <SectionLabel icon={FileText} label="Deskripsi (Opsional)" />
              <Textarea placeholder="Deskripsi singkat tentang turnamen..." value={formData.description} onChange={set('description')} rows={2} disabled={loading} className="bg-muted/20 border-border/60" />
            </FieldBox>

            {/* Bracket options */}
            {matchMode === 'bracket' && (
              <FieldBox>
                <SectionLabel icon={Users} label="Jumlah Tim" />
                <Input type="number" min={2} value={formData.max_teams} onChange={set('max_teams')} required disabled={loading} className="bg-muted/20 border-border/60" />
                <SectionLabel icon={Network} label="Bracket Format" />
                <div className="space-y-2">
                  {BRACKET_FORMAT_OPTIONS.map(({ key, title, desc }) => (
                    <button key={key} type="button" onClick={() => setBracketFormat(key)}
                      className={cn('w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                        bracketFormat === key ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-border/40 bg-muted/10 hover:border-border'
                      )}>
                      <div className={cn('h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center', bracketFormat === key ? 'border-red-500' : 'border-border')}>
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

            {/* Leaderboard options */}
            {matchMode === 'leaderboard' && (
              <FieldBox>
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

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2"># Match Count / Round</p>
                  <Input type="number" min={1} value={lbMatchCount} onChange={e => setLbMatchCount(Number(e.target.value))} className="bg-muted/20 border-border/60" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Select Map</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(getGameConfig(formData.game)?.maps ?? ['Map 1', 'Map 2', 'Map 3', 'Map 4']).map((map: string) => (
                      <button key={map} type="button" onClick={() => toggleMap(map)}
                        className={cn('rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all',
                          lbMaps.includes(map) ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border hover:text-foreground'
                        )}>{map}</button>
                    ))}
                  </div>
                </div>
              </FieldBox>
            )}

            {/* League options */}
            {matchMode === 'league' && (
              <FieldBox>
                <SectionLabel icon={Layers} label="League Slot Count" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEAGUE_SLOTS.map(({ slot, groups, stages }) => (
                    <button key={slot} type="button"
                      onClick={() => { setLeagueSlot(slot); setFormData(prev => ({ ...prev, max_teams: slot })) }}
                      className={cn('flex flex-col rounded-xl border-2 px-3 py-3 text-left transition-all',
                        leagueSlot === slot ? 'border-violet-500 bg-violet-500/10 text-violet-500' : 'border-border/40 bg-muted/10 hover:border-border text-foreground'
                      )}>
                      <span className="text-lg font-extrabold">{slot} Slot</span>
                      <span className={cn('text-xs', leagueSlot === slot ? 'opacity-70' : 'text-muted-foreground')}>{groups} Grup · {stages} Stage</span>
                    </button>
                  ))}
                </div>
                {leagueSelected && (
                  <div className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-2">
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest">Stage Pipeline</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />Group Stage — {leagueSelected.groups} grup</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />Grand Final — Top 6</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />Play-ins — Top 6</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />Playoff — Top 3</div>
                    </div>
                  </div>
                )}
              </FieldBox>
            )}

            {/* Dates */}
            <FieldBox>
              <SectionLabel icon={Calendar} label="Jadwal Turnamen" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tanggal Mulai *</Label>
                  <Input type="datetime-local" value={formData.start_date} onChange={set('start_date')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tanggal Selesai *</Label>
                  <Input type="datetime-local" value={formData.end_date} onChange={set('end_date')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Batas Pendaftaran *</Label>
                  <Input type="datetime-local" value={formData.registration_deadline} onChange={set('registration_deadline')} required disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
              </div>
            </FieldBox>

            {/* Extra Info */}
            <FieldBox>
              <SectionLabel icon={Info} label="Informasi Tambahan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> Hadiah</Label>
                  <Input placeholder="Rp 10.000.000" value={formData.prize_pool} onChange={set('prize_pool')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> Biaya Daftar</Label>
                  <Input placeholder="Gratis / Rp 50.000" value={formData.registration_fee} onChange={set('registration_fee')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Lokasi</Label>
                  <Input placeholder="Online / Jakarta" value={formData.location} onChange={set('location')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Kontak</Label>
                  <Input placeholder="WA / Discord" value={formData.contact_info} onChange={set('contact_info')} disabled={loading} className="bg-muted/20 border-border/60" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Pemain per Tim</Label>
                <Input type="number" min={1} value={formData.team_size} onChange={set('team_size')} required disabled={loading} className="bg-muted/20 border-border/60" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Banner Baru (Opsional)</Label>
                <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} disabled={loading} className="bg-muted/20 border-border/60" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Peraturan</Label>
                <Textarea placeholder="Tuliskan peraturan turnamen..." value={formData.rules} onChange={set('rules')} rows={4} disabled={loading} className="bg-muted/20 border-border/60" />
              </div>
            </FieldBox>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1">
                Batal
              </Button>
              <Button type="submit" disabled={loading || !formData.name || !formData.game || !matchMode} className="flex-1 h-11 font-bold gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Trophy className="h-4 w-4" /> Simpan Perubahan</>}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

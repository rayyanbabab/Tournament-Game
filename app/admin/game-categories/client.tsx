'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Gamepad2, Plus, Pencil, Trash2, X, BarChart3, Network,
  Layers, Loader2, Check, AlertTriangle,
} from 'lucide-react'
import {
  GameConfigDB, createGameConfig, updateGameConfig, deleteGameConfig,
} from '@/app/actions/game-config'

// ── Constants ────────────────────────────────────────────────────────────────
const MODE_META = {
  leaderboard: { label: 'Leaderboard', icon: BarChart3, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  bracket:     { label: 'Bracket',     icon: Network,   color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  league:      { label: 'League',      icon: Layers,    color: 'text-violet-500 bg-violet-500/10 border-violet-500/30' },
}
const BRACKET_OPTIONS = ['single', 'double', 'group_playoffs']
const BRACKET_LABELS: Record<string, string> = { single: 'Single Elimination', double: 'Double Elimination', group_playoffs: 'Group + Playoffs' }
const EMPTY: Partial<GameConfigDB> = { emoji: '🎮', category: 'Other', default_mode: 'bracket', scoring_preset: null, maps: null, default_bracket_format: 'single', default_league_slot: 24 }

// ── Modal ────────────────────────────────────────────────────────────────────
function GameModal({ game, onClose, onSaved }: {
  game: GameConfigDB | null
  onClose: () => void
  onSaved: (g: GameConfigDB) => void
}) {
  const isEdit = !!game
  const [pending, start] = useTransition()
  const [form, setForm] = useState<Partial<GameConfigDB>>(game ?? { ...EMPTY })
  const [err, setErr] = useState('')

  const f = (key: keyof GameConfigDB) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.value || !form.label || !form.category || !form.default_mode) {
      setErr('Isi semua field yang wajib.'); return
    }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.set(k, Array.isArray(v) ? v.join(', ') : String(v))
    })

    start(async () => {
      const res = isEdit
        ? await updateGameConfig(game!.id, fd)
        : await createGameConfig(fd)
      if (res?.error) { setErr(res.error); return }
      toast.success(isEdit ? 'Game diperbarui!' : 'Game ditambahkan!')
      // Build updated object to pass back
      const updated = { ...EMPTY, ...form, id: game?.id ?? '', created_at: game?.created_at ?? new Date().toISOString() } as GameConfigDB
      onSaved(updated)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-border/60 bg-card w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <h3 className="font-bold text-foreground">{isEdit ? 'Edit Game' : 'Tambah Game Baru'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Emoji + Label */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Emoji</Label>
                <Input value={form.emoji ?? ''} onChange={f('emoji')} placeholder="🎮" className="mt-1 text-center text-xl" />
              </div>
              <div className="col-span-3">
                <Label className="text-xs text-muted-foreground">Nama Game *</Label>
                <Input value={form.label ?? ''} onChange={f('label')} placeholder="Mobile Legends" className="mt-1"
                  onBlur={() => { if (!form.value) setForm(p => ({ ...p, value: p.label })) }} />
              </div>
            </div>

            {/* Value (key) */}
            <div>
              <Label className="text-xs text-muted-foreground">ID Unik (value) *</Label>
              <Input value={form.value ?? ''} onChange={f('value')} placeholder="Mobile Legends" className="mt-1" disabled={isEdit} />
              <p className="text-[11px] text-muted-foreground mt-1">Dipakai sebagai key di database. Tidak bisa diubah setelah dibuat.</p>
            </div>

            {/* Category */}
            <div>
              <Label className="text-xs text-muted-foreground">Kategori *</Label>
              <Input value={form.category ?? ''} onChange={f('category')} placeholder="Battle Royale / MOBA / FPS / Sports / Other" className="mt-1" list="cat-options" />
              <datalist id="cat-options">
                {['Battle Royale','MOBA','FPS','Sports','Racing','Other'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Default Mode */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Mode Default *</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['leaderboard','bracket','league'] as const).map(m => {
                  const meta = MODE_META[m]
                  const Icon = meta.icon
                  return (
                    <button key={m} type="button" onClick={() => setForm(p => ({ ...p, default_mode: m }))}
                      className={cn('flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all text-xs font-semibold',
                        form.default_mode === m ? meta.color : 'border-border/40 bg-muted/10 text-muted-foreground hover:border-border'
                      )}>
                      <Icon className="h-4 w-4" />
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Leaderboard-specific */}
            {form.default_mode === 'leaderboard' && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Scoring Preset</Label>
                  <select value={form.scoring_preset ?? ''} onChange={f('scoring_preset')}
                    className="mt-1 w-full bg-muted/20 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground">
                    <option value="">— Pilih preset —</option>
                    <option value="ffim">FFIM Standard (12/9/8/7/6/5/4/3/2/1/0/0)</option>
                    <option value="pmgc">PMGC Style (15/12/10/8/6/4/3/2/1/0/0/0)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Maps (pisahkan dengan koma)</Label>
                  <Input value={(form.maps ?? []).join(', ')}
                    onChange={e => setForm(p => ({ ...p, maps: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Bermuda, Purgatory, Kalahari" className="mt-1" />
                </div>
              </>
            )}

            {/* Bracket-specific */}
            {form.default_mode === 'bracket' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Format Bracket Default</Label>
                <div className="space-y-2">
                  {BRACKET_OPTIONS.map(b => (
                    <button key={b} type="button" onClick={() => setForm(p => ({ ...p, default_bracket_format: b as any }))}
                      className={cn('w-full flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-sm transition-all',
                        form.default_bracket_format === b ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-border/40 bg-muted/10 text-foreground hover:border-border'
                      )}>
                      <div className={cn('h-3.5 w-3.5 rounded-full border-2 shrink-0', form.default_bracket_format === b ? 'border-red-500 bg-red-500' : 'border-border')} />
                      {BRACKET_LABELS[b]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* League-specific */}
            {form.default_mode === 'league' && (
              <div>
                <Label className="text-xs text-muted-foreground">Default Slot</Label>
                <Input type="number" value={form.default_league_slot ?? 24}
                  onChange={e => setForm(p => ({ ...p, default_league_slot: Number(e.target.value) }))}
                  className="mt-1" min={4} />
              </div>
            )}

            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>

          <div className="px-6 pb-6 flex gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={pending}>Batal</Button>
            <Button type="submit" className="flex-1 gap-2" disabled={pending}>
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Game'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ game, onClose, onDeleted }: { game: GameConfigDB; onClose: () => void; onDeleted: (id: string) => void }) {
  const [pending, start] = useTransition()
  const doDelete = () => start(async () => {
    const res = await deleteGameConfig(game.id)
    if (res?.error) { toast.error(res.error); return }
    toast.success('Game dihapus!')
    onDeleted(game.id)
  })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-border/60 bg-card w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Hapus Game?</h3>
            <p className="text-sm text-muted-foreground">Game <strong>{game.label}</strong> akan dihapus permanen.</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={pending}>Batal</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white gap-2" onClick={doDelete} disabled={pending}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Game Card ────────────────────────────────────────────────────────────────
function GameCard({ game, onEdit, onDelete }: { game: GameConfigDB; onEdit: () => void; onDelete: () => void }) {
  const meta = MODE_META[game.default_mode]
  const Icon = meta.icon
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shrink-0">{game.emoji}</div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{game.label}</p>
            <p className="text-xs text-muted-foreground">{game.category}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className={cn('flex items-center gap-1.5 w-fit rounded-full border px-2.5 py-1 text-xs font-semibold', meta.color)}>
        <Icon className="h-3 w-3" />
        {meta.label} Mode
      </div>

      <div className="rounded-xl bg-muted/20 border border-border/40 p-3 space-y-1 text-xs text-muted-foreground">
        {game.default_mode === 'leaderboard' && (
          <>
            <p><span className="text-foreground font-medium">Scoring:</span> {game.scoring_preset === 'ffim' ? 'FFIM (12/9/8…)' : game.scoring_preset === 'pmgc' ? 'PMGC (15/12/10…)' : 'Custom'}</p>
            {game.maps && <p><span className="text-foreground font-medium">Maps:</span> {game.maps.join(', ')}</p>}
          </>
        )}
        {game.default_mode === 'bracket' && (
          <p><span className="text-foreground font-medium">Format:</span> {BRACKET_LABELS[game.default_bracket_format ?? 'single']}</p>
        )}
        {game.default_mode === 'league' && (
          <p><span className="text-foreground font-medium">Slot:</span> {game.default_league_slot} Slot</p>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function GameCategoriesClient({ initial }: { initial: GameConfigDB[] }) {
  const [games, setGames] = useState<GameConfigDB[]>(initial)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<GameConfigDB | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GameConfigDB | null>(null)

  const categories = Array.from(new Set(games.map(g => g.category)))

  const onSaved = (g: GameConfigDB) => {
    setGames(prev => {
      const idx = prev.findIndex(x => x.id === g.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = g; return next }
      return [...prev, g]
    })
    setModal(null); setSelected(null)
  }

  const onDeleted = (id: string) => {
    setGames(prev => prev.filter(g => g.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Kategori Game</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Button size="sm" className="gap-1.5" onClick={() => { setSelected(null); setModal('add') }}>
              <Plus className="h-3.5 w-3.5" /> Tambah Game
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Kategori Game</h1>
              <p className="text-sm text-muted-foreground">Kelola game dan format turnamen default yang otomatis diterapkan</p>
            </div>
          </div>

          {/* Mobile add button */}
          <div className="md:hidden">
            <Button className="w-full gap-2" onClick={() => { setSelected(null); setModal('add') }}>
              <Plus className="h-4 w-4" /> Tambah Game
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODE_META).map(([key, { label, icon: Icon, color }]) => (
              <div key={key} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', color)}>
                <Icon className="h-3 w-3" />{label} Mode
              </div>
            ))}
          </div>

          {/* Games by category */}
          {categories.map(cat => (
            <section key={cat}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {games.filter(g => g.category === cat).map(game => (
                  <GameCard key={game.id} game={game}
                    onEdit={() => { setSelected(game); setModal('edit') }}
                    onDelete={() => setDeleteTarget(game)}
                  />
                ))}
              </div>
            </section>
          ))}

          {games.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Gamepad2 className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Belum ada game. Klik tombol <strong>Tambah Game</strong> untuk mulai.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <GameModal game={modal === 'edit' ? selected : null} onClose={() => { setModal(null); setSelected(null) }} onSaved={onSaved} />
      )}
      {deleteTarget && (
        <DeleteConfirm game={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={onDeleted} />
      )}
    </div>
  )
}

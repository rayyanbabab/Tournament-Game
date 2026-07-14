'use client'

import { useState } from 'react'
// Supabase client migrated to Neon - see /api routes
import { Flame, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

interface Tournament {
  id: string
  name: string
  game: string
  start_date: string
  image_url?: string | null
}

interface Props {
  tournaments: Tournament[]
  currentFeaturedId: string | null
}

export function FeaturedTournamentPicker({ tournaments, currentFeaturedId }: Props) {
  const [selected, setSelected] = useState<string | null>(currentFeaturedId)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  // const supabase = createClient() // migrated

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('site_settings').upsert(
        { key: 'featured_tournament_id', value: selected ?? '', updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      showToast('success', selected ? 'Featured tournament berhasil disimpan!' : 'Featured tournament dihapus.')
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Clear button */}
      {selected && (
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Hapus pilihan featured
        </button>
      )}

      {/* Tournament list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {tournaments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Belum ada turnamen.</p>
        )}
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(selected === t.id ? null : t.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              selected === t.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
              {t.image_url ? (
                <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Flame className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.game}</p>
            </div>
            {selected === t.id && (
              <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Pilihan'}
      </button>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trophy, Loader2, Save, RotateCcw } from 'lucide-react'

interface Team {
  id: string
  name: string
}

interface Props {
  tournamentId: string
  teams: Team[]
  existingResults: { team_id: string; rank: number }[]
  onSaved?: () => void
}

const RANKS = [
  { rank: 1, label: 'Juara 1 🥇', color: 'border-amber-500/60 bg-amber-500/5 text-amber-600' },
  { rank: 2, label: 'Juara 2 🥈', color: 'border-slate-400/60 bg-slate-500/5 text-slate-400' },
  { rank: 3, label: 'Juara 3 🥉', color: 'border-orange-600/60 bg-orange-700/5 text-orange-500' },
]

export function SetResultsForm({ tournamentId, teams, existingResults, onSaved }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  // Build initial map: rank -> team_id
  const initMap: Record<number, string> = {}
  existingResults.forEach(r => { initMap[r.rank] = r.team_id })
  const [picks, setPicks] = useState<Record<number, string>>(initMap)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upsert results for rank 1, 2, 3
      for (const r of RANKS) {
        const teamId = picks[r.rank]
        if (!teamId) continue

        const { error } = await supabase
          .from('tournament_results')
          .upsert({
            tournament_id: tournamentId,
            team_id: teamId,
            rank: r.rank,
          }, {
            onConflict: 'tournament_id,team_id',
          })

        if (error) throw error
      }

      // Also ensure all approved teams have a rank=0 (participant) entry if not already set
      toast.success('Hasil turnamen berhasil disimpan!')
      onSaved?.()
    } catch (err: any) {
      toast.error(`Gagal menyimpan: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset semua hasil turnamen ini?')) return
    setSaving(true)
    try {
      await supabase
        .from('tournament_results')
        .delete()
        .eq('tournament_id', tournamentId)
        .gt('rank', 0)
      setPicks({})
      toast.success('Hasil direset')
      onSaved?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pilih tim yang menjadi pemenang di setiap posisi. Semua tim yang terdaftar (approved) akan mendapat sertifikat partisipasi.
      </p>

      <div className="space-y-3">
        {RANKS.map(r => (
          <div key={r.rank} className={`rounded-lg border p-4 ${r.color}`}>
            <label className="block text-sm font-bold mb-2">{r.label}</label>
            <select
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={picks[r.rank] ?? ''}
              onChange={(e) => setPicks(prev => ({ ...prev, [r.rank]: e.target.value }))}
            >
              <option value="">-- Pilih Tim --</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}
                  disabled={Object.entries(picks).some(
                    ([k, v]) => Number(k) !== r.rank && v === t.id
                  )}
                >
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Simpan Hasil
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}

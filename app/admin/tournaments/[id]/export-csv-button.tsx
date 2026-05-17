'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ExportCSVButtonProps {
  tournamentId: string
  tournamentName: string
}

export function ExportCSVButton({ tournamentId, tournamentName }: ExportCSVButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleExport = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          status, registered_at,
          teams(name, contact_email, whatsapp_number, discord_link,
            team_members(in_game_name, in_game_id, role,
              profiles:user_id(full_name, email)
            )
          ),
          profiles:registered_by(full_name, email)
        `)
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true })

      if (error) { toast.error('Gagal mengambil data'); return }

      // Build CSV rows
      const rows: string[][] = []
      rows.push(['No', 'Nama Tim', 'Email Kontak', 'WhatsApp', 'Discord', 'Kapten', 'Email Kapten', 'Status', 'Tanggal Daftar', 'Anggota (Nama | In-Game | ID | Role)'])

      data?.forEach((reg: any, idx: number) => {
        const team = reg.teams
        const members = (team?.team_members ?? [])
          .map((m: any) => `${m.profiles?.full_name ?? '?'} | ${m.in_game_name ?? '-'} | ${m.in_game_id ?? '-'} | ${m.role}`)
          .join('; ')

        rows.push([
          String(idx + 1),
          team?.name ?? '',
          team?.contact_email ?? '',
          team?.whatsapp_number ?? '',
          team?.discord_link ?? '',
          reg.profiles?.full_name ?? '',
          reg.profiles?.email ?? '',
          reg.status,
          format(new Date(reg.registered_at), 'dd/MM/yyyy HH:mm'),
          members,
        ])
      })

      // Generate CSV string (handle commas in values)
      const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

      // Trigger download
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `peserta-${tournamentName.replace(/[^a-z0-9]/gi, '-')}-${format(new Date(), 'yyyyMMdd')}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`CSV berhasil diunduh (${data?.length ?? 0} pendaftar)`)
    } catch {
      toast.error('Terjadi kesalahan saat export')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      Export CSV
    </Button>
  )
}

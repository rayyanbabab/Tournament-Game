'use client'

import { useState } from 'react'
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

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/export-csv?tournamentId=${tournamentId}`)
      if (!res.ok) {
        toast.error('Gagal mengambil data')
        return
      }
      const data = await res.json()

      // Build CSV rows
      const rows: string[][] = []
      rows.push(['No', 'Nama Tim', 'Email Kontak', 'WhatsApp', 'Kapten', 'Status', 'Tanggal Daftar'])

      data?.forEach((reg: any, idx: number) => {
        rows.push([
          String(idx + 1),
          reg.team_name ?? '',
          reg.contact_email ?? '',
          reg.whatsapp_number ?? '',
          reg.registered_by_name ?? '',
          reg.status,
          reg.registered_at ? format(new Date(reg.registered_at), 'dd/MM/yyyy HH:mm') : '',
        ])
      })

      const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
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

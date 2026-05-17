'use client'

import { useState } from 'react'
import { sendTournamentAnnouncement } from './announcement-actions'
import { toast } from 'sonner'
import { Megaphone, Send, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnnouncementFormProps {
  tournamentId: string
  approvedCount: number
}

export function AnnouncementForm({ tournamentId, approvedCount }: AnnouncementFormProps) {
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Judul dan pesan tidak boleh kosong')
      return
    }
    setLoading(true)
    const res = await sendTournamentAnnouncement(tournamentId, title, message)
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    toast.success(`Pengumuman dikirim ke ${res.count} peserta!`)
    setTitle('')
    setMessage('')
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold text-foreground">Kirim Pengumuman</h3>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> {approvedCount} penerima
        </span>
      </div>

      {approvedCount === 0 ? (
        <div className="rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">Belum ada peserta yang disetujui</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Judul Pengumuman</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              placeholder="cth: Info Teknis Pertandingan Babak 1"
              className="mt-1 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pesan</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tulis isi pengumuman untuk semua peserta yang telah disetujui..."
              className="mt-1 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">{message.length}/500</p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2.5 flex items-start gap-2">
            <Megaphone className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              Pengumuman akan dikirim sebagai <span className="font-semibold text-foreground">notifikasi in-app</span> ke {approvedCount} peserta yang telah disetujui.
            </p>
          </div>
          <Button
            onClick={handleSend}
            disabled={loading || !title.trim() || !message.trim()}
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
            Kirim ke {approvedCount} Peserta
          </Button>
        </div>
      )}
    </div>
  )
}

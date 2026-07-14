'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'

interface AddMemberDialogProps {
  teamId: string
}

export function AddMemberDialog({ teamId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [inGameName, setInGameName] = useState('')
  const [inGameId, setInGameId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          userId: null,
          inGameName,
          inGameId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan')
        return
      }

      toast.success('Anggota berhasil ditambahkan')
      setInGameName('')
      setInGameId('')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan saat menambahkan anggota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs">
          <UserPlus className="h-3.5 w-3.5" />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Tim</DialogTitle>
          <DialogDescription>
            Masukkan informasi in-game anggota baru.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inGameName">Nama In-Game *</Label>
            <Input
              id="inGameName"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="Nama karakter dalam game"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inGameId">ID In-Game</Label>
            <Input
              id="inGameId"
              value={inGameId}
              onChange={(e) => setInGameId(e.target.value)}
              placeholder="ID unik dalam game (opsional)"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                'Tambah'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Add member
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          in_game_name: inGameName,
          in_game_id: inGameId,
          role: 'member',
        })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(`${inGameName} berhasil ditambahkan ke tim!`)
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
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Anggota Tim</DialogTitle>
          <DialogDescription>
            Masukkan nama dan ID akun game anggota tim Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddMember}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inGameName">Nama In-Game</Label>
              <Input
                id="inGameName"
                placeholder="Contoh: Faker"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inGameId">ID Akun Game</Label>
              <Input
                id="inGameId"
                placeholder="Contoh: 12345678"
                value={inGameId}
                onChange={(e) => setInGameId(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !inGameName.trim() || !inGameId.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                'Tambah Anggota'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

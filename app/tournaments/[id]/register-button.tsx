'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RegisterTournamentButtonProps {
  tournamentId: string
  teams: { id: string; name: string }[]
  teamSize: number
}

export function RegisterTournamentButton({ tournamentId, teams, teamSize }: RegisterTournamentButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
    if (!selectedTeam) {
      toast.error('Pilih tim terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      // Check team member count
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', selectedTeam)

      if ((count || 0) < teamSize) {
        toast.error(`Tim harus memiliki minimal ${teamSize} anggota`)
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Silakan login terlebih dahulu')
        setLoading(false)
        return
      }

      // Register team
      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          team_id: selectedTeam,
          registered_by: user.id,
          status: 'pending',
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('Tim ini sudah terdaftar di turnamen ini')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Pendaftaran berhasil! Menunggu persetujuan admin.')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan saat mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Daftar Turnamen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daftar Turnamen</DialogTitle>
          <DialogDescription>
            Pilih tim yang akan Anda daftarkan. Tim harus memiliki minimal {teamSize} anggota.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team">Pilih Tim</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Pilih tim..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleRegister} disabled={loading || !selectedTeam}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftar...
              </>
            ) : (
              'Konfirmasi Pendaftaran'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

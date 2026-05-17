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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RegisterTournamentButtonProps {
  tournamentId: string
  teams: { id: string; name: string }[]
  teamSize: number
  registrationFee: string | null
}

export function RegisterTournamentButton({ 
  tournamentId, 
  teams, 
  teamSize,
  registrationFee
}: RegisterTournamentButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isFree = !registrationFee || 
    registrationFee.trim().toLowerCase() === 'gratis' || 
    registrationFee.trim() === '0' ||
    registrationFee.trim() === '-' ||
    registrationFee.trim().toLowerCase() === 'free'

  const handleRegister = async () => {
    if (!selectedTeam) {
      toast.error('Pilih tim terlebih dahulu')
      return
    }

    if (!isFree && !paymentProof) {
      toast.error('Bukti pembayaran wajib diunggah')
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

      let paymentProofUrl = null

      // Upload payment proof if not free
      if (!isFree && paymentProof) {
        const fileExt = paymentProof.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('payment_proofs')
          .upload(filePath, paymentProof, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error('Gagal mengunggah bukti pembayaran: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(filePath)

        paymentProofUrl = publicUrl
      }

      // Register team
      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          team_id: selectedTeam,
          registered_by: user.id,
          status: 'pending',
          payment_proof_url: paymentProofUrl,
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
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mendaftar')
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

          {!isFree && (
            <div className="space-y-2 mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Biaya Pendaftaran</p>
                <p className="text-lg font-bold text-primary">{registrationFee}</p>
              </div>
              <Label htmlFor="paymentProof">Unggah Bukti Pembayaran <span className="text-destructive">*</span></Label>
              <Input 
                id="paymentProof" 
                type="file" 
                accept="image/*,.pdf" 
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG, atau PDF (Max 2MB)</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleRegister} disabled={loading || !selectedTeam || (!isFree && !paymentProof)}>
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

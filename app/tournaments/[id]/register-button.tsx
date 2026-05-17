'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Loader2, Users, Building2, QrCode,
  Upload, CheckCircle2, ChevronRight, ChevronLeft,
  Trophy, UserCircle, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  tournamentId: string
  teamSize: number
  registrationFee: string | null
}

interface MemberData { inGameName: string; inGameId: string }
interface BankAccount { bank: string; accountNumber: string; accountHolder: string }
interface PaymentSettings {
  bank_accounts: BankAccount[]
  qris_image_url: string | null
  payment_instructions: string | null
}
type PaymentMethod = 'bank' | 'qris'
type Step = 1 | 2 | 3

export function RegisterTournamentButton({ tournamentId, teamSize, registrationFee }: Props) {
  const isSolo = teamSize === 1
  const isFree = !registrationFee || ['gratis', '0', '-', 'free'].includes(registrationFee.trim().toLowerCase())

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<MemberData[]>(
    Array.from({ length: Math.max(teamSize, 1) }, () => ({ inGameName: '', inGameId: '' }))
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const totalSteps = isFree ? 1 : 3
  const stepLabels = isFree
    ? ['Konfirmasi']
    : ['Data Tim', 'Pembayaran', 'Upload Bukti']

  const handleOpen = async (v: boolean) => {
    setOpen(v)
    if (v && !isFree) {
      const { data } = await supabase.from('payment_settings').select('*').eq('id', 1).single()
      if (data) setPaymentSettings(data)
    }
    if (!v) reset()
  }

  const reset = () => {
    setStep(1); setTeamName('')
    setMembers(Array.from({ length: Math.max(teamSize, 1) }, () => ({ inGameName: '', inGameId: '' })))
    setPaymentMethod(null); setSelectedBank(null); setPaymentProof(null); setPreviewUrl(null)
  }

  const updateMember = (idx: number, field: keyof MemberData, value: string) =>
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))

  const handleNext = async () => {
    if (step === 1) {
      if (!isSolo) {
        if (!teamName.trim()) { toast.error('Nama tim tidak boleh kosong'); return }
        if (!members[0].inGameName.trim()) { toast.error('Nama in-game kapten harus diisi'); return }
      }
      if (isFree) { handleRegister(); return }
      setStep(2)
    } else if (step === 2) {
      if (!paymentMethod) { toast.error('Pilih metode pembayaran'); return }
      if (paymentMethod === 'bank' && !selectedBank) { toast.error('Pilih rekening tujuan'); return }
      setStep(3)
    }
  }

  const handleRegister = async () => {
    if (!isFree && !paymentProof) { toast.error('Upload bukti pembayaran terlebih dahulu'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Silakan login terlebih dahulu'); return }

      let paymentProofUrl: string | null = null
      if (!isFree && paymentProof) {
        const ext = paymentProof.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('payment_proofs').upload(path, paymentProof, { cacheControl: '3600', upsert: false })
        if (upErr) throw new Error('Gagal upload bukti: ' + upErr.message)
        paymentProofUrl = supabase.storage.from('payment_proofs').getPublicUrl(path).data.publicUrl
      }

      // Determine team name
      let finalTeamName = teamName.trim()
      if (isSolo) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        finalTeamName = profile?.full_name ?? `Player-${user.id.slice(0, 6)}`
      }

      // Create team
      const { data: newTeam, error: teamErr } = await supabase
        .from('teams').insert({ name: finalTeamName, captain_id: user.id }).select('id').single()
      if (teamErr) throw new Error(`Gagal membuat tim: ${teamErr.message}`)

      // Create team members
      const memberRows = members.map((m, i) => ({
        team_id: newTeam.id,
        user_id: i === 0 ? user.id : null,
        in_game_name: m.inGameName.trim() || (i === 0 ? finalTeamName : `Member ${i + 1}`),
        in_game_id: m.inGameId.trim() || null,
        role: i === 0 ? 'captain' : 'member',
      }))
      await supabase.from('team_members').insert(memberRows)

      // Register tournament
      const { error: regErr } = await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId,
        team_id: newTeam.id,
        registered_by: user.id,
        status: 'pending',
        payment_proof_url: paymentProofUrl,
        payment_method: paymentMethod,
        payment_bank: selectedBank?.bank ?? null,
      })
      if (regErr) {
        if (regErr.code === '23505') toast.error('Anda sudah terdaftar di turnamen ini')
        else toast.error(regErr.message)
        return
      }

      toast.success('Pendaftaran berhasil! Menunggu verifikasi admin.')
      handleOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const hasBank = (paymentSettings?.bank_accounts?.length ?? 0) > 0
  const hasQris = !!paymentSettings?.qris_image_url

  return (
    <>
      <Button className="w-full" onClick={() => handleOpen(true)}>Daftar Turnamen</Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          {/* Step indicator */}
          <div className="px-6 pt-5 pb-4 border-b border-border/60">
            <DialogHeader className="mb-3">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5 text-primary" />Daftar Turnamen
              </DialogTitle>
            </DialogHeader>
            {totalSteps > 1 && (
              <div className="flex items-center gap-2">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn('flex items-center gap-1.5 text-xs font-medium',
                      step === i + 1 ? 'text-primary' : step > i + 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                        step === i + 1 ? 'bg-primary text-primary-foreground' :
                        step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      <span className="hidden sm:block">{label}</span>
                    </div>
                    {i < stepLabels.length - 1 && <div className="flex-1 h-px bg-border/60 w-4" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 1: Data Tim / Solo */}
          {step === 1 && (
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {isSolo ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                  <UserCircle className="h-10 w-10 text-primary mx-auto" />
                  <p className="text-sm font-semibold text-foreground">Daftar sebagai Individu</p>
                  <p className="text-xs text-muted-foreground">Nama profil Anda akan otomatis digunakan sebagai peserta turnamen ini.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      <Users className="h-3.5 w-3.5 inline mr-1" />Nama Tim *
                    </label>
                    <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
                      placeholder="Masukkan nama tim..."
                      className="w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      <Plus className="h-3.5 w-3.5 inline mr-1" />Data Anggota ({teamSize} orang)
                    </p>
                    {members.map((m, i) => (
                      <div key={i} className="rounded-xl border border-border/40 bg-muted/10 p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground">
                          {i === 0 ? '👑 Kapten (Anda)' : `Anggota ${i + 1}`}
                        </p>
                        <input type="text" value={m.inGameName} onChange={e => updateMember(i, 'inGameName', e.target.value)}
                          placeholder="Nama In-Game *"
                          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                        <input type="text" value={m.inGameId} onChange={e => updateMember(i, 'inGameId', e.target.value)}
                          placeholder="ID In-Game (opsional)"
                          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!isFree && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Biaya Pendaftaran</p>
                  <p className="text-xl font-bold text-primary">{registrationFee}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-medium text-muted-foreground">Pilih Metode Pembayaran</p>
              <div className="space-y-3">
                {hasBank && (
                  <button onClick={() => { setPaymentMethod('bank'); setSelectedBank(null) }}
                    className={cn('w-full rounded-xl border p-4 text-left transition-all',
                      paymentMethod === 'bank' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border/60 hover:border-primary/40 hover:bg-muted/30')}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10"><Building2 className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Transfer Bank</p>
                        <p className="text-xs text-muted-foreground">{paymentSettings?.bank_accounts.map(b => b.bank).join(', ')}</p>
                      </div>
                    </div>
                  </button>
                )}
                {hasQris && (
                  <button onClick={() => { setPaymentMethod('qris'); setSelectedBank(null) }}
                    className={cn('w-full rounded-xl border p-4 text-left transition-all',
                      paymentMethod === 'qris' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border/60 hover:border-primary/40 hover:bg-muted/30')}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10"><QrCode className="h-4 w-4 text-purple-600" /></div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">QRIS</p>
                        <p className="text-xs text-muted-foreground">Bayar via scan QR Code</p>
                      </div>
                    </div>
                  </button>
                )}
                {!hasBank && !hasQris && (
                  <div className="text-center py-6 text-sm text-muted-foreground">Admin belum mengatur metode pembayaran.</div>
                )}
              </div>
              {paymentMethod === 'bank' && (paymentSettings?.bank_accounts.length ?? 0) > 1 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground font-medium">Pilih Rekening Tujuan</p>
                  {paymentSettings?.bank_accounts.map((b, i) => (
                    <button key={i} onClick={() => setSelectedBank(b)}
                      className={cn('w-full rounded-lg border px-4 py-3 text-left text-sm transition-all',
                        selectedBank?.accountNumber === b.accountNumber ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-muted/30')}>
                      <p className="font-semibold">{b.bank}</p>
                      <p className="font-mono text-xs mt-0.5">{b.accountNumber}</p>
                      <p className="text-xs text-muted-foreground">{b.accountHolder}</p>
                    </button>
                  ))}
                </div>
              )}
              {paymentMethod === 'bank' && paymentSettings?.bank_accounts.length === 1 && !selectedBank &&
                (() => { setSelectedBank(paymentSettings.bank_accounts[0]); return null })()}
              {paymentMethod === 'qris' && paymentSettings?.qris_image_url && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">Scan QR Code berikut untuk membayar:</p>
                  <img src={paymentSettings.qris_image_url} alt="QRIS" className="w-48 h-48 object-contain rounded-xl border" />
                </div>
              )}
              {paymentSettings?.payment_instructions && (
                <div className="rounded-xl bg-muted/30 border border-border/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Instruksi Pembayaran</p>
                  <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{paymentSettings.payment_instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Upload Proof */}
          {step === 3 && (
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl bg-muted/30 border border-border/60 p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Ringkasan Pembayaran</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-medium">{paymentMethod === 'qris' ? 'QRIS' : `Transfer ${selectedBank?.bank ?? 'Bank'}`}</span>
                </div>
                {paymentMethod === 'bank' && selectedBank && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">No. Rekening</span>
                      <span className="font-mono font-medium">{selectedBank.accountNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Atas Nama</span>
                      <span className="font-medium">{selectedBank.accountHolder}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm border-t border-border/60 pt-2 mt-1">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-bold text-primary">{registrationFee}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  <Upload className="h-3.5 w-3.5 inline mr-1" />Upload Bukti Pembayaran <span className="text-destructive">*</span>
                </label>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-border/60 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain bg-muted/30" />
                    <button onClick={() => { setPaymentProof(null); setPreviewUrl(null) }}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-destructive text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Ganti</button>
                    <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Gambar siap diupload
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all">
                    <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload bukti transfer</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG (Maks 5MB)</p>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0] ?? null
                      setPaymentProof(file)
                      setPreviewUrl(file?.type.startsWith('image/') ? URL.createObjectURL(file) : null)
                    }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-5 flex gap-3 border-t border-border/60 pt-4">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as Step)} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border/60 hover:bg-accent transition-colors disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
            )}
            <Button className="flex-1" disabled={loading ||
              (step === 2 && (!paymentMethod || (paymentMethod === 'bank' && !selectedBank && (paymentSettings?.bank_accounts.length ?? 0) > 1))) ||
              (step === 3 && !paymentProof)}
              onClick={step === 3 ? handleRegister : handleNext}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Memproses...</>
                : step === 3 ? <><CheckCircle2 className="h-4 w-4 mr-2" />Konfirmasi Pendaftaran</>
                : <>Lanjutkan <ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

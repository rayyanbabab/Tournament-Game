'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Trash2, Save, Upload, Loader2, CheckCircle2,
  AlertCircle, Building2, QrCode, FileText, X,
} from 'lucide-react'

interface BankAccount {
  bank: string
  accountNumber: string
  accountHolder: string
}

interface PaymentSettingsData {
  bank_accounts: BankAccount[]
  qris_image_url: string | null
  payment_instructions: string | null
}

interface Props {
  initial: PaymentSettingsData
}

export function PaymentSettingsEditor({ initial }: Props) {
  const supabase = createClient()
  const qrisInputRef = useRef<HTMLInputElement>(null)

  const [banks, setBanks] = useState<BankAccount[]>(initial.bank_accounts ?? [])
  const [qrisUrl, setQrisUrl] = useState(initial.qris_image_url ?? '')
  const [instructions, setInstructions] = useState(initial.payment_instructions ?? '')
  const [saving, setSaving] = useState(false)
  const [uploadingQris, setUploadingQris] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const addBank = () => {
    setBanks([...banks, { bank: '', accountNumber: '', accountHolder: '' }])
  }

  const removeBank = (i: number) => {
    setBanks(banks.filter((_, idx) => idx !== i))
  }

  const updateBank = (i: number, field: keyof BankAccount, value: string) => {
    setBanks(banks.map((b, idx) => idx === i ? { ...b, [field]: value } : b))
  }

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Hanya file gambar yang diizinkan')
      return
    }

    setUploadingQris(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `qris/qris-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('tournaments')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(fileName)

      setQrisUrl(publicUrl)
      showToast('success', 'Foto QRIS berhasil diupload!')
    } catch (e: any) {
      showToast('error', `Upload gagal: ${e.message}`)
    } finally {
      setUploadingQris(false)
      if (qrisInputRef.current) qrisInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          id: 1,
          bank_accounts: banks.filter(b => b.bank || b.accountNumber),
          qris_image_url: qrisUrl || null,
          payment_instructions: instructions || null,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      showToast('success', 'Pengaturan pembayaran berhasil disimpan!')
    } catch (e: any) {
      showToast('error', `Gagal menyimpan: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bank Accounts */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Rekening Bank</h2>
          </div>
          <button
            onClick={addBank}
            className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Rekening
          </button>
        </div>

        <div className="p-5 space-y-4">
          {banks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Belum ada rekening. Klik "Tambah Rekening" untuk menambahkan.
            </div>
          ) : (
            banks.map((bank, i) => (
              <div key={i} className="relative rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                <button
                  onClick={() => removeBank(i)}
                  className="absolute top-3 right-3 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="text-xs font-medium text-muted-foreground">Rekening #{i + 1}</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nama Bank</label>
                    <input
                      value={bank.bank}
                      onChange={e => updateBank(i, 'bank', e.target.value)}
                      placeholder="BCA, BNI, Mandiri..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nomor Rekening</label>
                    <input
                      value={bank.accountNumber}
                      onChange={e => updateBank(i, 'accountNumber', e.target.value)}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Atas Nama</label>
                    <input
                      value={bank.accountHolder}
                      onChange={e => updateBank(i, 'accountHolder', e.target.value)}
                      placeholder="Nama pemilik rekening"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QRIS */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
          <QrCode className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">QRIS</h2>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Preview */}
            <div className="shrink-0">
              {qrisUrl ? (
                <div className="relative group w-40 h-40 rounded-xl overflow-hidden border border-border/60 bg-muted">
                  <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setQrisUrl('')}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <QrCode className="h-10 w-10 opacity-30" />
                  <span className="text-xs">Belum ada QRIS</span>
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload foto/gambar QRIS yang akan ditampilkan kepada peserta saat melakukan pembayaran.
              </p>

              <input
                ref={qrisInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleQrisUpload}
              />
              <button
                onClick={() => qrisInputRef.current?.click()}
                disabled={uploadingQris}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/60 hover:bg-accent transition-colors disabled:opacity-60"
              >
                {uploadingQris
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Upload className="h-4 w-4" />}
                {uploadingQris ? 'Mengupload...' : 'Upload Foto QRIS'}
              </button>

              {qrisUrl && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  QRIS sudah diupload
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Instruksi Pembayaran</h2>
        </div>

        <div className="p-5">
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={5}
            placeholder="Contoh:&#10;1. Transfer sesuai nominal yang tertera&#10;2. Cantumkan nama tim sebagai keterangan transfer&#10;3. Upload bukti transfer setelah pembayaran&#10;4. Pendaftaran disetujui setelah verifikasi oleh admin"
            className="w-full px-4 py-3 text-sm rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Instruksi ini akan ditampilkan kepada peserta saat halaman pembayaran.
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-in slide-in-from-bottom-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

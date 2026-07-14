'use client'

import { useState } from 'react'
// Supabase client migrated to Neon - see /api routes
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface ContentEditorProps {
  initialContent: Record<string, string>
}

const FIELDS = [
  {
    section: 'Hero Section',
    fields: [
      { key: 'hero_badge', label: 'Badge Text', placeholder: 'Contoh: Platform Turnamen Gaming Terbaik' },
      { key: 'hero_title', label: 'Judul Utama (baris 1)', placeholder: 'Contoh: Kelola Turnamen' },
      { key: 'hero_title2', label: 'Judul Utama (baris 2 - highlight)', placeholder: 'Contoh: Gaming Anda' },
      { key: 'hero_subtitle', label: 'Sub-judul', type: 'textarea', placeholder: 'Deskripsi singkat platform...' },
      { key: 'hero_cta_primary', label: 'Tombol CTA Utama', placeholder: 'Contoh: Mulai Sekarang Gratis' },
      { key: 'hero_cta_secondary', label: 'Tombol CTA Kedua', placeholder: 'Contoh: Lihat Turnamen' },
    ]
  },
  {
    section: 'Stats Bar',
    fields: [
      { key: 'stat1_value', label: 'Statistik 1 - Nilai', placeholder: 'Contoh: 1,200+' },
      { key: 'stat1_label', label: 'Statistik 1 - Label', placeholder: 'Contoh: Gamer Terdaftar' },
      { key: 'stat2_value', label: 'Statistik 2 - Nilai', placeholder: 'Contoh: 340+' },
      { key: 'stat2_label', label: 'Statistik 2 - Label', placeholder: 'Contoh: Tim Aktif' },
      { key: 'stat3_value', label: 'Statistik 3 - Nilai', placeholder: 'Contoh: Rp 50 Jt+' },
      { key: 'stat3_label', label: 'Statistik 3 - Label', placeholder: 'Contoh: Total Prize Pool' },
    ]
  },
  {
    section: 'CTA Section',
    fields: [
      { key: 'cta_title', label: 'CTA Judul', placeholder: 'Contoh: Siap Untuk Berkompetisi?' },
      { key: 'cta_subtitle', label: 'CTA Sub-judul', type: 'textarea', placeholder: 'Deskripsi CTA...' },
    ]
  },
  {
    section: 'Kontak & Info',
    fields: [
      { key: 'contact_whatsapp', label: 'Nomor WhatsApp Admin', placeholder: 'Contoh: 6281234567890' },
      { key: 'contact_email', label: 'Email Kontak', placeholder: 'Contoh: admin@gamearena.id' },
      { key: 'site_name', label: 'Nama Situs', placeholder: 'Contoh: GameArena' },
      { key: 'site_tagline', label: 'Tagline Situs', placeholder: 'Contoh: Platform Turnamen Gaming Terbaik' },
    ]
  },
]

export function ContentEditor({ initialContent }: ContentEditorProps) {
  const [content, setContent] = useState<Record<string, string>>(initialContent)
  const [loading, setLoading] = useState(false)
  // const supabase = createClient() // migrated

  const handleSave = async () => {
    setLoading(true)
    try {
      const entries = Object.entries(content).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }))

      for (const entry of entries) {
        await supabase.from('site_settings').upsert(entry, { onConflict: 'key' })
      }

      toast.success('Konten berhasil disimpan!')
    } catch (err) {
      toast.error('Gagal menyimpan konten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {FIELDS.map((section) => (
        <div key={section.section} className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">{section.section}</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {section.fields.map((field) => (
              <div key={field.key} className={(field as any).type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={field.key} className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</Label>
                {(field as any).type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={content[field.key] || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none text-sm"
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={content[field.key] || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Semua Perubahan
        </Button>
      </div>
    </div>
  )
}

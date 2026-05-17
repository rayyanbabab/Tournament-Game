import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ContentEditor } from '@/components/admin/content-editor'
import { FeaturedTournamentPicker } from '@/components/admin/featured-tournament-picker'
import { LayoutTemplate, Info, Flame } from 'lucide-react'

export default async function AdminContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Load existing site settings
  const { data: settings } = await supabase.from('site_settings').select('key, value')
  const initialContent: Record<string, string> = {}
  settings?.forEach(({ key, value }: { key: string; value: string }) => {
    initialContent[key] = value
  })

  const featuredId = initialContent['featured_tournament_id'] || null

  // Load all tournaments for picker
  const { data: tournaments, error: tourErr } = await supabase
    .from('tournaments')
    .select('id, name, game, start_date, image_url')
    .order('start_date', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-12 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium">Edit Landing Page</span>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Edit Konten Landing Page
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ubah teks, statistik, dan informasi yang tampil di halaman utama situs.
            </p>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-sm">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Cara Kerja</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Perubahan yang Anda simpan di sini akan langsung memperbarui konten yang tampil di halaman utama (<strong>/</strong>).
                Kosongkan kolom untuk menggunakan nilai default.
              </p>
            </div>
          </div>

          {/* ── FEATURED TOURNAMENT ── */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-500/20">
              <Flame className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Mega Banner — Featured Tournament</h2>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">
                Pilih turnamen yang akan ditampilkan sebagai banner utama dengan countdown timer di landing page.
                Turnamen yang dipilih akan muncul paling atas, lengkap dengan gambar cover dan hitung mundur pendaftaran.
              </p>
              <FeaturedTournamentPicker
                tournaments={tournaments ?? []}
                currentFeaturedId={featuredId}
              />
            </div>
          </div>

          {/* Content Editor */}
          <ContentEditor initialContent={initialContent} />
        </main>
      </div>
    </div>
  )
}

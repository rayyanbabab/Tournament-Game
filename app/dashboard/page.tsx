import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Plus,
  CreditCard,
  Activity,
  Scan,
  Gift,
  Trophy,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  X,
  Layers,
  Upload,
  BarChart3,
  Video,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch tournaments created by user or registered
  const { data: userTournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const activeTournamentsCount = userTournaments?.filter((t: any) => t.status === 'upcoming' || t.status === 'ongoing').length || 0
  const totalScansMonth = 0 // In future connected to scan logs table
  const remainingAiCredits = (profile as any)?.ai_credits ?? 5
  const userPlan = (profile as any)?.subscription_tier || 'PAKET GRATIS'
  const displayName = profile?.full_name?.toUpperCase() || profile?.email?.split('@')[0]?.toUpperCase() || 'USER'

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* ── 1. WHATSAPP CHANNEL BANNER ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-zinc-100 shadow-sm relative">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-emerald-400">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Saluran WhatsApp GridPlay
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Info rilis, perubahan fitur, dan jadwal komunitas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://chat.whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm"
          >
            Gabung
          </a>
        </div>
      </div>

      {/* ── 2. HEADER GREETING & CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-1">
          <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
            {displayName} · {userPlan}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {activeTournamentsCount > 0 ? 'Turnamen Aktif.' : 'Belum ada yang berjalan.'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {activeTournamentsCount > 0
              ? 'Kelola match, scan screenshot, dan perbarui klasemen secara langsung.'
              : 'Semua turnamen sudah beres, atau belum ada yang dimulai.'}
          </p>
        </div>

        <Link
          href="/dashboard/create-tournament"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Turnamen baru
        </Link>
      </div>

      {/* ── 3. STATS METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Saldo Kredit Scan */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 flex flex-col justify-between min-h-[140px] space-y-4">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
            <span>SALDO KREDIT SCAN</span>
          </div>
          <div>
            <div className="text-4xl font-extrabold font-mono text-foreground tracking-tight">
              {remainingAiCredits}
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mt-3 transition-colors"
            >
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              Kelola tagihan & kredit
            </Link>
          </div>
        </div>

        {/* Card 2: Turnamen Aktif */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 flex flex-col justify-between min-h-[140px] space-y-4">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
            <span>TURNAMEN AKTIF</span>
            <Activity className="h-4 w-4 opacity-50" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-foreground tracking-tight">
            {activeTournamentsCount}
          </div>
        </div>

        {/* Card 3: Screenshot Bulan Ini */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 flex flex-col justify-between min-h-[140px] space-y-4">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
            <span>SCREENSHOT BULAN INI</span>
            <Scan className="h-4 w-4 opacity-50" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-foreground tracking-tight">
            {totalScansMonth}
          </div>
        </div>
      </div>

      {/* ── 4. DAILY MISSION BANNER ── */}
      <Link
        href="/dashboard/missions"
        className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <Gift className="h-4 w-4 text-amber-500" />
          <span>Misi harian — klaim bonus kredit scan gratis</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* ── 5. TURNAMENMU SECTION ── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Turnamenmu
        </h3>

        {(!userTournaments || userTournaments.length === 0) ? (
          /* Empty State matching GridPlay exactly */
          <div className="rounded-3xl border border-border/80 bg-card/60 p-12 sm:p-16 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Layers className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-foreground">Belum ada turnamen</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buat turnamen pertama, tambahkan tim, lalu biarkan poin dan klasemen dihitung sendiri.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/create-tournament"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Buat turnamen
              </Link>
            </div>
          </div>
        ) : (
          /* List of tournaments */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTournaments.map((t: any) => (
              <div
                key={t.id}
                className="rounded-3xl border border-border/80 bg-card p-6 space-y-5 hover:border-foreground/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground uppercase">
                      BATTLE ROYALE · {t.game || 'FREE FIRE'}
                    </span>
                    <h4 className="text-base font-bold text-foreground mt-2">
                      {t.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Status: {t.status || 'Active'} · {t.max_teams || 12} Tim
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <Link
                    href={`/ocr`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-3 w-3" />
                    Upload Hasil Match
                  </Link>
                  <Link
                    href="/ocr"
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-all flex items-center gap-1.5"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Lihat Klasemen
                  </Link>
                  <Link
                    href="/overlay"
                    target="_blank"
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                  >
                    <Video className="h-3 w-3" />
                    Overlay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

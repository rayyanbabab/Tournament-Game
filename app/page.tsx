import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GridPlayScanner } from '@/components/ocr-calculator/gridplay-scanner'
import { createClient } from '@/lib/supabase/server'
import {
  Upload,
  Calculator,
  Trophy,
  ArrowRight,
  Play,
  CheckCircle2,
  Scan,
  Image as ImageIcon,
  Award,
  Tv,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react'

export const metadata = {
  title: 'GridPlay — Hitung Poin Turnamen Free Fire Otomatis & Klasemen FF',
  description:
    'Platform hitung poin turnamen Free Fire otomatis dari screenshot hasil pertandingan. Papan klasemen instan, ekspor gambar HD, dan cetak sertifikat juara tanpa Excel.',
}

export default async function HomePage() {
  const supabase = await createClient()

  // Optional: fetch real tournaments if database is populated
  const { data: dbTournaments } = await supabase
    .from('tournaments')
    .select('id, name, game, prize_pool, status, max_teams, start_date')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-foreground selection:text-background">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. HERO SECTION ── */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/50 overflow-hidden">
          {/* Subtle blueprint grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6">
                {/* Category Pill */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted/60 text-foreground">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    Sistem Turnamen & Klasemen Free Fire
                  </span>
                </div>

                {/* Primary Hero Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                  Hitung Poin Turnamen Free Fire Tanpa Excel.
                </h1>

                {/* Subtitle Description */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Upload screenshot hasil pertandingan — GridPlay membaca tabelnya, menghitung poin sesuai regulasi resmi, menyusun klasemen, dan menyiapkan sertifikat juara tanpa perlu rekap Excel.
                </p>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/ocr"
                    className="px-6 py-3 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
                  >
                    Coba Gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#cara-kerja"
                    className="px-5 py-3 rounded-full text-sm font-medium border border-border/80 bg-background/60 hover:bg-muted text-foreground transition-all flex items-center gap-2"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Lihat Cara Kerja
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Gratis dicoba
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-foreground" />
                    Standar Resmi FFWS
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-foreground" />
                    Siap pakai 2 menit
                  </span>
                </div>
              </div>

              {/* Right Column: High-End Live Match Card Showcase */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Outer card with clean dark border */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    
                    {/* Top status bar */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-zinc-200">KLASEMEN · RONDE 4</span>
                      </div>
                      <div className="text-zinc-400 font-mono text-[10px] tracking-wider uppercase">
                        BERMUDA · SELESAI
                      </div>
                    </div>

                    {/* Header Columns */}
                    <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-zinc-500 pt-3 pb-2 border-b border-zinc-900">
                      <div className="col-span-2 text-center">#</div>
                      <div className="col-span-6">TIM</div>
                      <div className="col-span-2 text-center">KILL</div>
                      <div className="col-span-2 text-right">POIN</div>
                    </div>

                    {/* Team Rows */}
                    <div className="divide-y divide-zinc-900/90 text-xs font-mono">
                      {[
                        { rank: '01', tag: 'EVS', name: 'EVOS Divine', kills: 14, pts: 96, delta: 'up' },
                        { rank: '02', tag: 'RRQ', name: 'RRQ Kazu', kills: 11, pts: 88, delta: 'down' },
                        { rank: '03', tag: 'ONC', name: 'ONIC Olympus', kills: 9, pts: 81, delta: 'up' },
                        { rank: '04', tag: 'BTR', name: 'Bigetron RA', kills: 7, pts: 74, delta: 'neutral' },
                        { rank: '05', tag: 'AE', name: 'Alter Ego', kills: 6, pts: 69, delta: 'down' },
                      ].map((team) => (
                        <div
                          key={team.rank}
                          className="grid grid-cols-12 items-center py-2.5 hover:bg-zinc-900/50 transition-colors"
                        >
                          <div className="col-span-2 text-center font-bold text-zinc-300">
                            {team.rank}
                          </div>
                          <div className="col-span-6 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-bold">
                              {team.tag}
                            </span>
                            <span className="font-medium text-white tracking-tight truncate">
                              {team.name}
                            </span>
                          </div>
                          <div className="col-span-2 text-center text-zinc-300">
                            {team.kills}
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                            <span className="font-bold text-white">{team.pts}</span>
                            {team.delta === 'up' && (
                              <span className="text-[10px] text-emerald-400">▲</span>
                            )}
                            {team.delta === 'down' && (
                              <span className="text-[10px] text-rose-500">▼</span>
                            )}
                            {team.delta === 'neutral' && (
                              <span className="text-[10px] text-zinc-600">—</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Status bar */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>12 TIM · 4 RONDE</span>
                      <span className="text-emerald-400 font-semibold">
                        KLASEMEN DIPERBARUI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. VERIFIED ORGANIZERS STRIP ── */}
        <section className="py-8 border-b border-border/40 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span>— ORGANIZER YANG TELAH BERGABUNG DAN TERVERIFIKASI</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-foreground">
                    NC
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Norvus Community</p>
                    <span className="text-[10px] text-muted-foreground font-mono">EVENT ORGANIZER</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-foreground">
                    NS
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Norvus Shop</p>
                    <span className="text-[10px] text-muted-foreground font-mono">EVENT ORGANIZER</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-foreground">
                    FF
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Fast Scrim League ID</p>
                    <span className="text-[10px] text-muted-foreground font-mono">GUILD SCRIMS</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    TERVERIFIKASI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CUMA 3 LANGKAH (HOW IT WORKS) ── */}
        <section id="cara-kerja" className="py-20 sm:py-28 border-b border-border/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                — CARA KERJA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Cuma 3 Langkah.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Tidak ada setup ribet. Tidak perlu coding. Tidak perlu pelatihan khusus untuk admin turnamen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 01 */}
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 hover:border-foreground/40 transition-all group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">01</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Upload Screenshot</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Upload hasil pertandingan Free Fire langsung dari galeri HP. Bisa banyak sekaligus per match.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 hover:border-foreground/40 transition-all group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">02</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Hitung Poin Otomatis</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Point placement, total kill, dan tie-breaker dihitung otomatis sesuai format resmi FFWS dalam hitungan detik.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 hover:border-foreground/40 transition-all group">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">03</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Hasil Siap Dibagikan</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Klasemen, leaderboard, dan sertifikat langsung jadi. Tinggal share link atau unduh gambar HD ke grup WA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. MASALAH HITUNG MANUAL DI EXCEL (PAIN POINTS) ── */}
        <section className="py-20 sm:py-28 border-b border-border/50 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                — KENAPA TIDAK EXCEL?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Masalah hitung point manual di Excel
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Menghitung point turnamen dengan tangan memang bisa, tetapi setiap match menambah titik rawan kesalahan. Inilah empat masalah yang paling sering muncul.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Satu match = puluhan angka.',
                  desc: 'Untuk 12 tim, satu match menghasilkan 12 placement dan jumlah kill tiap tim. Turnamen 6 match berarti ratusan sel yang harus diisi dan diverifikasi satu per satu di Excel.',
                },
                {
                  title: 'Typo yang tidak terlihat.',
                  desc: 'Salah ketik satu angka tidak memicu error apa pun — ia hanya membuat klasemen sedikit meleset. Salah baru terasa saat juara diprotes di akhir turnamen.',
                },
                {
                  title: 'Format berantakan saat di-share.',
                  desc: 'Screenshot Excel dari HP seringkali gepeng, buram, dan membingungkan peserta. Tidak ada badge estetik atau layout broadcast resmi.',
                },
                {
                  title: 'Peserta menunggu terlalu lama.',
                  desc: 'Admin menghabiskan 15 hingga 30 menit per ronde hanya untuk merekap angka. Match berikutnya tertunda dan penonton live stream jenuh.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-3"
                >
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. LIVE INTERACTIVE CALCULATOR PREVIEW ── */}
        <section id="demo-kalkulator" className="py-20 sm:py-28 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                — DEMO LANGSUNG
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Coba Hitung Poin Secara Instan
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gunakan simulator di bawah ini untuk mencoba scan OCR, mengubah angka kill, melihat akumulasi klasemen secara live, atau mengunduh gambar PNG.
              </p>
            </div>

            {/* Embedded GridPlay Scanner component */}
            <GridPlayScanner />
          </div>
        </section>

        {/* ── 6. FITUR LENGKAP ── */}
        <section id="fitur" className="py-20 sm:py-28 border-b border-border/50 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                — FITUR LENGKAP
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Semua yang Dibutuhkan Penyelenggara Turnamen FF.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Dirancang khusus untuk ekosistem kompetitif Free Fire Indonesia — dari turnamen guild kecil hingga piala komunitas skala besar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Scan,
                  title: 'Scanner Screenshot Match',
                  desc: 'Pindai tabel hasil akhir pertandingan langsung dari screenshot game. Otomatis membaca posisi juara dan total kill tim.',
                },
                {
                  icon: Trophy,
                  title: 'Sistem Poin Resmi FFWS',
                  desc: 'Skema poin bawaan 12-9-8-7-6-5-4-3-2-1 plus 1 poin per kill. Mendukung kustomisasi poin sesuai rulebook turnamenmu.',
                },
                {
                  icon: ImageIcon,
                  title: 'Ekspor Leaderboard PNG HD',
                  desc: 'Unduh papan klasemen dengan format visual siaran resmi. Siap posting ke Story Instagram, TikTok, dan grup WhatsApp.',
                },
                {
                  icon: Award,
                  title: 'Cetak Sertifikat Juara Otomatis',
                  desc: 'Sertifikat digital instan untuk Juara 1, Juara 2, Juara 3, dan Predator (Most Kill) dengan segel verifikasi resmi.',
                },
                {
                  icon: Tv,
                  title: 'OBS Live Stream Overlay',
                  desc: 'Integrasi URL Browser Source transparan untuk caster dan streamer YouTube/Twitch saat live broadcast.',
                },
                {
                  icon: Users,
                  title: 'Manajemen Slot & Multi-Admin',
                  desc: 'Kelola pendaftaran 12 tim per pot, koordinasi kontak kapten, dan bagikan akses admin turnamen dengan aman.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 hover:border-foreground/30 transition-all"
                >
                  <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. COCOK UNTUK ── */}
        <section id="cocok-untuk" className="py-20 sm:py-28 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                — COCOK UNTUK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Siapa yang Menggunakan GridPlay?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'Guild & Komunitas Free Fire',
                  desc: 'Gelar turnamen internal guild atau mini cup rutin mingguan tanpa repot membuat tabel Excel baru tiap saat.',
                },
                {
                  title: 'Organizer Fast Scrim',
                  desc: 'Selesaikan rekap 4 match dalam hitungan menit agar jadwal room berikutnya bisa segera dimulai tepat waktu.',
                },
                {
                  title: 'Event Organizer Kampus & Daerah',
                  desc: 'Kelola turnamen berskala ratusan peserta dengan transparansi bagan, bukti transfer, dan sertifikat resmi.',
                },
                {
                  title: 'Caster & Content Creator',
                  desc: 'Tampilkan overlay klasemen berjalan (ticker) di OBS Studio tanpa perlu software grafik mahal.',
                },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-3xl border border-border/80 bg-muted/20 space-y-2">
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. BUKTI & TESTIMONI ── */}
        <section id="bukti" className="py-20 sm:py-28 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                — BUKTI & TESTIMONI
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Dipercaya oleh Penyelenggara Turnamen Komunitas.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote:
                    'Dulu tiap match selesai harus ketik manual di spreadsheet 15 menit. Pakai GridPlay tinggal upload screenshot, langsung keluar klasemennya. Sangat menghemat waktu!',
                  author: 'Admin Norvus Community',
                  role: 'Penyelenggara Scrim FF Rutin',
                },
                {
                  quote:
                    'Fitur ekspor PNG-nya rapi sekali, tinggal post ke status WhatsApp & Instagram langsung kelihatan seperti broadcast turnamen resmi tingkat nasional.',
                  author: 'Rian Pratama',
                  role: 'Event Organizer Fast Cup Regional',
                },
                {
                  quote:
                    'Peserta senang karena klasemen keluar cepat dan transparan tanpa ada drama salah hitung poin Booyah.',
                  author: 'Fajar Nugraha',
                  role: 'Kapten Guild Free Fire',
                },
              ].map((t) => (
                <div key={t.author} className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-xs font-bold text-foreground">{t.author}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

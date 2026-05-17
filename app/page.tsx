import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Trophy, Users, Calendar, ArrowRight, Gamepad2,
  Shield, Zap, Star, ChevronRight, CheckCircle,
  Swords, Clock, Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .gt('start_date', now)
    .order('start_date', { ascending: true })
    .limit(3)

  const { count: totalTournaments } = await supabase
    .from('tournaments').select('*', { count: 'exact', head: true })

  const { count: totalTeams } = await supabase
    .from('teams').select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })

  // Load dynamic site settings
  const { data: settingsRows } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, string> = {}
  settingsRows?.forEach(({ key, value }: { key: string; value: string }) => { s[key] = value })

  // Helper: get setting or fallback
  const gs = (key: string, fallback: string) => s[key] || fallback

  const features = [
    {
      icon: Zap,
      title: 'Pendaftaran Instan',
      desc: 'Buat tim, undang anggota, dan daftar turnamen hanya dalam beberapa menit. Proses yang cepat dan tanpa kerumitan.',
    },
    {
      icon: Shield,
      title: 'Terverifikasi Admin',
      desc: 'Setiap pendaftaran diverifikasi oleh admin kami untuk menjamin kompetisi yang adil dan profesional.',
    },
    {
      icon: Trophy,
      title: 'Hadiah Menarik',
      desc: 'Ikuti turnamen dengan total prize pool yang menggiurkan. Buktikan skill dan menangkan hadiah utama!',
    },
    {
      icon: Globe,
      title: 'Berbagai Game',
      desc: 'Tersedia turnamen untuk berbagai genre game populer: MOBA, FPS, Battle Royale, dan masih banyak lagi.',
    },
    {
      icon: Users,
      title: 'Manajemen Tim',
      desc: 'Kelola tim dengan mudah. Tambah anggota, atur roster, dan pantau status pendaftaran secara real-time.',
    },
    {
      icon: Clock,
      title: 'Update Real-time',
      desc: 'Dapatkan informasi terbaru tentang jadwal pertandingan, hasil, dan pengumuman turnamen secara langsung.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">

        {/* ─── HERO SECTION ─── */}
        <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-4 pb-0 pt-16">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Announcement badge */}
            <Link href="/tournaments" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm hover:border-border hover:text-foreground transition-all">
              <Star className="h-3.5 w-3.5 text-primary fill-primary" />
              <span>{gs('hero_badge', 'Platform Turnamen Gaming Terbaik')}</span>
              <span className="flex items-center gap-0.5 text-primary font-semibold">
                Daftar Sekarang
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              {gs('hero_title', 'Arena Turnamen')}{' '}
              <span className="text-muted-foreground">{gs('hero_title2', 'Gaming')}</span>{' '}
              Online Terbaik
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              {gs('hero_subtitle', 'Daftarkan tim Anda, ikuti turnamen seru, dan buktikan kemampuan gaming Anda bersama ribuan gamer lainnya di seluruh Indonesia.')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 gap-2 group">
                <Link href="/auth/signup">
                  {gs('hero_cta_primary', 'Mulai Gratis')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                <Link href="/tournaments">
                  <Swords className="h-4 w-4" />
                  {gs('hero_cta_secondary', 'Lihat Turnamen')}
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <p className="mt-6 text-xs text-muted-foreground/70">
              Bergabung dengan{' '}
              <span className="font-semibold text-muted-foreground">{totalUsers || 0}+ gamer</span>{' '}
              yang telah terdaftar.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto">
            {/* Top gradient mask that fades into the section */}
            <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-transparent z-10" />

            <div className="relative rounded-t-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/10">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/60" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  gamearena.id/dashboard
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Turnamen</span>
                  <span>Tim</span>
                  <span>Profil</span>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-[220px_1fr] min-h-[340px]">
                {/* Sidebar */}
                <div className="border-r border-border/60 bg-background/50 p-4 space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
                      <Gamepad2 className="h-4 w-4 text-background" />
                    </div>
                    <span className="text-sm font-bold">GameArena</span>
                  </div>
                  {[
                    { label: 'Dashboard', active: true },
                    { label: 'Turnamen', active: false },
                    { label: 'Tim Saya', active: false },
                    { label: 'Pengaturan', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${item.active ? 'bg-primary-foreground/60' : 'bg-border'}`} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="p-5 bg-background/30">
                  <h3 className="text-sm font-bold text-foreground mb-1">Dashboard</h3>
                  <p className="text-xs text-muted-foreground mb-4">Selamat datang di GameArena 👾</p>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Turnamen Aktif', value: `${totalTournaments || 0}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Tim Terdaftar', value: `${totalTeams || 0}`, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                      { label: 'Total Gamer', value: `${totalUsers || 0}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-3">
                        <div className={`h-6 w-6 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                          <Trophy className={`h-3.5 w-3.5 ${stat.color}`} />
                        </div>
                        <p className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Activity List */}
                  <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/60">
                      <p className="text-xs font-semibold text-foreground">Pendaftaran Terbaru</p>
                    </div>
                    {[
                      { team: 'Team Alpha', game: 'PUBG Mobile', status: 'Disetujui', color: 'text-emerald-500' },
                      { team: 'Dragon Warriors', game: 'Mobile Legends', status: 'Menunggu', color: 'text-amber-500' },
                      { team: 'Elite Squad', game: 'Free Fire', status: 'Disetujui', color: 'text-emerald-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-border/40 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{item.team[0]}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-foreground">{item.team}</p>
                            <p className="text-[10px] text-muted-foreground">{item.game}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="h-24 bg-gradient-to-b from-transparent to-background" />
          </div>
        </section>

        {/* ─── STATS SECTION ─── */}
        <section id="stats" className="py-20 border-y border-border/60">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { value: `${totalTournaments || 0}+`, label: 'Turnamen Diselenggarakan', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { value: `${totalTeams || 0}+`, label: 'Tim Aktif Berkompetisi', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { value: `${totalUsers || 0}+`, label: 'Gamer Terdaftar', icon: Gamepad2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex flex-col items-center">
                    <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                    <p className="text-5xl font-extrabold text-foreground tracking-tight tabular-nums">{stat.value}</p>
                    <p className="text-base text-muted-foreground mt-2">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── FEATURES SECTION ─── */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-xs font-medium">Platform Terlengkap</Badge>
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Semua yang Anda Butuhkan
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dari pendaftaran hingga pengumuman pemenang, GameArena menyediakan ekosistem lengkap untuk kompetisi gaming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-border/60 bg-card p-6 hover:border-border hover:shadow-lg transition-all duration-300 cursor-default"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── UPCOMING TOURNAMENTS ─── */}
        <section className="py-24 border-t border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="outline" className="mb-3 text-xs font-medium">Segera Dimulai</Badge>
                <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Turnamen Mendatang</h2>
                <p className="text-muted-foreground mt-2">Daftar sebelum slot habis!</p>
              </div>
              <Button asChild variant="outline" className="gap-2 shrink-0">
                <Link href="/tournaments">
                  Lihat Semua Turnamen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {tournaments && tournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament: Tournament) => (
                  <Card key={tournament.id} className="border-border/60 overflow-hidden hover:border-border hover:shadow-xl transition-all duration-300 group flex flex-col">
                    <div className="h-44 relative overflow-hidden bg-muted">
                      {tournament.image_url ? (
                        <img
                          src={tournament.image_url}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                          <Gamepad2 className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-border/60 backdrop-blur text-[11px]">
                        {tournament.game}
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1 text-base">{tournament.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {tournament.description || 'Turnamen seru dengan hadiah menarik!'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-4 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: idLocale })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>Maks. {tournament.max_teams} tim • {tournament.team_size} pemain/tim</span>
                        </div>
                        {tournament.prize_pool && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 w-fit">
                            <Trophy className="h-3.5 w-3.5" />
                            {tournament.prize_pool}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button asChild className="w-full group/btn gap-2" size="sm">
                        <Link href={`/tournaments/${tournament.id}`}>
                          Lihat Detail
                          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/60 rounded-2xl">
                <Gamepad2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-base font-semibold text-foreground">Belum Ada Turnamen</p>
                <p className="text-sm text-muted-foreground mt-1">Pantau terus, turnamen baru akan segera hadir!</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── CTA SECTION ─── */}
        <section className="py-32 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 lg:px-6 relative text-center">
            <Badge variant="outline" className="mb-6 text-xs font-medium">Gratis Selamanya</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6 max-w-2xl mx-auto">
              Siap Membuktikan Skill Anda?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Bergabunglah sekarang, buat tim, dan daftarkan diri ke turnamen pertama Anda. Tanpa biaya pendaftaran.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button asChild size="lg" className="h-12 px-10 text-base shadow-lg shadow-primary/20 gap-2 group">
                <Link href="/auth/signup">
                  Daftar Sekarang — Gratis
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                <Link href="/tournaments">Jelajahi Turnamen</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {['Tidak ada biaya pendaftaran', 'Diverifikasi admin', 'Update real-time'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
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

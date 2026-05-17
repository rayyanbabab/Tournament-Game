import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeaturedBanner } from '@/components/featured-banner'
import {
  Trophy, Users, Calendar, ArrowRight, Gamepad2,
  Shield, Zap, Star, ChevronRight, CheckCircle,
  Swords, Clock, Globe, Newspaper, Medal, Crown,
  Target, Flame, MessageSquare, UserCheck, TrendingUp,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  // Check if user is logged in (for conditional CTA links)
  const { data: { user } } = await supabase.auth.getUser()
  const testimonialHref = user ? '/dashboard/testimonial' : '/auth/login'

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

  // Load dynamic site settings first (needed for featured tournament id)
  const { data: settingsRows } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, string> = {}
  settingsRows?.forEach(({ key, value }: { key: string; value: string }) => { s[key] = value })

  // Helper: get setting or fallback
  const gs = (key: string, fallback: string) => s[key] || fallback

  // Load latest news
  const { data: latestNews } = await supabase
    .from('news_articles')
    .select('id, title, slug, excerpt, cover_image_url, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Load featured tournament
  const featuredId = s['featured_tournament_id']
  let featuredTournament: any = null
  if (featuredId) {
    const { data: ft } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', featuredId)
      .single()
    featuredTournament = ft ?? null
  }
  // Fallback: use first upcoming tournament if no featured set
  if (!featuredTournament && tournaments && tournaments.length > 0) {
    featuredTournament = tournaments[0]
  }

  // Count registrations for featured tournament (to compute slot fill %)
  let featuredRegCount = 0
  if (featuredTournament) {
    const { count } = await supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', featuredTournament.id)
      .in('status', ['pending', 'approved'])
    featuredRegCount = count ?? 0
  }

  // Load recent registrations (real activity feed)
  const { data: recentRegistrations } = await supabase
    .from('tournament_registrations')
    .select(`
      id,
      status,
      registered_at,
      teams ( name ),
      tournaments ( game )
    `)
    .order('registered_at', { ascending: false })
    .limit(5)

  // ── REAL-TIME TOP TEAMS (by approved registrations count) ──
  const { data: topTeamsRaw } = await supabase
    .from('tournament_registrations')
    .select('team_id, teams(id, name, logo_url, captain_id)')
    .eq('status', 'approved')
  
  // Aggregate team counts client-side
  const teamCountMap: Record<string, { name: string; logo_url: string | null; wins: number }> = {}
  topTeamsRaw?.forEach((reg: any) => {
    const tid = reg.team_id
    if (!teamCountMap[tid]) {
      teamCountMap[tid] = { name: reg.teams?.name ?? 'Unknown', logo_url: reg.teams?.logo_url ?? null, wins: 0 }
    }
    teamCountMap[tid].wins++
  })
  const topTeams = Object.entries(teamCountMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5)

  // ── REAL-TIME TOP PLAYERS (by approved registrations via team_members) ──
  const { data: topMembersRaw } = await supabase
    .from('team_members')
    .select('user_id, profiles(id, full_name, email), teams(id)')
  
  // For each member, check how many teams they're in that have approved registrations
  const approvedTeamIds = new Set<string>(topTeamsRaw?.map((r: any) => r.team_id) ?? [])
  const playerCountMap: Record<string, { name: string; email: string; count: number }> = {}
  topMembersRaw?.forEach((m: any) => {
    if (!approvedTeamIds.has(m.teams?.id)) return
    const uid = m.user_id
    if (!playerCountMap[uid]) {
      playerCountMap[uid] = {
        name: m.profiles?.full_name || m.profiles?.email || 'Player',
        email: m.profiles?.email || '',
        count: 0,
      }
    }
    playerCountMap[uid].count++
  })
  const topPlayers = Object.entries(playerCountMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // ── REAL-TIME TESTIMONIALS (approved only) ──
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, author_name, content, rating, game, handle, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

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
        <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-12">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-3xl" />

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

          {/* ── VISUAL SHOWCASE ── */}
          <div className="relative z-10 mt-20 w-full max-w-5xl mx-auto pb-0">
            {/* Ambient glow orbs */}
            <div className="absolute -left-32 top-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-32 top-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* ── LIVE STATS CARD ── */}
              <div className="md:col-span-1 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card p-5 flex flex-col gap-3 shadow-xl shadow-primary/5 backdrop-blur-sm" style={{animation: 'floatA 6s ease-in-out infinite'}}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" style={{animation: 'pulse 2s ease-in-out infinite'}} />
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Live Stats</span>
                  </div>
                  <Gamepad2 className="h-4 w-4 text-primary/30" />
                </div>
                <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Turnamen Aktif', value: `${totalTournaments || 0}`, icon: Trophy, color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
                  { label: 'Tim Bersaing', value: `${totalTeams || 0}`, icon: Users, color: '#818cf8', glow: 'rgba(129,140,248,0.25)' },
                  { label: 'Total Gamer', value: `${totalUsers || 0}`, icon: Gamepad2, color: '#34d399', glow: 'rgba(52,211,153,0.25)' },
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{background: stat.glow}}>
                        <Icon className="h-3.5 w-3.5" style={{color: stat.color}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground leading-none">{stat.label}</p>
                        <p className="text-lg font-extrabold tabular-nums text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>

              {/* ── CENTER: TOURNAMENT CARD (REAL DATA) ── */}
              {featuredTournament ? (
                <Link href={`/tournaments/${featuredTournament.id}`} className="md:col-span-1 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xl flex flex-col hover:border-primary/40 hover:shadow-primary/10 transition-all" style={{animation: 'floatB 7s ease-in-out infinite'}}>
                  <div className="relative h-36 overflow-hidden">
                    {featuredTournament.image_url ? (
                      <img src={featuredTournament.image_url} alt={featuredTournament.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 via-violet-500/20 to-amber-500/10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
                        <div className="text-center relative z-10">
                          <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                            <Trophy className="h-7 w-7 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">Turnamen Unggulan</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        featuredTournament.status === 'upcoming'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : featuredTournament.status === 'ongoing'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-muted/20 text-muted-foreground border-border/30'
                      }`}>
                        {featuredTournament.status === 'upcoming' ? 'OPEN'
                          : featuredTournament.status === 'ongoing' ? 'LIVE'
                          : featuredTournament.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="text-[10px] bg-background/80 text-foreground border-border/60 backdrop-blur">{featuredTournament.game}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-foreground text-sm line-clamp-1">{featuredTournament.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{featuredTournament.game} • {featuredTournament.team_size} pemain/tim</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Prize Pool', value: featuredTournament.prize_pool || 'TBA', icon: Trophy },
                        { label: 'Maks. Tim', value: `${featuredTournament.max_teams} Tim`, icon: Users },
                        { label: 'Mulai', value: format(new Date(featuredTournament.start_date), 'dd MMM yyyy', { locale: idLocale }), icon: Calendar },
                        { label: 'Deadline', value: format(new Date(featuredTournament.registration_deadline), 'dd MMM yyyy', { locale: idLocale }), icon: Clock },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-lg bg-muted/40 border border-border/30 px-3 py-2">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1"><Icon className="h-2.5 w-2.5" />{label}</p>
                          <p className="text-xs font-bold text-foreground mt-0.5 truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-1">
                      {(() => {
                        const pct = featuredTournament.max_teams > 0
                          ? Math.min(100, Math.round((featuredRegCount / featuredTournament.max_teams) * 100))
                          : 0
                        return (
                          <>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700" style={{width: `${pct}%`, boxShadow: '0 0 8px rgba(var(--primary-rgb,0,200,200),0.5)'}} />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{featuredRegCount}/{featuredTournament.max_teams} slot terisi ({pct}%)</p>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="md:col-span-1 rounded-2xl border border-dashed border-border/40 bg-card flex flex-col items-center justify-center p-8 text-center gap-3 shadow-xl" style={{animation: 'floatB 7s ease-in-out infinite'}}>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-primary/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Belum ada turnamen unggulan</p>
                  <Link href="/tournaments" className="text-xs text-primary font-medium hover:underline">Lihat semua turnamen →</Link>
                </div>
              )}

              {/* ── RIGHT: ACTIVITY FEED (REAL DATA) ── */}
              <div className="md:col-span-1 rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-3 shadow-xl" style={{animation: 'floatA 8s ease-in-out infinite reverse'}}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-widest">Aktivitas Terbaru</p>
                  <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-semibold">Live</span>
                </div>
                <div className="flex flex-col gap-2">
                  {recentRegistrations && recentRegistrations.length > 0 ? (
                    recentRegistrations.map((reg: any, i: number) => {
                      const teamName: string = reg.teams?.name ?? 'Tim Tidak Dikenal'
                      const gameName: string = reg.tournaments?.game ?? 'Unknown'
                      const statusMap: Record<string, { label: string; color: string; dot: string }> = {
                        approved: { label: 'Disetujui', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                        pending:  { label: 'Menunggu',  color: 'text-amber-400',   dot: 'bg-amber-400'   },
                        rejected: { label: 'Ditolak',   color: 'text-red-400',     dot: 'bg-red-400'     },
                        withdrawn:{ label: 'Mundur',    color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
                      }
                      const s = statusMap[reg.status] ?? statusMap.pending
                      const timeAgo = formatDistanceToNow(new Date(reg.registered_at), { addSuffix: true, locale: idLocale })
                      return (
                        <div key={reg.id ?? i} className="flex items-center gap-2.5 rounded-xl border border-border/30 bg-muted/20 px-3 py-2.5 hover:border-border/60 transition-colors">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-extrabold text-primary">{teamName[0]?.toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">{teamName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{gameName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end">
                              <div className={`h-1.5 w-1.5 rounded-full ${s.dot} shrink-0`} />
                              <span className={`text-[10px] font-bold ${s.color}`}>{s.label}</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground/50 mt-0.5">{timeAgo}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                      <Gamepad2 className="h-8 w-8 text-muted-foreground/20" />
                      <p className="text-xs text-muted-foreground">Belum ada pendaftaran</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes floatA {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes floatB {
              0%, 100% { transform: translateY(-6px); }
              50% { transform: translateY(6px); }
            }
          `}</style>
        </section>

        {/* ─── FEATURED BANNER (seamless) ─── */}
        {featuredTournament && (
          <div className="relative overflow-hidden">
            <FeaturedBanner tournament={featuredTournament} />
          </div>
        )}

        {/* ─── STATS SECTION ─── */}
        <section id="stats" className="py-16 border-y border-border/60 bg-muted/[0.04]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-border/60">
              {[
                { value: `${totalTournaments || 0}+`, label: 'Turnamen Diselenggarakan', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                { value: `${totalTeams || 0}+`, label: 'Tim Aktif Berkompetisi', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { value: `${totalUsers || 0}+`, label: 'Gamer Terdaftar', icon: Gamepad2, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex flex-col items-center text-center px-8">
                    <div className={`h-12 w-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <p className="text-5xl font-extrabold text-foreground tracking-tight tabular-nums">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-24 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent)]" />
          <div className="container mx-auto px-4 lg:px-6 relative">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-xs font-medium">Mudah & Cepat</Badge>
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">Cara Mulai Bermain</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">Hanya 3 langkah untuk bergabung dan mulai berkompetisi di GameArena.</p>
            </div>
            <div className="relative">
              {/* Connector line */}
              <div className="hidden lg:block absolute top-10 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  { step: '01', icon: UserCheck, title: 'Buat Akun Gratis', desc: 'Daftar dalam hitungan detik. Tidak perlu kartu kredit, tidak ada biaya tersembunyi.', color: 'from-primary/20 to-primary/5', glow: 'shadow-primary/20', iconColor: 'text-primary', border: 'border-primary/20' },
                  { step: '02', icon: Users, title: 'Bentuk Tim Anda', desc: 'Undang teman, atur roster, dan siapkan strategi terbaik untuk menghadapi kompetitor.', color: 'from-violet-500/20 to-violet-500/5', glow: 'shadow-violet-500/20', iconColor: 'text-violet-400', border: 'border-violet-500/20' },
                  { step: '03', icon: Trophy, title: 'Menangkan Turnamen', desc: 'Daftar ke turnamen pilihan, bertanding, dan raih prize pool. Jadilah juara GameArena!', color: 'from-amber-500/20 to-amber-500/5', glow: 'shadow-amber-500/20', iconColor: 'text-amber-400', border: 'border-amber-500/20' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className={`group relative rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-8 flex flex-col items-center text-center hover:shadow-xl ${item.glow} transition-all duration-500 cursor-default`}>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center">
                        <span className="text-[11px] font-extrabold text-muted-foreground">{item.step}</span>
                      </div>
                      <div className={`h-16 w-16 rounded-2xl bg-background/60 border ${item.border} flex items-center justify-center mb-5 mt-2 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-8 w-8 ${item.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES SECTION ─── */}
        <section id="features" className="py-24 border-t border-border/60 bg-muted/[0.04]">
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

        {/* ─── GAME CATEGORIES ─── */}
        <section className="py-24 border-t border-border/60 bg-muted/[0.04]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 text-xs font-medium">Multi-Genre</Badge>
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">Genre Game yang Didukung</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">Dari MOBA hingga Battle Royale — turnamen tersedia untuk semua jenis gamer.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'MOBA', icon: Swords, games: 'ML, LoL, Dota', gradient: 'from-blue-600/20 to-cyan-500/10', border: 'border-blue-500/20', color: 'text-blue-400', glow: 'hover:shadow-blue-500/20' },
                { name: 'Battle Royale', icon: Target, games: 'PUBG, FF, COD', gradient: 'from-amber-600/20 to-orange-500/10', border: 'border-amber-500/20', color: 'text-amber-400', glow: 'hover:shadow-amber-500/20' },
                { name: 'FPS / TPS', icon: Flame, games: 'Valorant, CS2', gradient: 'from-red-600/20 to-pink-500/10', border: 'border-red-500/20', color: 'text-red-400', glow: 'hover:shadow-red-500/20' },
                { name: 'RPG', icon: Shield, games: 'Genshin, AFK', gradient: 'from-emerald-600/20 to-teal-500/10', border: 'border-emerald-500/20', color: 'text-emerald-400', glow: 'hover:shadow-emerald-500/20' },
                { name: 'Racing', icon: Zap, games: 'GRID, F1, NFS', gradient: 'from-violet-600/20 to-purple-500/10', border: 'border-violet-500/20', color: 'text-violet-400', glow: 'hover:shadow-violet-500/20' },
                { name: 'Others', icon: Star, games: 'Dan banyak lagi', gradient: 'from-primary/20 to-primary/5', border: 'border-primary/20', color: 'text-primary', glow: 'hover:shadow-primary/20' },
              ].map((cat, i) => {
                const Icon = cat.icon
                return (
                  <div key={i} className={`group rounded-2xl border ${cat.border} bg-gradient-to-b ${cat.gradient} p-5 flex flex-col items-center text-center gap-3 hover:shadow-lg ${cat.glow} transition-all duration-300 cursor-default`}>
                    <div className={`h-11 w-11 rounded-xl bg-background/50 border ${cat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-5 w-5 ${cat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{cat.games}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── UPCOMING TOURNAMENTS ─── */}
        <section className="py-24 border-t border-border/60">
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
                  <div key={tournament.id} className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                    {/* Cover */}
                    <div className="h-44 relative overflow-hidden bg-muted">
                      {tournament.image_url ? (
                        <img
                          src={tournament.image_url}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/5 to-violet-500/10 flex items-center justify-center">
                          <Gamepad2 className="h-14 w-14 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-background/80 text-foreground border border-border/60 backdrop-blur">
                        {tournament.game}
                      </span>
                      {tournament.prize_pool && (
                        <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur flex items-center gap-1">
                          <Trophy className="h-3 w-3" />{tournament.prize_pool}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div>
                        <h3 className="font-bold text-foreground line-clamp-1">{tournament.name}</h3>
                        {tournament.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{tournament.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                          <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: idLocale })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                          <span>Maks. {tournament.max_teams} tim &bull; {tournament.team_size} pemain/tim</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-2">
                        <Button asChild className="w-full gap-2 group/btn" size="sm">
                          <Link href={`/tournaments/${tournament.id}`}>
                            Lihat Detail
                            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/60 rounded-2xl gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-primary/30" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Belum Ada Turnamen</p>
                  <p className="text-sm text-muted-foreground mt-1">Pantau terus, turnamen baru akan segera hadir!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── LEADERBOARD SECTION ─── */}
        <section className="py-24 border-t border-border/60">
          <div className="container mx-auto px-4 lg:px-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-xs font-medium">Real-time Rankings</Badge>
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Hall of Fame</h2>
              <p className="text-muted-foreground mt-2">Peringkat pemain &amp; tim terbaik berdasarkan data pendaftaran turnamen.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* ── TOP PLAYERS (REAL) ── */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40 bg-amber-500/[0.03]">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Top Players</h3>
                    <p className="text-[10px] text-muted-foreground">Berdasarkan turnamen diikuti</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Live</span>
                </div>

                {topPlayers.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {topPlayers.map((player, i) => {
                      const rankColors = [
                        { ring: 'border-amber-400/40 bg-amber-400/10', text: 'text-amber-400' },
                        { ring: 'border-slate-400/30 bg-slate-400/10',  text: 'text-slate-400' },
                        { ring: 'border-amber-700/30 bg-amber-700/10',  text: 'text-amber-600' },
                        { ring: 'border-border/40 bg-muted/40',         text: 'text-muted-foreground' },
                        { ring: 'border-border/40 bg-muted/40',         text: 'text-muted-foreground' },
                      ]
                      const rc = rankColors[i] ?? rankColors[3]
                      const initial = (player.name[0] || 'P').toUpperCase()
                      return (
                        <div key={player.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                          {/* Rank */}
                          <div className="w-5 flex justify-center shrink-0">
                            {i === 0
                              ? <Crown className="h-4 w-4 text-amber-400" />
                              : <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                            }
                          </div>
                          {/* Avatar */}
                          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${rc.ring}`}>
                            <span className={`text-sm font-extrabold ${rc.text}`}>{initial}</span>
                          </div>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{player.name}</p>
                            <p className="text-[10px] text-muted-foreground">{player.email}</p>
                          </div>
                          {/* Score */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-foreground tabular-nums">{player.count}</span>
                            <span className="text-[10px] text-muted-foreground">t</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                    <Crown className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Belum ada data pemain</p>
                  </div>
                )}
              </div>

              {/* ── TOP TEAMS (REAL) ── */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40 bg-violet-500/[0.03]">
                  <Shield className="h-4 w-4 text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Top Teams</h3>
                    <p className="text-[10px] text-muted-foreground">Berdasarkan turnamen disetujui</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Live</span>
                </div>

                {topTeams.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {topTeams.map((team, i) => {
                      const rankColors = [
                        { ring: 'border-amber-400/40 bg-amber-400/10', text: 'text-amber-400' },
                        { ring: 'border-slate-400/30 bg-slate-400/10',  text: 'text-slate-400' },
                        { ring: 'border-amber-700/30 bg-amber-700/10',  text: 'text-amber-600' },
                        { ring: 'border-border/40 bg-muted/40',         text: 'text-muted-foreground' },
                        { ring: 'border-border/40 bg-muted/40',         text: 'text-muted-foreground' },
                      ]
                      const rc = rankColors[i] ?? rankColors[3]
                      return (
                        <div key={team.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                          {/* Rank */}
                          <div className="w-5 flex justify-center shrink-0">
                            {i === 0
                              ? <Crown className="h-4 w-4 text-amber-400" />
                              : <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                            }
                          </div>
                          {/* Logo/Avatar */}
                          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden ${rc.ring}`}>
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className={`text-sm font-extrabold ${rc.text}`}>{team.name[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
                            <p className="text-[10px] text-muted-foreground">{team.wins} turnamen diikuti</p>
                          </div>
                          {/* Score */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-foreground tabular-nums">{team.wins}</span>
                            <span className="text-[10px] text-muted-foreground">t</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                    <Shield className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Belum ada data tim</p>
                  </div>
                )}
              </div>

              {/* ── PLATFORM HIGHLIGHTS ── */}
              <div className="space-y-3">
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform Stats</span>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">Kenapa GameArena?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Platform turnamen gaming paling kompetitif di Indonesia.</p>
                </div>
                {[
                  { icon: TrendingUp, title: 'Pertumbuhan 200% per bulan',     desc: 'Komunitas gamer yang terus berkembang pesat setiap bulannya.',          color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                  { icon: Medal,      title: 'Prize Pool Total Rp 50 Juta+',   desc: 'Total hadiah yang telah dibagikan kepada para pemenang turnamen.',       color: 'text-amber-400',  bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
                  { icon: Shield,     title: 'Anti-Cheat Terverifikasi',        desc: 'Sistem keamanan berlapis memastikan kompetisi yang adil dan transparan.', color: 'text-blue-400',   bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
                  { icon: Clock,      title: 'Support 24/7',                    desc: 'Tim admin kami siap membantu kapan saja, 24 jam sehari, 7 hari seminggu.', color: 'text-violet-400', bg: 'bg-violet-400/10',  border: 'border-violet-400/20' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className={`flex items-start gap-4 rounded-xl border ${item.border} bg-card px-5 py-4 hover:shadow-md transition-all`}>
                      <div className={`h-9 w-9 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── BERITA SECTION ─── */}
        {latestNews && latestNews.length > 0 && (
          <section className="py-20 border-t border-border/60">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">Berita Terbaru</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Update dari GameArena</h2>
                </div>
                <Link href="/news" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
                  Lihat semua <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {latestNews.map((article: any, idx: number) => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="group">
                    <div className={`rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all h-full flex flex-col ${
                      idx === 0 ? 'md:col-span-1' : ''
                    }`}>
                      <div className="h-44 overflow-hidden bg-muted">
                        {article.cover_image_url ? (
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <Newspaper className="h-12 w-12 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            {article.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(article.created_at), 'dd MMM yyyy', { locale: idLocale })}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                        )}
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          Baca <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex justify-center mt-6 sm:hidden">
                <Link href="/news" className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Lihat semua berita <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─── TESTIMONIALS (REAL-TIME) ─── */}
        <section className="py-24 border-t border-border/60 bg-muted/10 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="text-center md:text-left">
                <Badge variant="outline" className="mb-4 text-xs font-medium">Komunitas</Badge>
                <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">Kata Mereka Tentang GameArena</h2>
                <p className="text-muted-foreground max-w-xl">
                  Ulasan nyata dari para gamer yang telah merasakan pengalaman kompetisi di platform kami.
                </p>
              </div>
              <Button asChild variant="outline" className="gap-2 shrink-0 self-center md:self-end">
                <Link href={testimonialHref}>
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  {user ? 'Tulis Ulasan Anda' : 'Login & Tulis Ulasan'}
                </Link>
              </Button>
            </div>

            {testimonials && testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {testimonials.map((t: any) => {
                  const initial = (t.author_name?.[0] || 'G').toUpperCase()
                  const avatarColors = [
                    { bg: 'bg-primary/10', text: 'text-primary' },
                    { bg: 'bg-violet-400/10', text: 'text-violet-400' },
                    { bg: 'bg-amber-400/10', text: 'text-amber-500' },
                    { bg: 'bg-emerald-400/10', text: 'text-emerald-500' },
                    { bg: 'bg-pink-400/10', text: 'text-pink-400' },
                    { bg: 'bg-blue-400/10', text: 'text-blue-400' },
                  ]
                  const ac = avatarColors[t.author_name?.charCodeAt(0) % avatarColors.length] ?? avatarColors[0]
                  return (
                    <div key={t.id} className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col gap-4 hover:border-border hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${
                            j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
                          }`} />
                        ))}
                        <span className="ml-1.5 text-[11px] font-bold text-amber-500">{t.rating}.0</span>
                      </div>
                      {/* Review text */}
                      <div className="flex items-start gap-2 flex-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground/20 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">
                          &ldquo;{t.content}&rdquo;
                        </p>
                      </div>
                      {/* Author */}
                      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border/40">
                        <div className={`h-9 w-9 rounded-full ${ac.bg} border border-border/40 flex items-center justify-center shrink-0`}>
                          <span className={`text-sm font-extrabold ${ac.text}`}>{initial}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{t.author_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {t.handle && <span>{t.handle}</span>}
                            {t.handle && t.game && <span> &bull; </span>}
                            {t.game && <span>{t.game}</span>}
                            {!t.handle && !t.game && <span>GameArena Player</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Fallback: empty state with CTA
              <div className="flex flex-col items-center justify-center py-20 text-center gap-5 rounded-2xl border border-dashed border-border/60">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Star className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Belum ada ulasan</p>
                  <p className="text-sm text-muted-foreground mt-1">Jadilah yang pertama berbagi pengalaman Anda!</p>
                </div>
                <Button asChild className="gap-2">
                  <Link href={testimonialHref}>
                    <Star className="h-4 w-4" />
                    {user ? 'Tulis Ulasan Pertama' : 'Login untuk Menulis Ulasan'}
                  </Link>
                </Button>
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

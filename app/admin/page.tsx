import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Sun,
  MoreHorizontal,
  Loader,
  CircleCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminAreaChart, RegistrationStatusChart } from '@/components/admin/dashboard-charts'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { count: totalTournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })
  const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: pendingRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: approvedRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved')

  const { data: recentRegistrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(name, game), teams(name), profiles:registered_by(full_name, email)')
    .order('registered_at', { ascending: false })
    .limit(8)

  // All registrations for chart
  const { data: allRegistrations } = await supabase
    .from('tournament_registrations')
    .select('registered_at, status')
    .order('registered_at', { ascending: true })

  const regCounts = {
    pending: pendingRegistrations || 0,
    approved: approvedRegistrations || 0,
    rejected: (allRegistrations?.filter(r => r.status === 'rejected').length) || 0,
  }
  const registrationStatusData = [
    { name: 'Menunggu', value: regCounts.pending },
    { name: 'Disetujui', value: regCounts.approved },
    { name: 'Ditolak', value: regCounts.rejected },
  ]

  const { data: recentTournaments } = await supabase
    .from('tournaments').select('*').order('created_at', { ascending: false }).limit(8)

  const stats = [
    {
      title: 'Total Turnamen',
      value: totalTournaments || 0,
      icon: Trophy,
      trend: '+12.5%',
      trendUp: true,
      desc: 'Meningkat bulan ini',
      sub: 'Selama 6 bulan terakhir',
    },
    {
      title: 'Tim Terdaftar',
      value: totalTeams || 0,
      icon: Users,
      trend: '-8%',
      trendUp: false,
      desc: 'Turun 8% periode ini',
      sub: 'Perlu perhatian lebih',
    },
    {
      title: 'Total Pengguna',
      value: totalUsers || 0,
      icon: Gamepad2,
      trend: '+24.5%',
      trendUp: true,
      desc: 'Retensi pengguna kuat',
      sub: 'Target keterlibatan tercapai',
    },
    {
      title: 'Disetujui',
      value: approvedRegistrations || 0,
      icon: CheckCircle2,
      trend: '+4.5%',
      trendUp: true,
      desc: 'Peningkatan stabil',
      sub: 'Memenuhi target pertumbuhan',
    },
  ]

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: 'Menunggu', icon: Loader, color: 'text-amber-500' },
    approved: { label: 'Disetujui', icon: CircleCheck, color: 'text-emerald-500' },
    rejected: { label: 'Ditolak', icon: AlertCircle, color: 'text-red-500' },
    withdrawn: { label: 'Dibatalkan', icon: AlertCircle, color: 'text-muted-foreground' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar — desktop only */}
        <header className="hidden md:flex sticky top-0 z-30 h-12 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-4">
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-border/60 bg-muted/30 text-sm text-muted-foreground w-56">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-auto text-[10px] border border-border/60 rounded px-1 py-0.5 bg-background font-mono">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors text-xs">Landing Page</Link>
            <Link href="/tournaments" className="hover:text-foreground transition-colors text-xs">Turnamen</Link>
            <Link href="https://github.com/rayyanbabab/Games" target="_blank" className="hover:text-foreground transition-colors text-xs">GitHub</Link>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground hover:text-foreground transition-colors ml-1">
              <Sun className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto pt-16 md:pt-4">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Selamat datang di admin dashboard GameArena</p>
            </div>
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/admin/tournaments/create">
                <Plus className="h-3.5 w-3.5" />
                Buat Turnamen
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, i) => {
              const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown
              return (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-3 md:p-5 hover:border-border transition-colors">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <div className={`flex items-center gap-1 text-[11px] md:text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'} shrink-0 ml-1`}>
                      <TrendIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">{stat.trend}</span>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight tabular-nums mb-2 md:mb-3">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="pt-2 md:pt-3 border-t border-border/60">
                    <p className="text-[11px] md:text-xs font-medium text-foreground flex items-center gap-1">
                      <TrendIcon className={`h-3 w-3 ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'} shrink-0`} />
                      <span className="truncate">{stat.desc}</span>
                    </p>
                    <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{stat.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          <AdminAreaChart registrations={allRegistrations || []} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <RegistrationStatusChart data={registrationStatusData} />
            {/* Quick links */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <h2 className="text-base font-semibold text-foreground">Akses Cepat Admin</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Navigasi ke halaman manajemen</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { href: '/admin/registrations', label: 'Kelola Pendaftaran', desc: 'Review & setujui', emoji: '📋' },
                  { href: '/admin/payments', label: 'Kelola Pembayaran', desc: 'Verifikasi bukti bayar', emoji: '💳' },
                  { href: '/admin/content', label: 'Edit Landing Page', desc: 'Ubah konten situs', emoji: '✏️' },
                  { href: '/admin/tournaments/create', label: 'Buat Turnamen', desc: 'Tambah turnamen baru', emoji: '🏆' },
                ].map((item) => (
                  <a key={item.href} href={item.href} className="flex flex-col p-3 rounded-lg border border-border/60 hover:border-border hover:bg-muted/30 transition-all group">
                    <span className="text-xl mb-2">{item.emoji}</span>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

            {/* Registrations Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Pendaftaran Terbaru</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Memerlukan persetujuan admin</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <Link href="/admin/registrations">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tim / Turnamen</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-center">Status</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-8"></span>
              </div>

              {recentRegistrations && recentRegistrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentRegistrations.map((reg: any) => {
                    const config = statusConfig[reg.status]
                    const StatusIcon = config?.icon
                    return (
                      <div key={reg.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{reg.teams?.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{reg.tournaments?.name}</p>
                        </div>
                        <div className="w-20 flex justify-center">
                          {config && (
                            <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          )}
                        </div>
                        <div className="w-8 flex justify-end">
                          <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Semua sudah diproses</p>
                </div>
              )}

              {/* Table Footer */}
              {recentRegistrations && recentRegistrations.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{recentRegistrations.length} dari total pendaftaran</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Baris per halaman</span>
                    <span className="text-xs border border-border/60 rounded px-2 py-0.5 bg-background">10</span>
                    <span className="text-xs text-muted-foreground">Hal. 1 dari 1</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tournaments Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Turnamen Terbaru</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Turnamen yang baru dibuat</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <Link href="/admin/tournaments">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Nama Turnamen</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-24 text-center">Tanggal Mulai</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-8"></span>
              </div>

              {recentTournaments && recentTournaments.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentTournaments.map((tournament: any) => (
                    <Link
                      key={tournament.id}
                      href={`/admin/tournaments/${tournament.id}`}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tournament.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">{tournament.game}</Badge>
                        </div>
                      </div>
                      <div className="w-24 flex justify-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                      <div className="w-8 flex justify-end">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada turnamen</p>
                  <Button asChild size="sm" className="mt-3 h-7 text-xs gap-1.5">
                    <Link href="/admin/tournaments/create">
                      <Plus className="h-3.5 w-3.5" />
                      Buat Sekarang
                    </Link>
                  </Button>
                </div>
              )}

              {/* Table Footer */}
              {recentTournaments && recentTournaments.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{recentTournaments.length} dari total turnamen</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Baris per halaman</span>
                    <span className="text-xs border border-border/60 rounded px-2 py-0.5 bg-background">10</span>
                    <span className="text-xs text-muted-foreground">Hal. 1 dari 1</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

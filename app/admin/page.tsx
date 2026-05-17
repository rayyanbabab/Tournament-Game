import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, Users, Calendar, Plus, ArrowRight, Gamepad2,
  CheckCircle2, AlertCircle, Search, MoreHorizontal,
  Loader, CircleCheck, TrendingUp, Bell, Zap,
  ClipboardList, Banknote, LayoutTemplate, Settings,
  ChevronRight, Activity,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { format, formatDistanceToNow } from 'date-fns'
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
  const { count: activeTournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing'])
  const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: pendingRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: approvedRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved')
  const { count: rejectedRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
  const { count: totalRegistrations } = await supabase.from('tournament_registrations').select('*', { count: 'exact', head: true })

  const { data: recentRegistrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(name, game), teams(name), profiles:registered_by(full_name, email)')
    .order('registered_at', { ascending: false })
    .limit(8)

  const { data: allRegistrations } = await supabase
    .from('tournament_registrations')
    .select('registered_at, status')
    .order('registered_at', { ascending: true })

  const regCounts = {
    pending: pendingRegistrations || 0,
    approved: approvedRegistrations || 0,
    rejected: rejectedRegistrations || 0,
  }
  const registrationStatusData = [
    { name: 'Menunggu', value: regCounts.pending },
    { name: 'Disetujui', value: regCounts.approved },
    { name: 'Ditolak', value: regCounts.rejected },
  ]

  const { data: recentTournaments } = await supabase
    .from('tournaments').select('*').order('created_at', { ascending: false }).limit(8)

  const approvalRate = (totalRegistrations || 0) > 0
    ? Math.round(((approvedRegistrations || 0) / (totalRegistrations || 1)) * 100)
    : 0

  const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pending:   { label: 'Menunggu',   icon: Loader,       color: 'text-amber-500',          bg: 'bg-amber-500/10',           border: 'border-amber-500/20' },
    approved:  { label: 'Disetujui',  icon: CircleCheck,  color: 'text-emerald-500',        bg: 'bg-emerald-500/10',         border: 'border-emerald-500/20' },
    rejected:  { label: 'Ditolak',    icon: AlertCircle,  color: 'text-red-500',            bg: 'bg-red-500/10',             border: 'border-red-500/20' },
    withdrawn: { label: 'Dibatalkan', icon: AlertCircle,  color: 'text-muted-foreground',   bg: 'bg-muted/40',               border: 'border-border/40' },
  }

  const stats = [
    {
      title: 'Total Turnamen',
      value: totalTournaments || 0,
      icon: Trophy,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-500',
      accent: 'border-l-amber-500',
      badge: `${activeTournaments || 0} aktif`,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      sub: `${activeTournaments || 0} sedang berjalan`,
      trend: '+2 bulan ini',
    },
    {
      title: 'Tim Terdaftar',
      value: totalTeams || 0,
      icon: Users,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-500',
      accent: 'border-l-blue-500',
      badge: `${totalRegistrations || 0} registrasi`,
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      sub: `Total ${totalRegistrations || 0} pendaftaran`,
      trend: 'Total keseluruhan',
    },
    {
      title: 'Total Pengguna',
      value: totalUsers || 0,
      icon: Gamepad2,
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-500',
      accent: 'border-l-violet-500',
      badge: `${pendingRegistrations || 0} pending`,
      badgeColor: (pendingRegistrations || 0) > 0
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        : 'bg-muted text-muted-foreground border-border',
      sub: `${pendingRegistrations || 0} menunggu review`,
      trend: 'Akun terdaftar',
    },
    {
      title: 'Tingkat Persetujuan',
      value: approvalRate,
      valueSuffix: '%',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-500',
      accent: 'border-l-emerald-500',
      badge: `${approvedRegistrations || 0} disetujui`,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      sub: `${rejectedRegistrations || 0} ditolak`,
      trend: 'Dari total masuk',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── TOP BAR ── */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border/60 bg-muted/30 text-sm text-muted-foreground w-60 cursor-pointer hover:border-border transition-colors">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs flex-1">Cari turnamen, tim...</span>
              <kbd className="text-[10px] border border-border/60 rounded px-1.5 py-0.5 bg-background font-mono text-muted-foreground">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(pendingRegistrations || 0) > 0 && (
              <Link href="/admin/registrations" className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/15 transition-colors">
                <Bell className="h-3.5 w-3.5" />
                {pendingRegistrations} pendaftaran menunggu
              </Link>
            )}
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Situs</Link>
            <ThemeToggle size="sm" />
            <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{profile?.full_name?.[0]?.toUpperCase() ?? 'A'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* ── PAGE HEADER ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
                <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Selamat datang kembali, <span className="font-semibold text-foreground">{profile?.full_name ?? 'Admin'}</span>
              </p>
            </div>
            <Button asChild size="sm" className="h-9 gap-2 px-4 shadow-md shadow-primary/20 shrink-0">
              <Link href="/admin/tournaments/create">
                <Plus className="h-4 w-4" />
                Buat Turnamen
              </Link>
            </Button>
          </div>

          {/* ── PENDING ALERT ── */}
          {(pendingRegistrations || 0) > 0 && (
            <Link href="/admin/registrations"
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-3.5 hover:bg-amber-500/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {pendingRegistrations} Pendaftaran Menunggu Persetujuan
                  </p>
                  <p className="text-xs text-muted-foreground">Klik untuk review dan tindak lanjut segera</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {/* ── STATS GRID ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className={`rounded-xl border border-border/60 border-l-2 ${stat.accent} bg-card p-5 hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-9 w-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-4.5 w-4.5 ${stat.iconColor}`} style={{height:'18px', width:'18px'}} />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stat.badgeColor} hidden sm:inline-flex items-center`}>
                      {stat.badge}
                    </span>
                  </div>
                  <div className="mb-1">
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <div className="flex items-end gap-0.5">
                      <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums leading-none">
                        {stat.value.toLocaleString()}
                      </span>
                      {(stat as any).valueSuffix && (
                        <span className="text-xl font-bold text-muted-foreground mb-0.5">{(stat as any).valueSuffix}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 truncate">{stat.sub}</p>
                </div>
              )
            })}
          </div>

          {/* ── CHARTS ROW ── */}
          <AdminAreaChart registrations={allRegistrations || []} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <RegistrationStatusChart data={registrationStatusData} />

            {/* Quick Actions */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Akses Cepat</h2>
                  <p className="text-xs text-muted-foreground">Navigasi ke halaman manajemen</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { href: '/admin/registrations', label: 'Pendaftaran', desc: 'Review & setujui', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', count: pendingRegistrations || 0 },
                  { href: '/admin/payments', label: 'Pembayaran', desc: 'Verifikasi bukti', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', count: null },
                  { href: '/admin/content', label: 'Edit Konten', desc: 'Landing page', icon: LayoutTemplate, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', count: null },
                  { href: '/admin/tournaments/create', label: 'Buat Turnamen', desc: 'Tambah baru', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', count: null },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <a key={item.href} href={item.href}
                      className={`relative flex flex-col gap-2.5 p-3.5 rounded-xl border ${item.border} bg-gradient-to-br from-card to-muted/10 hover:shadow-md transition-all group`}>
                      <div className={`h-8 w-8 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      {(item.count ?? 0) > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-4 min-w-4 px-1 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.count}
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── TABLES ROW ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

            {/* Registrations Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Pendaftaran Terbaru</h2>
                    <p className="text-xs text-muted-foreground">Memerlukan persetujuan admin</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/admin/registrations">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tim / Turnamen</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center">Status</span>
                <span className="w-7" />
              </div>

              {recentRegistrations && recentRegistrations.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentRegistrations.map((reg: any) => {
                    const cfg = statusConfig[reg.status]
                    const StatusIcon = cfg?.icon
                    return (
                      <div key={reg.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{reg.teams?.name?.[0]?.toUpperCase() ?? '?'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{reg.teams?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{reg.tournaments?.game} • {reg.tournaments?.name}</p>
                          </div>
                        </div>
                        <div className="w-24 flex justify-center">
                          {cfg && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                          )}
                        </div>
                        <div className="w-7 flex justify-end">
                          <button className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Semua sudah diproses</p>
                  <p className="text-xs text-muted-foreground">Tidak ada pendaftaran yang menunggu</p>
                </div>
              )}

              {recentRegistrations && recentRegistrations.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{recentRegistrations.length} entri ditampilkan</p>
                  <Link href="/admin/registrations" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Lihat semua <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Tournaments Table */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Turnamen Terbaru</h2>
                    <p className="text-xs text-muted-foreground">Turnamen yang baru dibuat</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Link href="/admin/tournaments">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Turnamen</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center">Tanggal Mulai</span>
                <span className="w-7" />
              </div>

              {recentTournaments && recentTournaments.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentTournaments.map((tournament: any) => {
                    const statusColors: Record<string, string> = {
                      upcoming: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      ongoing:  'bg-blue-500/10 text-blue-600 border-blue-500/20',
                      completed:'bg-muted text-muted-foreground border-border',
                      cancelled:'bg-red-500/10 text-red-600 border-red-500/20',
                    }
                    const statusLabels: Record<string, string> = {
                      upcoming: 'Mendatang', ongoing: 'Berlangsung',
                      completed: 'Selesai', cancelled: 'Dibatalkan',
                    }
                    return (
                      <Link key={tournament.id} href={`/admin/tournaments/${tournament.id}`}
                        className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{tournament.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusColors[tournament.status] ?? 'bg-muted text-muted-foreground border-border'}`}>
                                {statusLabels[tournament.status] ?? tournament.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{tournament.game}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-24 flex justify-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(tournament.start_date), 'dd MMM yy', { locale: id })}
                          </span>
                        </div>
                        <div className="w-7 flex justify-end">
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-amber-500/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Belum ada turnamen</p>
                  <Button asChild size="sm" className="mt-2 h-8 text-xs gap-1.5">
                    <Link href="/admin/tournaments/create">
                      <Plus className="h-3.5 w-3.5" />
                      Buat Sekarang
                    </Link>
                  </Button>
                </div>
              )}

              {recentTournaments && recentTournaments.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{recentTournaments.length} entri ditampilkan</p>
                  <Link href="/admin/tournaments" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Lihat semua <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

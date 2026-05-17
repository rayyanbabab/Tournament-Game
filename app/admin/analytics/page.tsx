import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { BarChart2, Trophy, Users, TrendingUp, Calendar, Gamepad2 } from 'lucide-react'
import {
  RegistrationsPerMonthChart,
  GamePopularityChart,
  RegistrationStatusPieChart,
  TopTournamentsChart,
} from '@/components/admin/analytics-charts'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // --- Data fetching ---
  const { data: allRegistrations } = await supabase
    .from('tournament_registrations')
    .select('registered_at, status, tournament_id')
    .order('registered_at', { ascending: true })

  const { data: allTournaments } = await supabase
    .from('tournaments')
    .select('id, name, game, location, prize_pool, max_teams, registration_fee')

  // Registrations per month (last 12 months)
  const monthData: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    monthData[format(d, 'MMM yy', { locale: idLocale })] = 0
  }
  allRegistrations?.forEach(r => {
    const key = format(new Date(r.registered_at), 'MMM yy', { locale: idLocale })
    if (monthData[key] !== undefined) monthData[key]++
  })
  const monthChartData = Object.entries(monthData).map(([month, count]) => ({ month, count }))

  // Game popularity
  const gameCount: Record<string, number> = {}
  allTournaments?.forEach(t => { gameCount[t.game] = (gameCount[t.game] || 0) + 1 })
  const gameChartData = Object.entries(gameCount)
    .map(([game, count]) => ({ game, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Status distribution
  const pending  = allRegistrations?.filter(r => r.status === 'pending').length ?? 0
  const approved = allRegistrations?.filter(r => r.status === 'approved').length ?? 0
  const rejected = allRegistrations?.filter(r => r.status === 'rejected').length ?? 0
  const statusData = [
    { name: 'Disetujui', value: approved },
    { name: 'Menunggu',  value: pending },
    { name: 'Ditolak',   value: rejected },
  ].filter(d => d.value > 0)

  // Top tournaments by registration count
  const regByTournament: Record<string, number> = {}
  allRegistrations?.forEach(r => {
    regByTournament[r.tournament_id] = (regByTournament[r.tournament_id] || 0) + 1
  })
  const topTournaments = Object.entries(regByTournament)
    .map(([tid, count]) => {
      const t = allTournaments?.find(t => t.id === tid)
      return { name: t?.name?.slice(0, 20) ?? tid.slice(0, 8), registrations: count }
    })
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 6)

  // KPIs
  const totalTournaments = allTournaments?.length ?? 0
  const totalRegistrations = allRegistrations?.length ?? 0
  const approvalRate = totalRegistrations > 0 ? Math.round((approved / totalRegistrations) * 100) : 0
  const gamesCount = Object.keys(gameCount).length
  const thisMonthKey = format(new Date(), 'MMM yy', { locale: idLocale })
  const thisMonthRegs = monthData[thisMonthKey] ?? 0

  const kpis = [
    { label: 'Total Turnamen',    value: totalTournaments,    icon: Trophy,    color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
    { label: 'Total Pendaftaran', value: totalRegistrations,  icon: Users,     color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    { label: 'Tingkat Persetujuan',value: `${approvalRate}%`, icon: TrendingUp,color: 'text-emerald-500',bg: 'bg-emerald-500/10' },
    { label: 'Ragam Game',        value: gamesCount,          icon: Gamepad2,  color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Daftar Bulan Ini',  value: thisMonthRegs,       icon: Calendar,  color: 'text-primary',    bg: 'bg-primary/10'    },
    { label: 'Menunggu Approval', value: pending,             icon: BarChart2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Analytics</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Insight & statistik platform turnamen</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <RegistrationsPerMonthChart data={monthChartData} />
            <GamePopularityChart data={gameChartData} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <RegistrationStatusPieChart data={statusData} />
            <TopTournamentsChart data={topTournaments} />
          </div>

          {/* Tournament breakdown table */}
          {allTournaments && allTournaments.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <h2 className="text-sm font-semibold text-foreground">Detail Turnamen</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      {['Nama', 'Game', 'Lokasi', 'Max Tim', 'Biaya', 'Pendaftar'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {allTournaments.map(t => (
                      <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/tournaments/${t.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{t.name}</Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.game}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.location || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.max_teams}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.registration_fee || 'Gratis'}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-primary">{regByTournament[t.id] ?? 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

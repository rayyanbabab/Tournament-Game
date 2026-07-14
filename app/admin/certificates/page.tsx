import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Award, Trophy, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const metadata = {
  title: 'Kelola Sertifikat – Admin GameArena',
  description: 'Generate dan kelola sertifikat digital untuk turnamen',
}

export default async function AdminCertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all tournaments with registration counts and result counts
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      id, name, game, status, start_date, end_date, image_url,
      tournament_registrations!inner(id, status),
      tournament_results(id, rank)
    `)
    .order('start_date', { ascending: false })

  // Process data
  const processed = (tournaments ?? []).map(t => {
    const allRegs = (t.tournament_registrations as any[]) ?? []
    const approved = allRegs.filter(r => r.status === 'approved').length
    const results = (t.tournament_results as any[]) ?? []
    const hasWinners = results.some(r => r.rank > 0)

    return {
      ...t,
      approvedCount: approved,
      hasWinners,
      resultsCount: results.length,
    }
  })

  const statusConfig: Record<string, { label: string; color: string }> = {
    upcoming: { label: 'Buka', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    registration_closed: { label: 'Ditutup', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    ongoing: { label: 'Berlangsung', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    completed: { label: 'Selesai', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Sertifikat</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sertifikat Digital</h1>
              <p className="text-sm text-muted-foreground">Kelola pemenang dan generate e-sertifikat untuk setiap turnamen</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Turnamen',
                value: processed.length,
                icon: Trophy,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
              {
                label: 'Sudah Ada Pemenang',
                value: processed.filter(t => t.hasWinners).length,
                icon: Award,
                color: 'text-purple-500',
                bg: 'bg-purple-500/10 border-purple-500/20',
              },
              {
                label: 'Total Peserta Approved',
                value: processed.reduce((sum, t) => sum + t.approvedCount, 0),
                icon: Users,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tournament List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Pilih Turnamen untuk Kelola Sertifikat</h2>

            {processed.length > 0 ? (
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="divide-y divide-border/40">
                  {processed.map(t => {
                    const status = statusConfig[t.status] ?? statusConfig.upcoming
                    return (
                      <Link
                        key={t.id}
                        href={`/admin/certificates/${t.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {t.image_url ? (
                            <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <Trophy className="h-5 w-5 text-amber-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {t.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded">
                              {t.game}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(t.start_date), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center hidden sm:block">
                            <p className="text-sm font-bold text-foreground">{t.approvedCount}</p>
                            <p className="text-[10px] text-muted-foreground">Peserta</p>
                          </div>

                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>

                          {t.hasWinners ? (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 border-purple-500/20">
                              ✓ Pemenang
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-muted text-muted-foreground border-border">
                              Belum diset
                            </span>
                          )}

                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-card flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Award className="h-7 w-7 text-purple-500/40" />
                </div>
                <p className="text-sm text-muted-foreground">Belum ada turnamen. Buat turnamen terlebih dahulu.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

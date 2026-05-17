import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { MatchScheduleManager } from './match-schedule-manager'
import { ArrowLeft, ChevronRight, CalendarDays } from 'lucide-react'

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tournamentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('id', tournamentId)
    .single()
  if (!tournament) notFound()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, team1:team1_id(id, name), team2:team2_id(id, name), winner:winner_id(id, name)')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('match_number', { ascending: true })

  const totalMatches = matches?.length ?? 0
  const completedMatches = matches?.filter(m => m.status === 'completed' || m.status === 'bye').length ?? 0
  const scheduledMatches = matches?.filter(m => m.scheduled_at).length ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/tournaments" className="text-muted-foreground hover:text-foreground transition-colors">Turnamen</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <Link href={`/admin/tournaments/${tournamentId}`} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]">{tournament.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-foreground font-medium">Jadwal</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          <Link href={`/admin/tournaments/${tournamentId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Detail Turnamen
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-extrabold text-foreground">Jadwal & Hasil Pertandingan</h1>
              </div>
              <p className="text-sm text-muted-foreground">{tournament.name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Match', value: totalMatches },
              { label: 'Dijadwalkan', value: scheduledMatches },
              { label: 'Selesai', value: completedMatches },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Manager */}
          <MatchScheduleManager matches={matches ?? []} tournamentId={tournamentId} />
        </main>
      </div>
    </div>
  )
}

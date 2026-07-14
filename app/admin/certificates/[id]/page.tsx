import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Award, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CertificateManagerClient } from './certificate-manager-client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminCertificateDetailPage({ params }: Props) {
  const { id: tournamentId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name, game, start_date, end_date, prize_pool, certificate_template')
    .eq('id', tournamentId)
    .single()

  if (!tournament) notFound()

  // Fetch approved registrations with team names
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('id, team_id, teams(id, name)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')

  // Fetch existing results
  const { data: existingResults } = await supabase
    .from('tournament_results')
    .select('team_id, rank')
    .eq('tournament_id', tournamentId)
    .gt('rank', 0)

  // Build teams list with rank info
  const resultsMap: Record<string, number> = {}
  ;(existingResults ?? []).forEach(r => { resultsMap[r.team_id] = r.rank })

  const rankLabels: Record<number, string> = {
    1: 'Juara 1',
    2: 'Juara 2',
    3: 'Juara 3',
    0: 'Peserta',
  }

  const teams = (registrations ?? []).map((reg: any) => ({
    id: reg.teams.id as string,
    name: reg.teams.name as string,
    rank: resultsMap[reg.teams.id] ?? 0,
    rankLabel: rankLabels[resultsMap[reg.teams.id] ?? 0] ?? 'Peserta',
  }))

  const template = (tournament.certificate_template as any) ?? {}

  const tournamentInfo = {
    id: tournament.id,
    name: tournament.name,
    game: tournament.game,
    startDate: format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id }),
    endDate: format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: id }),
    prizePool: tournament.prize_pool,
    organizerName: template.organizer_name ?? 'GameArena',
    primaryColor: template.primary_color ?? '#7c3aed',
    secondaryColor: template.secondary_color ?? '#a855f7',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <Link href="/admin/certificates" className="text-muted-foreground hover:text-foreground transition-colors">
              Sertifikat
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{tournament.name}</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          {/* Back + Header */}
          <div className="flex items-start gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0 mt-0.5">
              <Link href="/admin/certificates">
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">{tournament.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {tournament.game} • {teams.length} peserta approved
                </p>
              </div>
            </div>
          </div>

          {/* Client Manager */}
          <CertificateManagerClient
            tournament={tournamentInfo}
            teams={teams}
            existingResults={existingResults ?? []}
          />
        </main>
      </div>
    </div>
  )
}

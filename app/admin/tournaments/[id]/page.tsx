import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Trophy, ArrowLeft, Calendar, Users, Clock, FileText,
  Gamepad2, Edit, MapPin, Banknote, Phone, Star, ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { RegistrationActions } from './registration-actions'
import { getTournamentStatus } from '@/lib/utils'
import { DeleteTournamentButton } from './delete-tournament-button'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tournamentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tournament, error } = await supabase
    .from('tournaments').select('*').eq('id', tournamentId).single()

  if (error || !tournament) notFound()

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, teams(id, name, team_members(count)), profiles:registered_by(full_name, email)')
    .eq('tournament_id', tournamentId)
    .order('registered_at', { ascending: false })

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    upcoming:             { label: 'Pendaftaran Buka',  color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',      dot: 'bg-blue-500' },
    registration_closed:  { label: 'Pendaftaran Tutup', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',    dot: 'bg-amber-500' },
    ongoing:              { label: 'Berlangsung',        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    completed:            { label: 'Selesai',            color: 'bg-muted text-muted-foreground border-border',         dot: 'bg-muted-foreground' },
    cancelled:            { label: 'Dibatalkan',         color: 'bg-red-500/10 text-red-600 border-red-500/20',         dot: 'bg-red-500' },
  }

  const regStatusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending:   { label: 'Menunggu',   bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-500/20' },
    approved:  { label: 'Disetujui',  bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    rejected:  { label: 'Ditolak',    bg: 'bg-red-500/10',     text: 'text-red-600',     border: 'border-red-500/20' },
    withdrawn: { label: 'Dibatalkan', bg: 'bg-muted/40',       text: 'text-muted-foreground', border: 'border-border/40' },
  }

  const approvedCount = registrations?.filter(r => r.status === 'approved').length || 0
  const pendingCount  = registrations?.filter(r => r.status === 'pending').length  || 0
  const currentStatus = getTournamentStatus(tournament)
  const statusCfg = statusConfig[currentStatus] ?? statusConfig.upcoming
  const fillPct = tournament.max_teams > 0 ? Math.round((approvedCount / tournament.max_teams) * 100) : 0

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/tournaments" className="text-muted-foreground hover:text-foreground transition-colors">Turnamen</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{tournament.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                <Edit className="h-3.5 w-3.5" />Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10">
              <Link href={`/admin/tournaments/${tournament.id}/bracket`}>
                <Trophy className="h-3.5 w-3.5" />Bracket
              </Link>
            </Button>
            <DeleteTournamentButton tournamentId={tournament.id} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* Back */}
          <Link href="/admin/tournaments"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Daftar Turnamen
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── MAIN CONTENT ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tournament Card */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {/* Cover Image */}
                {tournament.image_url && (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {tournament.game}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{tournament.name}</h1>
                  {tournament.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{tournament.description}</p>
                  )}

                  {/* Key stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    {[
                      { icon: Calendar, label: 'Mulai',     value: format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: id }) },
                      { icon: Clock,    label: 'Selesai',   value: format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: id }) },
                      { icon: Users,    label: 'Per Tim',   value: `${tournament.team_size} pemain` },
                      { icon: Trophy,   label: 'Prize',     value: tournament.prize_pool || '-' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center">
                        <Icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registrations */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Pendaftaran Tim</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">{approvedCount}</span> dari {tournament.max_teams} slot terisi
                      {pendingCount > 0 && <span className="text-amber-500"> · {pendingCount} menunggu</span>}
                    </p>
                  </div>
                  {/* Slot progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fillPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{fillPct}%</span>
                  </div>
                </div>

                {registrations && registrations.length > 0 ? (
                  <>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-6 py-2.5 bg-muted/20 border-b border-border/40">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tim</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center">Status</span>
                      <span className="w-28" />
                    </div>
                    <div className="divide-y divide-border/40">
                      {registrations.map((reg: any) => {
                        const rcfg = regStatusConfig[reg.status] ?? regStatusConfig.pending
                        return (
                          <div key={reg.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-6 py-3.5 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">{reg.teams?.name?.[0]?.toUpperCase() ?? '?'}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{reg.teams?.name}</p>
                                <p className="text-[10px] text-muted-foreground">{reg.teams?.team_members?.[0]?.count || 0} anggota · {format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}</p>
                              </div>
                            </div>
                            <div className="w-24 flex justify-center">
                              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${rcfg.bg} ${rcfg.text} ${rcfg.border}`}>
                                {rcfg.label}
                              </span>
                            </div>
                            <div className="w-28 flex justify-end">
                              {reg.status === 'pending' && <RegistrationActions registrationId={reg.id} />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="px-6 py-3 border-t border-border/40 bg-muted/10">
                      <p className="text-xs text-muted-foreground">{registrations.length} tim mendaftar</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Gamepad2 className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum ada pendaftaran</p>
                    <p className="text-xs text-muted-foreground">Bagikan turnamen ini kepada para gamer</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-4">
              {/* Info Card */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Info Turnamen</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Batas Pendaftaran', value: format(new Date(tournament.registration_deadline), 'dd MMM yyyy, HH:mm', { locale: id }), icon: Clock },
                    { label: 'Slot Tersisa',       value: `${tournament.max_teams - approvedCount} dari ${tournament.max_teams}`, icon: Users },
                    { label: 'Dibuat',             value: format(new Date(tournament.created_at), 'dd MMM yyyy', { locale: id }), icon: Calendar },
                    ...(tournament.location ? [{ label: 'Lokasi', value: tournament.location, icon: MapPin }] : []),
                    ...(tournament.registration_fee ? [{ label: 'Biaya Daftar', value: tournament.registration_fee, icon: Banknote }] : []),
                    ...(tournament.contact_info ? [{ label: 'Kontak', value: tournament.contact_info, icon: Phone }] : []),
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Rules */}
              {tournament.rules && (
                <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Peraturan
                  </h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{tournament.rules}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

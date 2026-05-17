import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, Clock, Calendar, Banknote, ClipboardList, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { RegistrationActions } from '../tournaments/[id]/registration-actions'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function AdminRegistrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(id, name, game, start_date), teams(id, name, team_members(count)), profiles:registered_by(full_name, email)')
    .order('registered_at', { ascending: false })

  const pendingRegistrations = registrations?.filter(r => r.status === 'pending') || []
  const otherRegistrations   = registrations?.filter(r => r.status !== 'pending') || []

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending:   { label: 'Menunggu',   color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',     icon: Clock },
    approved:  { label: 'Disetujui',  color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
    rejected:  { label: 'Ditolak',    color: 'bg-red-500/10 text-red-600 border-red-500/20',            icon: XCircle },
    withdrawn: { label: 'Dibatalkan', color: 'bg-muted text-muted-foreground border-border',            icon: XCircle },
  }

  const RegistrationRow = ({ reg, showActions }: { reg: any; showActions?: boolean }) => {
    const config = statusConfig[reg.status] ?? statusConfig.pending
    const StatusIcon = config.icon
    return (
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors">
        {/* Team + Tournament */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{reg.teams?.name?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{reg.teams?.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded">
                {reg.tournaments?.game}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{reg.tournaments?.name}</span>
            </div>
            {reg.payment_proof_url && (
              <a href={reg.payment_proof_url} target="_blank" rel="noreferrer"
                className="text-[10px] text-primary hover:underline mt-1 inline-flex items-center gap-1">
                <Banknote className="h-3 w-3" />Bukti Bayar
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Registrant + Date */}
        <div className="w-36 hidden md:flex flex-col gap-0.5">
          <p className="text-xs font-medium text-foreground truncate">{reg.profiles?.full_name || reg.profiles?.email}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}
          </p>
        </div>

        {/* Members */}
        <div className="w-20 flex justify-center">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {reg.teams?.team_members?.[0]?.count || 0}
          </span>
        </div>

        {/* Actions or Status */}
        <div className="w-36 flex items-center justify-end">
          {showActions ? (
            <RegistrationActions registrationId={reg.id} />
          ) : (
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Kelola Pendaftaran</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Kelola Pendaftaran</h1>
              <p className="text-sm text-muted-foreground">
                {pendingRegistrations.length > 0
                  ? <><span className="text-amber-500 font-semibold">{pendingRegistrations.length} menunggu</span> persetujuan admin</>
                  : 'Semua pendaftaran sudah diproses'}
              </p>
            </div>
          </div>

          {/* ── PENDING SECTION ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Menunggu Persetujuan</h2>
              {pendingRegistrations.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {pendingRegistrations.length}
                </span>
              )}
            </div>

            {pendingRegistrations.length > 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.02] overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-amber-500/20 bg-amber-500/5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tim / Turnamen</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-36 hidden md:block">Pendaftar</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 text-center">Anggota</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-36 text-right">Aksi</span>
                </div>
                <div className="divide-y divide-border/40">
                  {pendingRegistrations.map((reg: any) => (
                    <RegistrationRow key={reg.id} reg={reg} showActions />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-12 text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500/60" />
                </div>
                <p className="text-sm font-medium text-foreground">Semua sudah diproses!</p>
                <p className="text-xs text-muted-foreground">Tidak ada pendaftaran yang menunggu review</p>
              </div>
            )}
          </div>

          {/* ── HISTORY SECTION ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Riwayat Pendaftaran</h2>
              {otherRegistrations.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {otherRegistrations.length}
                </span>
              )}
            </div>

            {otherRegistrations.length > 0 ? (
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-border/40 bg-muted/20">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tim / Turnamen</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-36 hidden md:block">Pendaftar</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 text-center">Anggota</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-36 text-right">Status</span>
                </div>
                <div className="divide-y divide-border/40">
                  {otherRegistrations.map((reg: any) => (
                    <RegistrationRow key={reg.id} reg={reg} />
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground">{otherRegistrations.length} riwayat pendaftaran</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-12 text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">Belum ada riwayat pendaftaran</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

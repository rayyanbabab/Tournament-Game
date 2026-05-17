import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Banknote,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  FileImage,
  Users,
  Trophy,
  ClipboardList,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { RegistrationActions } from '../tournaments/[id]/registration-actions'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(id, name, game, registration_fee), teams(id, name, logo_url), profiles:registered_by(full_name, email)')
    .order('registered_at', { ascending: false })

  const withPayment = registrations?.filter(r => r.payment_proof_url) || []
  const withoutPayment = registrations?.filter(r => !r.payment_proof_url) || []
  const pendingWithPayment = withPayment.filter(r => r.status === 'pending')

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    withdrawn: { label: 'Dibatalkan', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
  }

  const PaymentRow = ({ reg, showActions }: { reg: any; showActions?: boolean }) => {
    const config = statusConfig[reg.status]
    const StatusIcon = config.icon
    return (
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors">
        {/* Logo */}
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/60">
          {reg.teams?.logo_url ? (
            <img src={reg.teams.logo_url} alt={reg.teams.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-muted-foreground">{reg.teams?.name?.[0]?.toUpperCase()}</span>
          )}
        </div>

        {/* Team + Tournament */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{reg.teams?.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              {reg.tournaments?.name}
            </span>
            {reg.tournaments?.registration_fee && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-emerald-600 border-emerald-500/30">
                {reg.tournaments.registration_fee}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{reg.profiles?.full_name || reg.profiles?.email} · {format(new Date(reg.registered_at), 'dd MMM yyyy HH:mm', { locale: id })}</p>
        </div>

        {/* Payment Proof */}
        <div className="w-28 flex justify-center">
          {reg.payment_proof_url ? (
            <a
              href={reg.payment_proof_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <FileImage className="h-3.5 w-3.5" />
              Lihat Bukti
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic">Tidak ada</span>
          )}
        </div>

        {/* Status */}
        <div className="w-28 flex justify-center">
          <Badge variant="outline" className={`text-[11px] font-medium ${config.color} flex items-center gap-1.5`}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Actions */}
        <div className="w-28 flex items-center justify-end">
          {showActions ? (
            <RegistrationActions registrationId={reg.id} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Kelola Pembayaran</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Kelola Pembayaran</h1>
              <p className="text-sm text-muted-foreground">Verifikasi bukti pembayaran dan setujui pendaftaran tim</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Pendaftaran', value: registrations?.length || 0, accent: 'border-l-foreground/30',   valColor: 'text-foreground' },
              { label: 'Ada Bukti Bayar',   value: withPayment.length,          accent: 'border-l-primary',         valColor: 'text-primary' },
              { label: 'Perlu Diverifikasi', value: pendingWithPayment.length,   accent: 'border-l-amber-500',       valColor: 'text-amber-500' },
              { label: 'Tanpa Bukti',        value: withoutPayment.length,       accent: 'border-l-muted-foreground', valColor: 'text-muted-foreground' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border border-border/60 border-l-2 ${s.accent} bg-card p-4`}>
                <p className={`text-3xl font-extrabold tabular-nums ${s.valColor}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending with payment proof */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Menunggu Verifikasi</h2>
              {pendingWithPayment.length > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 border text-[10px]">
                  {pendingWithPayment.length} perlu diproses
                </Badge>
              )}
            </div>

            {pendingWithPayment.length > 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-amber-500/10 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="w-9"></div>
                  <span>Tim / Turnamen</span>
                  <span className="w-28 text-center">Bukti Bayar</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-28 text-right">Aksi</span>
                </div>
                <div className="divide-y divide-border/40">
                  {pendingWithPayment.map((reg: any) => (
                    <PaymentRow key={reg.id} reg={reg} showActions />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Semua pembayaran sudah diverifikasi</p>
              </div>
            )}
          </div>

          {/* All with payment proofs */}
          {withPayment.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Semua yang Sudah Upload Bukti ({withPayment.length})</h2>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border/60 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="w-9"></div>
                  <span>Tim / Turnamen</span>
                  <span className="w-28 text-center">Bukti Bayar</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-28 text-right">Aksi</span>
                </div>
                <div className="divide-y divide-border/40">
                  {withPayment.map((reg: any) => (
                    <PaymentRow key={reg.id} reg={reg} showActions={reg.status === 'pending'} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Without payment proof */}
          {withoutPayment.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Tanpa Bukti Pembayaran ({withoutPayment.length})</h2>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden opacity-70">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border/60 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="w-9"></div>
                  <span>Tim / Turnamen</span>
                  <span className="w-28 text-center">Bukti Bayar</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-28 text-right">Aksi</span>
                </div>
                <div className="divide-y divide-border/40">
                  {withoutPayment.map((reg: any) => (
                    <PaymentRow key={reg.id} reg={reg} showActions={reg.status === 'pending'} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Gamepad2, CheckCircle, XCircle, Clock, Crown, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminPageHeader } from '@/components/admin/page-header'
import { RegistrationActions } from '../tournaments/[id]/registration-actions'

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
  const otherRegistrations = registrations?.filter(r => r.status !== 'pending') || []

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    withdrawn: { label: 'Dibatalkan', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
  }

  const RegistrationRow = ({ reg, showActions }: { reg: any; showActions?: boolean }) => {
    const config = statusConfig[reg.status]
    const StatusIcon = config.icon
    return (
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors">
        {/* Team + Tournament */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{reg.teams?.name?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{reg.teams?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{reg.tournaments?.game}</Badge>
              <span className="text-xs text-muted-foreground truncate">{reg.tournaments?.name}</span>
            </div>
          </div>
        </div>

        {/* Registrant */}
        <div className="w-36 hidden md:flex flex-col">
          <p className="text-xs font-medium text-foreground truncate">{reg.profiles?.full_name || reg.profiles?.email}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
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

        {/* Status / Actions */}
        <div className="w-36 flex items-center justify-end gap-2">
          {showActions ? (
            <RegistrationActions registrationId={reg.id} />
          ) : (
            <Badge variant="outline" className={`text-[11px] font-medium ${config.color} flex items-center gap-1.5`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium text-foreground">Kelola Pendaftaran</span>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <AdminPageHeader
            title="Kelola Pendaftaran"
            description="Setujui atau tolak pendaftaran tim ke turnamen"
            breadcrumbs={[{ label: 'Pendaftaran' }]}
          />

          {/* Pending Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Menunggu Persetujuan</h2>
              {pendingRegistrations.length > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-medium border">
                  {pendingRegistrations.length} pending
                </Badge>
              )}
            </div>

            {pendingRegistrations.length > 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-amber-500/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Tim / Turnamen</span>
                  <span className="w-36 hidden md:block">Pendaftar</span>
                  <span className="w-20 text-center">Anggota</span>
                  <span className="w-36 text-right">Aksi</span>
                </div>
                <div className="divide-y divide-border/60">
                  {pendingRegistrations.map((reg: any) => (
                    <RegistrationRow key={reg.id} reg={reg} showActions />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Semua sudah diproses</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Tidak ada pendaftaran yang menunggu</p>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Riwayat Pendaftaran</h2>

            {otherRegistrations.length > 0 ? (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Tim / Turnamen</span>
                  <span className="w-36 hidden md:block">Pendaftar</span>
                  <span className="w-20 text-center">Anggota</span>
                  <span className="w-36 text-right">Status</span>
                </div>
                <div className="divide-y divide-border/60 bg-background">
                  {otherRegistrations.map((reg: any) => (
                    <RegistrationRow key={reg.id} reg={reg} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 flex flex-col items-center justify-center py-12 text-center">
                <Gamepad2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Belum ada riwayat pendaftaran</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

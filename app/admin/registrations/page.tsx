import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Gamepad2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { RegistrationActions } from '../tournaments/[id]/registration-actions'

export default async function AdminRegistrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      tournaments(id, name, game, start_date),
      teams(id, name, team_members(count)),
      profiles:registered_by(full_name, email)
    `)
    .order('registered_at', { ascending: false })

  const pendingRegistrations = registrations?.filter(r => r.status === 'pending') || []
  const otherRegistrations = registrations?.filter(r => r.status !== 'pending') || []

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    withdrawn: 'bg-muted text-muted-foreground border-border',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    withdrawn: 'Dibatalkan',
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Pendaftaran</h1>
          <p className="text-muted-foreground">Setujui atau tolak pendaftaran tim ke turnamen</p>
        </div>

        {/* Pending Registrations */}
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Menunggu Persetujuan
              {pendingRegistrations.length > 0 && (
                <Badge variant="secondary">{pendingRegistrations.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Pendaftaran yang memerlukan tindakan</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length > 0 ? (
              <div className="space-y-3">
                {pendingRegistrations.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{reg.teams?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{reg.tournaments?.game}</Badge>
                          <span>{reg.tournaments?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{reg.teams?.team_members?.[0]?.count || 0} anggota</span>
                          <span>•</span>
                          <span>Oleh: {reg.profiles?.full_name || reg.profiles?.email}</span>
                          <span>•</span>
                          <span>{format(new Date(reg.registered_at), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                        </div>
                      </div>
                    </div>
                    <RegistrationActions registrationId={reg.id} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada pendaftaran yang menunggu</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Registrations */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Semua Pendaftaran</CardTitle>
            <CardDescription>Riwayat semua pendaftaran turnamen</CardDescription>
          </CardHeader>
          <CardContent>
            {otherRegistrations.length > 0 ? (
              <div className="space-y-3">
                {otherRegistrations.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-lg">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{reg.teams?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{reg.tournaments?.game}</Badge>
                          <span>{reg.tournaments?.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(reg.registered_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[reg.status]}>
                      {statusLabels[reg.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada riwayat pendaftaran</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

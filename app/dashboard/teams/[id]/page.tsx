import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Crown, User, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AddMemberDialog } from './add-member-dialog'
import { RemoveMemberButton } from './remove-member-button'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(id, full_name, email)
    `)
    .eq('id', teamId)
    .single()

  if (error || !team) {
    notFound()
  }

  const { data: members } = await supabase
    .from('team_members')
    .select(`
      *,
      profiles(id, full_name, email)
    `)
    .eq('team_id', teamId)
    .order('role', { ascending: false })

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some(m => m.user_id === user.id)

  if (!isCaptain && !isMember) {
    redirect('/dashboard')
  }

  // Get team's tournament registrations
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      tournaments(name, game, start_date, status)
    `)
    .eq('team_id', teamId)
    .order('registered_at', { ascending: false })

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{team.name}</CardTitle>
                        <CardDescription>
                          Dibuat {format(new Date(team.created_at), 'dd MMMM yyyy', { locale: id })}
                        </CardDescription>
                      </div>
                    </div>
                    {isCaptain && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Kapten
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Members */}
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Anggota Tim</CardTitle>
                    <CardDescription>{members?.length || 0} anggota</CardDescription>
                  </div>
                  {isCaptain && <AddMemberDialog teamId={teamId} />}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-lg">
                            {member.role === 'captain' ? (
                              <Crown className="h-5 w-5 text-primary" />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {member.in_game_name || member.profiles?.full_name || member.profiles?.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.in_game_id ? `ID: ${member.in_game_id}` : member.profiles?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'captain' ? 'default' : 'secondary'}>
                            {member.role === 'captain' ? 'Kapten' : 'Anggota'}
                          </Badge>
                          {isCaptain && member.role !== 'captain' && (
                            <RemoveMemberButton memberId={member.id} memberName={member.profiles?.full_name} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tournament Registrations */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Pendaftaran Turnamen</CardTitle>
                  <CardDescription>Turnamen yang diikuti tim ini</CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations && registrations.length > 0 ? (
                    <div className="space-y-3">
                      {registrations.map((reg: any) => (
                        <div
                          key={reg.id}
                          className="p-3 bg-secondary/50 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{reg.tournaments?.game}</Badge>
                            <Badge className={statusColors[reg.status]}>
                              {statusLabels[reg.status]}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {reg.tournaments?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reg.tournaments?.start_date), 'dd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">Belum ada pendaftaran</p>
                      <Button asChild size="sm" className="mt-3">
                        <Link href="/tournaments">Cari Turnamen</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

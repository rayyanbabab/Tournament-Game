import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Crown, User, Trophy, Calendar, Mail, Phone, Info } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AddMemberDialog } from './add-member-dialog'
import { RemoveMemberButton } from './remove-member-button'
import { UserSidebar } from '@/components/user/sidebar'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, captain:profiles!teams_captain_id_fkey(id, full_name, email)')
    .eq('id', teamId)
    .single()

  if (error || !team) notFound()

  const { data: members } = await supabase
    .from('team_members')
    .select('*, profiles(id, full_name, email)')
    .eq('team_id', teamId)
    .order('role', { ascending: false })

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some(m => m.user_id === user.id)

  if (!isCaptain && !isMember) redirect('/dashboard')

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(name, game, start_date, status)')
    .eq('team_id', teamId)
    .order('registered_at', { ascending: false })

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    approved: { label: 'Disetujui', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    rejected: { label: 'Ditolak', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    withdrawn: { label: 'Dibatalkan', color: 'bg-muted text-muted-foreground border-border' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground -ml-1">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-6">
          {/* Team Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-border/60">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 shrink-0 overflow-hidden">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">{team.name[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{team.name}</h1>
                  {isCaptain && (
                    <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20" variant="outline">
                      <Crown className="h-3.5 w-3.5" />
                      Kapten
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Dibuat {format(new Date(team.created_at), 'dd MMM yyyy', { locale: id })}
                  <span className="text-border/60">•</span>
                  <Users className="h-3.5 w-3.5" />
                  {members?.length || 0} anggota
                </p>
                
                {(team.contact_email || team.whatsapp_number) && (
                  <div className="flex items-center gap-4 mt-3">
                    {team.contact_email && (
                      <a href={`mailto:${team.contact_email}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-2.5 py-1.5 rounded-md">
                        <Mail className="h-3.5 w-3.5" />
                        {team.contact_email}
                      </a>
                    )}
                    {team.whatsapp_number && (
                      <a href={`https://wa.me/${team.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-colors bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1.5 rounded-md">
                        <Phone className="h-3.5 w-3.5" />
                        {team.whatsapp_number}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {team.description && (
                <Card className="border-border/60 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Tentang Tim
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {team.description}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold">Anggota Tim</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{members?.length || 0} anggota terdaftar</CardDescription>
                  </div>
                  {isCaptain && <AddMemberDialog teamId={teamId} />}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60">
                    {members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                            member.role === 'captain' ? 'bg-amber-500/10' : 'bg-muted'
                          }`}>
                            {member.role === 'captain' ? (
                              <Crown className="h-4.5 w-4.5 text-amber-500" style={{ width: '1.125rem', height: '1.125rem' }} />
                            ) : (
                              <User className="h-4.5 w-4.5 text-muted-foreground" style={{ width: '1.125rem', height: '1.125rem' }} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {member.in_game_name || member.profiles?.full_name || member.profiles?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.in_game_id ? `Game ID: ${member.in_game_id}` : member.profiles?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={member.role === 'captain'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px]'
                              : 'text-[11px]'
                            }
                          >
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

            {/* Sidebar - Tournament Registrations */}
            <div>
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Turnamen Diikuti</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Pendaftaran turnamen tim ini</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {registrations && registrations.length > 0 ? (
                    <div className="divide-y divide-border/60">
                      {registrations.map((reg: any) => {
                        const config = statusConfig[reg.status]
                        return (
                          <div key={reg.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{reg.tournaments?.game}</Badge>
                              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${config.color}`}>{config.label}</Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground line-clamp-1">{reg.tournaments?.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(reg.tournaments?.start_date), 'dd MMM yyyy', { locale: id })}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                      <Trophy className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-xs text-muted-foreground mb-3">Belum ada pendaftaran turnamen</p>
                      <Button asChild size="sm" className="h-7 text-xs">
                        <Link href="/tournaments">Cari Turnamen</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

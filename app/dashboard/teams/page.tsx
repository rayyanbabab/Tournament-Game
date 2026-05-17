import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, Crown, ChevronRight, Gamepad2 } from 'lucide-react'
import { UserSidebar } from '@/components/user/sidebar'

export default async function DashboardTeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Tim dimana user sebagai kapten
  const { data: myTeams } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .eq('captain_id', user.id)
    .order('created_at', { ascending: false })

  // Tim dimana user hanya sebagai anggota (bukan kapten)
  const { data: memberTeams } = await supabase
    .from('team_members')
    .select('*, teams(*, team_members(count))')
    .eq('user_id', user.id)
    .neq('role', 'captain')
    .order('joined_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Tim Saya</span>
            </nav>
          </div>
          <Button asChild size="sm" className="h-9 gap-2 shadow-sm">
            <Link href="/dashboard/teams/create">
              <Plus className="h-4 w-4" />
              Buat Tim
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Tim yang Anda Kelola</h1>
            <p className="text-sm text-muted-foreground mb-6">Tim di mana Anda menjabat sebagai kapten</p>

            {myTeams && myTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myTeams.map((team: any) => (
                  <Link href={`/dashboard/teams/${team.id}`} key={team.id}>
                    <Card className="border-border/60 hover:border-primary/50 hover:shadow-md transition-all group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden transition-colors border border-border/50 group-hover:border-primary/50">
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-primary transition-colors">
                                {team.name[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                            <Crown className="h-3.5 w-3.5" />
                            Kapten
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{team.team_members?.[0]?.count || 0} Anggota</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-border/60 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Belum Punya Tim</h3>
                  <p className="text-sm text-muted-foreground mb-6">Buat tim sekarang dan ajak teman-teman Anda bergabung!</p>
                  <Button asChild>
                    <Link href="/dashboard/teams/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Tim Baru
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">Tim yang Anda Ikuti</h2>
            <p className="text-sm text-muted-foreground mb-6">Tim di mana Anda bergabung sebagai anggota</p>

            {memberTeams && memberTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {memberTeams.map((member: any) => (
                  <Link href={`/dashboard/teams/${member.teams.id}`} key={member.id}>
                    <Card className="border-border/60 hover:border-border hover:shadow-md transition-all group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden transition-colors border border-border/50 group-hover:border-border">
                            {member.teams.logo_url ? (
                              <img src={member.teams.logo_url} alt={member.teams.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-muted-foreground">
                                {member.teams.name[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            Anggota
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-foreground transition-colors truncate">
                          {member.teams.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{member.teams.team_members?.[0]?.count || 0} Anggota</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-border/60 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Gamepad2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">Belum Bergabung dengan Tim</p>
                  <p className="text-xs text-muted-foreground mt-1">Anda dapat diundang oleh kapten tim untuk bergabung.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Crown, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function AdminTeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: teams } = await supabase
    .from('teams')
    .select('*, captain:profiles!teams_captain_id_fkey(full_name, email), team_members(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium text-foreground">Daftar Tim</span>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-4">
          <AdminPageHeader
            title="Daftar Tim"
            description="Semua tim yang terdaftar di platform GameArena"
            breadcrumbs={[{ label: 'Tim' }]}
          />

          {teams && teams.length > 0 ? (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground items-center">
                <span className="w-10">#</span>
                <span>Tim</span>
                <span className="w-40 hidden md:block">Kapten</span>
                <span className="w-20 text-center">Anggota</span>
                <span className="w-28 text-center">Dibuat</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/60 bg-background">
                {teams.map((team: any, index: number) => (
                  <div
                    key={team.id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors"
                  >
                    {/* Index */}
                    <div className="w-10 text-sm text-muted-foreground tabular-nums font-mono">{String(index + 1).padStart(2, '0')}</div>

                    {/* Team */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{team.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
                        {team.contact_email && (
                          <p className="text-xs text-muted-foreground truncate">{team.contact_email}</p>
                        )}
                      </div>
                    </div>

                    {/* Captain */}
                    <div className="w-40 hidden md:flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {team.captain?.full_name || team.captain?.email || '-'}
                      </span>
                    </div>

                    {/* Members */}
                    <div className="w-20 flex justify-center items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm tabular-nums">{team.team_members?.[0]?.count || 0}</span>
                    </div>

                    {/* Created */}
                    <div className="w-28 flex justify-center">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(team.created_at), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Tim</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Tim akan muncul di sini setelah pengguna mendaftar dan membuat tim mereka.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

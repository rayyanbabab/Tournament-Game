import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Crown } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function TeamsPage() {
  const supabase = await createClient()
  
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(full_name, email),
      team_members(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Daftar Tim</h1>
            <p className="text-muted-foreground">Tim-tim yang terdaftar di GameArena</p>
          </div>

          {teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team: any) => (
                <Card key={team.id} className="border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>
                          {team.team_members?.[0]?.count || 0} anggota
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-muted-foreground">Kapten:</span>
                        <span className="font-medium text-foreground">
                          {team.captain?.full_name || team.captain?.email || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bergabung: {format(new Date(team.created_at), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Tim</h3>
                <p className="text-muted-foreground">
                  Belum ada tim yang terdaftar. Jadilah yang pertama!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

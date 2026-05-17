import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Users } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  
  // Get teams with most approved tournament registrations
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(full_name),
      tournament_registrations!inner(status)
    `)
    .eq('tournament_registrations.status', 'approved')

  // Count tournaments per team
  const teamStats = teams?.reduce((acc: any, team: any) => {
    const existing = acc.find((t: any) => t.id === team.id)
    if (existing) {
      existing.tournaments += 1
    } else {
      acc.push({
        id: team.id,
        name: team.name,
        captain: team.captain?.full_name || 'Unknown',
        tournaments: 1,
      })
    }
    return acc
  }, []) || []

  // Sort by tournaments count
  teamStats.sort((a: any, b: any) => b.tournaments - a.tournaments)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 1:
        return 'bg-gray-500/10 border-gray-500/20'
      case 2:
        return 'bg-amber-500/10 border-amber-500/20'
      default:
        return 'bg-secondary/50'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Tim dengan partisipasi turnamen terbanyak</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {teamStats.length > 0 ? (
              <div className="space-y-3">
                {teamStats.slice(0, 20).map((team: any, index: number) => (
                  <Card
                    key={team.id}
                    className={`border ${getRankBg(index)} transition-all hover:shadow-md`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(index)}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{team.name}</p>
                          <p className="text-sm text-muted-foreground">Kapten: {team.captain}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-sm">
                            {team.tournaments} Turnamen
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-16 text-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Data</h3>
                  <p className="text-muted-foreground">
                    Leaderboard akan diperbarui setelah tim berpartisipasi dalam turnamen
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

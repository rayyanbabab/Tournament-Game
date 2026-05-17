import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Medal, Award, Users, Crown, ExternalLink } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select(`*, captain:profiles!teams_captain_id_fkey(id, full_name, email), tournament_registrations!inner(status)`)
    .eq('tournament_registrations.status', 'approved')

  const teamStats = teams?.reduce((acc: any, team: any) => {
    const existing = acc.find((t: any) => t.id === team.id)
    if (existing) {
      existing.tournaments += 1
    } else {
      acc.push({
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        captainId: team.captain?.id,
        captain: team.captain?.full_name || team.captain?.email || 'Unknown',
        tournaments: 1,
      })
    }
    return acc
  }, []) || []

  teamStats.sort((a: any, b: any) => b.tournaments - a.tournaments)

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-base font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
  }

  const getRankStyle = (index: number) => {
    if (index === 0) return 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
    if (index === 1) return 'border-gray-400/30 bg-gray-500/5 hover:bg-gray-500/10'
    if (index === 2) return 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
    return 'border-border/60 bg-card hover:bg-muted/30'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Trophy className="h-7 w-7 text-amber-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Tim dengan partisipasi turnamen terbanyak</p>
          </div>

          {teamStats.length > 0 ? (
            <div className="space-y-2">
              {teamStats.slice(0, 20).map((team: any, index: number) => (
                <div key={team.id} className={`rounded-xl border transition-all ${getRankStyle(index)}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex items-center justify-center w-8 shrink-0">
                      {getRankIcon(index)}
                    </div>
                    {/* Team avatar */}
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {team.logo_url
                        ? <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                        : <span className="text-sm font-extrabold text-primary">{team.name[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/teams/${team.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                        {team.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="h-3 w-3 text-amber-500" />
                        <Link href={team.captainId ? `/players/${team.captainId}` : '#'}
                          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                          {team.captain}
                        </Link>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Trophy className="h-3.5 w-3.5" />
                        {team.tournaments}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">turnamen</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-16 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Data</h3>
              <p className="text-muted-foreground text-sm">
                Leaderboard akan diperbarui setelah tim berpartisipasi dalam turnamen
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

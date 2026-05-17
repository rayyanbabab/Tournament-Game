import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Shuffle, Trophy, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminBracketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Get all tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, game, status, max_teams')
    .order('created_at', { ascending: false })

  // Get match counts per tournament
  const { data: matchCounts } = await supabase
    .from('matches')
    .select('tournament_id, status')

  const bracketMap: Record<string, { total: number; completed: number }> = {}
  matchCounts?.forEach((m: any) => {
    if (!bracketMap[m.tournament_id]) bracketMap[m.tournament_id] = { total: 0, completed: 0 }
    if (m.status !== 'bye') bracketMap[m.tournament_id].total++
    if (m.status === 'completed') bracketMap[m.tournament_id].completed++
  })

  // Get approved team counts per tournament
  const { data: approvedRegs } = await supabase
    .from('tournament_registrations')
    .select('tournament_id')
    .eq('status', 'approved')

  const approvedMap: Record<string, number> = {}
  approvedRegs?.forEach((r: any) => {
    approvedMap[r.tournament_id] = (approvedMap[r.tournament_id] || 0) + 1
  })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Bracket Manager</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shuffle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Bracket Manager</h1>
              <p className="text-sm text-muted-foreground">Kelola bracket single elimination untuk setiap turnamen</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Semua Turnamen</h2>
              <span className="ml-auto text-xs text-muted-foreground">{tournaments?.length || 0} turnamen</span>
            </div>

            {tournaments && tournaments.length > 0 ? (
              <div className="divide-y divide-border/40">
                {tournaments.map((t: any) => {
                  const bracket = bracketMap[t.id]
                  const approved = approvedMap[t.id] || 0
                  const hasBracket = !!bracket
                  const pct = bracket && bracket.total > 0
                    ? Math.round((bracket.completed / bracket.total) * 100) : 0

                  return (
                    <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="h-5 w-5 text-amber-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t.game}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{approved} tim disetujui</span>
                          {hasBracket ? (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-xs text-muted-foreground">{bracket.completed}/{bracket.total} match selesai</span>
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-emerald-600">{pct}%</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0">
                        {hasBracket ? (
                          bracket.completed === bracket.total && bracket.total > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle className="h-3 w-3" />Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              <Clock className="h-3 w-3" />Berlangsung
                            </span>
                          )
                        ) : approved >= 2 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <AlertCircle className="h-3 w-3" />Belum Generate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                            <AlertCircle className="h-3 w-3" />Tim Kurang
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <Link href={`/admin/tournaments/${t.id}/bracket`}>
                          <Shuffle className="h-3.5 w-3.5" />
                          {hasBracket ? 'Kelola' : 'Generate'}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <Trophy className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Belum ada turnamen</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

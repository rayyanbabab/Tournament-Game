import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Award, Download, Trophy } from 'lucide-react'
import Link from 'next/link'
import { CertificateClientPage } from './certificate-client-page'

export const metadata = {
  title: 'Sertifikat Saya – GameArena',
  description: 'Unduh sertifikat digital untuk setiap turnamen yang kamu ikuti',
}

export default async function MyCertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Get all approved registrations for this user (as captain)
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      id, status, registered_at,
      tournament_id,
      tournaments(id, name, game, start_date, end_date, prize_pool, certificate_template),
      teams!inner(id, name, captain_id)
    `)
    .eq('status', 'approved')
    .order('registered_at', { ascending: false })

  // Filter only teams where the user is captain or member
  // Also check team_members
  const { data: memberOf } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)

  const memberTeamIds = new Set((memberOf ?? []).map(m => m.team_id))

  const myRegistrations = (registrations ?? []).filter((reg: any) =>
    reg.teams.captain_id === user.id || memberTeamIds.has(reg.teams.id)
  )

  // Get results for these tournaments
  const tournamentIds = [...new Set(myRegistrations.map((r: any) => r.tournament_id))]
  const teamIds = myRegistrations.map((r: any) => r.teams.id)

  const { data: results } = await supabase
    .from('tournament_results')
    .select('tournament_id, team_id, rank')
    .in('tournament_id', tournamentIds.length > 0 ? tournamentIds : ['none'])
    .in('team_id', teamIds.length > 0 ? teamIds : ['none'])

  const resultsMap: Record<string, Record<string, number>> = {}
  ;(results ?? []).forEach(r => {
    if (!resultsMap[r.tournament_id]) resultsMap[r.tournament_id] = {}
    resultsMap[r.tournament_id][r.team_id] = r.rank
  })

  // ── Also detect winners from bracket (Grand Final = last round match) ──────
  // Fetch the highest-round completed match per tournament from the matches table
  if (tournamentIds.length > 0) {
    const { data: bracketMatches } = await supabase
      .from('matches')
      .select('tournament_id, round, winner_id, team1_id, team2_id, status')
      .in('tournament_id', tournamentIds)
      .eq('status', 'completed')
      .order('round', { ascending: false })

    if (bracketMatches && bracketMatches.length > 0) {
      // Find the final round (max round) per tournament
      const finalRoundMap: Record<string, number> = {}
      bracketMatches.forEach((m: any) => {
        if (!finalRoundMap[m.tournament_id] || m.round > finalRoundMap[m.tournament_id]) {
          finalRoundMap[m.tournament_id] = m.round
        }
      })

      // For each tournament, get the Grand Final match and map results
      bracketMatches.forEach((m: any) => {
        if (m.round !== finalRoundMap[m.tournament_id]) return
        if (!resultsMap[m.tournament_id]) resultsMap[m.tournament_id] = {}
        // Winner = rank 1, loser = rank 2
        if (m.winner_id) {
          if (!resultsMap[m.tournament_id][m.winner_id]) {
            resultsMap[m.tournament_id][m.winner_id] = 1
          }
          const loserId = m.team1_id === m.winner_id ? m.team2_id : m.team1_id
          if (loserId && !resultsMap[m.tournament_id][loserId]) {
            resultsMap[m.tournament_id][loserId] = 2
          }
        }
      })

      // Also set rank 3 for semi-final losers (both semi final matches)
      const semiFinalRound = (finalRoundMap[Object.keys(finalRoundMap)[0]] ?? 0) - 1
      if (semiFinalRound > 0) {
        bracketMatches.forEach((m: any) => {
          if (m.round !== semiFinalRound) return
          const loserId = m.team1_id === m.winner_id ? m.team2_id : m.team1_id
          if (loserId && !resultsMap[m.tournament_id]?.[loserId]) {
            if (!resultsMap[m.tournament_id]) resultsMap[m.tournament_id] = {}
            resultsMap[m.tournament_id][loserId] = 3
          }
        })
      }
    }
  }

  const rankLabels: Record<number, string> = {
    1: 'Juara 1 🏆',
    2: 'Juara 2 🥈',
    3: 'Juara 3 🥉',
    0: 'Peserta',
  }

  const certificates = myRegistrations.map((reg: any) => {
    const t = reg.tournaments
    const template = (t.certificate_template as any) ?? {}
    const rank = resultsMap[t.id]?.[reg.teams.id] ?? 0

    return {
      registrationId: reg.id,
      teamId: reg.teams.id,
      teamName: reg.teams.name,
      tournamentId: t.id,
      tournamentName: t.name,
      game: t.game,
      startDate: format(new Date(t.start_date), 'dd MMM yyyy', { locale: id }),
      endDate: format(new Date(t.end_date), 'dd MMM yyyy', { locale: id }),
      prizePool: t.prize_pool,
      rank,
      rankLabel: rankLabels[rank] ?? 'Peserta',
      organizerName: template.organizer_name ?? 'GameArena',
      primaryColor: template.primary_color ?? '#7c3aed',
      secondaryColor: template.secondary_color ?? '#a855f7',
    }
  })

  return <CertificateClientPage certificates={certificates} userName={profile?.full_name ?? user.email ?? 'Pengguna'} profile={profile} />
}

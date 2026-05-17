'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { supabase, user, error: 'Admin only' }
  return { supabase, user, error: null }
}

export async function updateMatchSchedule(
  matchId: string,
  tournamentId: string,
  data: { scheduled_at: string | null; venue: string | null; notes: string | null }
) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { error: updateErr } = await supabase
    .from('matches')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', matchId)

  if (updateErr) return { error: updateErr.message }

  // Send notifications to team captains if scheduled_at is set
  if (data.scheduled_at) {
    const { data: match } = await supabase
      .from('matches')
      .select('*, team1:team1_id(id, name), team2:team2_id(id, name)')
      .eq('id', matchId)
      .single()

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('name')
      .eq('id', tournamentId)
      .single()

    if (match?.team1_id && match?.team2_id && tournament) {
      const { data: regs } = await supabase
        .from('tournament_registrations')
        .select('registered_by, team_id')
        .eq('tournament_id', tournamentId)
        .in('team_id', [match.team1_id, match.team2_id])

      const formattedDate = format(new Date(data.scheduled_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })
      const team1Name = (match.team1 as any)?.name || 'Tim 1'
      const team2Name = (match.team2 as any)?.name || 'Tim 2'

      const notifs = (regs || []).map((reg: any) => ({
        user_id: reg.registered_by,
        type: 'match_scheduled',
        title: 'Jadwal Pertandingan Ditetapkan',
        message: `Pertandingan ${team1Name} vs ${team2Name} di ${tournament.name} dijadwalkan pada ${formattedDate}${data.venue ? ' di ' + data.venue : ''}.`,
        data: { match_id: matchId, tournament_id: tournamentId },
      }))

      if (notifs.length > 0) {
        await supabase.from('notifications').insert(notifs)
      }
    }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}/schedule`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}

export async function updateMatchScore(
  matchId: string,
  tournamentId: string,
  data: { score_team1: number; score_team2: number }
) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { data: match } = await supabase
    .from('matches')
    .select('*, team1:team1_id(id, name), team2:team2_id(id, name)')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match tidak ditemukan' }

  const winner_id =
    data.score_team1 > data.score_team2
      ? match.team1_id
      : data.score_team2 > data.score_team1
      ? match.team2_id
      : null

  const { error: updateErr } = await supabase
    .from('matches')
    .update({
      score_team1: data.score_team1,
      score_team2: data.score_team2,
      winner_id,
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (updateErr) return { error: updateErr.message }

  // Advance winner to next match
  if (winner_id && match.next_match_id) {
    const slot = match.next_match_slot === 1 ? { team1_id: winner_id } : { team2_id: winner_id }
    await supabase.from('matches').update(slot).eq('id', match.next_match_id)
  }

  revalidatePath(`/admin/tournaments/${tournamentId}/schedule`)
  revalidatePath(`/admin/tournaments/${tournamentId}/bracket`)
  revalidatePath(`/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}/bracket`)
  return { success: true, winner_id }
}

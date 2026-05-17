'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setMatchResult(
  matchId: string,
  winnerId: string,
  team1Score: number,
  team2Score: number,
  notes?: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const { data: match } = await supabase
    .from('matches')
    .select('tournament_id, next_match_id, next_match_slot')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match tidak ditemukan' }

  await supabase.from('matches').update({
    winner_id: winnerId,
    team1_score: team1Score,
    team2_score: team2Score,
    status: 'completed',
    notes: notes ?? null,
  }).eq('id', matchId)

  // Auto-advance winner to next match
  if (match.next_match_id && match.next_match_slot) {
    const field = match.next_match_slot === 1 ? 'team1_id' : 'team2_id'
    await supabase.from('matches').update({ [field]: winnerId }).eq('id', match.next_match_id)
  }

  revalidatePath(`/admin/tournaments/${match.tournament_id}/bracket`)
  revalidatePath(`/tournaments/${match.tournament_id}/bracket`)
  return { success: true }
}

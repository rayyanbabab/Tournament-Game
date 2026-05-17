'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function nextPow2(n: number) {
  let p = 1
  while (p < n) p *= 2
  return p
}

// Generate single-elimination bracket from approved teams
export async function generateBracket(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  // Get approved teams
  const { data: regs } = await supabase
    .from('tournament_registrations')
    .select('team_id, teams(id, name)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')

  if (!regs || regs.length < 2) return { error: 'Minimal 2 tim yang disetujui' }

  // Delete existing bracket
  await supabase.from('matches').delete().eq('tournament_id', tournamentId)

  const teams = regs.map((r: any) => r.teams)
  const n = teams.length
  const bracketSize = nextPow2(n)
  const totalRounds = Math.log2(bracketSize)

  // Build match structure per round
  const allMatchInserts: any[] = []
  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round)
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      allMatchInserts.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNum,
        status: 'pending',
      })
    }
  }

  const { data: insertedMatches, error: insertErr } = await supabase
    .from('matches')
    .insert(allMatchInserts)
    .select('id, round, match_number')

  if (insertErr || !insertedMatches) return { error: 'Gagal membuat bracket' }

  // Build lookup: round -> matchNum -> id
  const lookup: Record<number, Record<number, string>> = {}
  insertedMatches.forEach((m: any) => {
    if (!lookup[m.round]) lookup[m.round] = {}
    lookup[m.round][m.match_number] = m.id
  })

  // Second pass: link next_match_id
  const updates: Array<{ id: string; next_match_id: string; next_match_slot: number }> = []
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round)
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      const nextMatchNum = Math.ceil(matchNum / 2)
      const slot = matchNum % 2 === 1 ? 1 : 2
      updates.push({
        id: lookup[round][matchNum],
        next_match_id: lookup[round + 1][nextMatchNum],
        next_match_slot: slot,
      })
    }
  }

  for (const u of updates) {
    await supabase.from('matches').update({
      next_match_id: u.next_match_id,
      next_match_slot: u.next_match_slot,
    }).eq('id', u.id)
  }

  // Assign teams to Round 1 (shuffle first)
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  const round1Count = bracketSize / 2

  for (let matchNum = 1; matchNum <= round1Count; matchNum++) {
    const t1 = shuffled[(matchNum - 1) * 2] ?? null
    const t2 = shuffled[(matchNum - 1) * 2 + 1] ?? null
    const matchId = lookup[1][matchNum]

    if (!t2 && t1) {
      // BYE — auto-advance team1
      const nextMatchId = lookup[2]?.[Math.ceil(matchNum / 2)]
      const slot = matchNum % 2 === 1 ? 1 : 2
      await supabase.from('matches').update({
        team1_id: t1.id,
        status: 'bye',
        winner_id: t1.id,
        ...(nextMatchId && {
          next_match_id: nextMatchId,
          next_match_slot: slot,
        }),
      }).eq('id', matchId)

      // Fill next match with bye winner
      if (nextMatchId) {
        const update = slot === 1 ? { team1_id: t1.id } : { team2_id: t1.id }
        await supabase.from('matches').update(update).eq('id', nextMatchId)
      }
    } else {
      await supabase.from('matches').update({
        team1_id: t1?.id ?? null,
        team2_id: t2?.id ?? null,
      }).eq('id', matchId)
    }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}/bracket`)
  revalidatePath(`/tournaments/${tournamentId}/bracket`)
  return { success: true, rounds: totalRounds }
}

// Reset bracket
export async function resetBracket(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  await supabase.from('matches').delete().eq('tournament_id', tournamentId)
  revalidatePath(`/admin/tournaments/${tournamentId}/bracket`)
  revalidatePath(`/tournaments/${tournamentId}/bracket`)
  return { success: true }
}

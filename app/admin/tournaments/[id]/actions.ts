'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteTournament(tournamentId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Akses ditolak' }

  // Delete dependent data first (in case FK constraints exist)
  const { error: matchErr } = await supabase.from('tournament_matches').delete().eq('tournament_id', tournamentId)
  if (matchErr) console.error('[delete] tournament_matches:', matchErr.message)

  const { error: regErr } = await supabase.from('tournament_registrations').delete().eq('tournament_id', tournamentId)
  if (regErr) console.error('[delete] tournament_registrations:', regErr.message)

  // Delete tournament
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId)

  if (error) {
    console.error('[delete] tournaments:', error.message, error.code, error.details)
    return { error: `Gagal menghapus: ${error.message}` }
  }

  revalidatePath('/admin/tournaments')
  return {}
}

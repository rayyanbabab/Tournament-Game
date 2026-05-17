'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendTournamentAnnouncement(
  tournamentId: string,
  title: string,
  message: string
): Promise<{ success?: boolean; count?: number; error?: string }> {
  if (!title.trim() || !message.trim()) return { error: 'Judul dan pesan wajib diisi' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const { data: tournament } = await supabase
    .from('tournaments').select('name').eq('id', tournamentId).single()

  // Get all approved participants (unique users)
  const { data: regs } = await supabase
    .from('tournament_registrations')
    .select('registered_by')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')

  if (!regs || regs.length === 0) return { error: 'Tidak ada peserta yang disetujui' }

  const uniqueUserIds = [...new Set(regs.map(r => r.registered_by))]

  const notifs = uniqueUserIds.map(userId => ({
    user_id: userId,
    type: 'announcement',
    title: `📣 ${title}`,
    message,
    data: { tournament_id: tournamentId, tournament_name: tournament?.name },
  }))

  const { error } = await supabase.from('notifications').insert(notifs)
  if (error) return { error: error.message }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  return { success: true, count: uniqueUserIds.length }
}

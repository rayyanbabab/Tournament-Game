'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSiteSettings(entries: { key: string; value: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    for (const entry of entries) {
      await supabase.from('site_settings').upsert({
        key: entry.key,
        value: entry.value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
    }
    revalidatePath('/')
    revalidatePath('/admin/content')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function saveFeaturedTournament(tournamentId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    await supabase.from('site_settings').upsert({
      key: 'featured_tournament_id',
      value: tournamentId ?? '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })
    revalidatePath('/')
    revalidatePath('/admin/tournaments')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function saveNewsArticle(payload: any, id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    if (id) {
      const { error } = await supabase.from('news_articles').update(payload).eq('id', id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase.from('news_articles').insert({
        ...payload,
        author_id: user.id,
      })
      if (error) throw new Error(error.message)
    }
    revalidatePath('/news')
    revalidatePath('/admin/news')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function savePaymentSettings(payload: {
  bank_accounts: any[]
  qris_image_url: string | null
  payment_instructions: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    const { error } = await supabase.from('payment_settings').upsert({
      id: 1,
      bank_accounts: payload.bank_accounts,
      qris_image_url: payload.qris_image_url,
      payment_instructions: payload.payment_instructions,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/payments')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function saveTournamentResults(
  tournamentId: string,
  results: { team_id: string; rank: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    for (const r of results) {
      if (!r.team_id) continue
      await supabase.from('tournament_results').upsert({
        tournament_id: tournamentId,
        team_id: r.team_id,
        rank: r.rank,
      }, { onConflict: 'tournament_id,team_id' })
    }
    revalidatePath(`/admin/certificates/${tournamentId}`)
    revalidatePath(`/tournaments/${tournamentId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function resetTournamentResults(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' }

  try {
    await supabase
      .from('tournament_results')
      .delete()
      .eq('tournament_id', tournamentId)
      .gt('rank', 0)
    revalidatePath(`/admin/certificates/${tournamentId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function sendChatMessage(tournamentId: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const { error } = await supabase.from('tournament_messages').insert({
      tournament_id: tournamentId,
      user_id: user.id,
      message,
    })
    if (error) throw new Error(error.message)
    revalidatePath(`/tournaments/${tournamentId}/chat`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

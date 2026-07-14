'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface GameConfigDB {
  id: string
  value: string
  label: string
  emoji: string
  category: string
  default_mode: 'leaderboard' | 'bracket' | 'league'
  scoring_preset: 'ffim' | 'pmgc' | null
  maps: string[] | null
  default_bracket_format: 'single' | 'double' | 'group_playoffs' | null
  default_league_slot: number | null
  created_at: string
}

export async function getGameConfigs(): Promise<GameConfigDB[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('game_configs')
    .select('*')
    .order('category')
    .order('label')
  if (error) return []
  return data as GameConfigDB[]
}

export async function createGameConfig(formData: FormData) {
  const supabase = await createClient()
  const maps = ((formData.get('maps') as string) ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)

  const { error } = await supabase.from('game_configs').insert({
    value: formData.get('value') as string,
    label: formData.get('label') as string,
    emoji: formData.get('emoji') as string || '🎮',
    category: formData.get('category') as string,
    default_mode: formData.get('default_mode') as string,
    scoring_preset: formData.get('scoring_preset') || null,
    maps: maps.length > 0 ? maps : null,
    default_bracket_format: formData.get('default_bracket_format') || null,
    default_league_slot: formData.get('default_league_slot') ? Number(formData.get('default_league_slot')) : null,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/game-categories')
  return { success: true }
}

export async function updateGameConfig(id: string, formData: FormData) {
  const supabase = await createClient()
  const maps = ((formData.get('maps') as string) ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)

  const { error } = await supabase.from('game_configs').update({
    value: formData.get('value') as string,
    label: formData.get('label') as string,
    emoji: formData.get('emoji') as string || '🎮',
    category: formData.get('category') as string,
    default_mode: formData.get('default_mode') as string,
    scoring_preset: formData.get('scoring_preset') || null,
    maps: maps.length > 0 ? maps : null,
    default_bracket_format: formData.get('default_bracket_format') || null,
    default_league_slot: formData.get('default_league_slot') ? Number(formData.get('default_league_slot')) : null,
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/game-categories')
  return { success: true }
}

export async function deleteGameConfig(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('game_configs').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/game-categories')
  return { success: true }
}

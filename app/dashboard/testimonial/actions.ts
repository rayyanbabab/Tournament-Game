'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitTestimonial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  const content = formData.get('content')?.toString().trim()
  const rating  = parseInt(formData.get('rating')?.toString() || '5')
  const game    = formData.get('game')?.toString().trim() || null
  const handle  = formData.get('handle')?.toString().trim() || null

  if (!content || content.length < 10) return { error: 'Ulasan minimal 10 karakter' }
  if (content.length > 500) return { error: 'Ulasan maksimal 500 karakter' }
  if (rating < 1 || rating > 5) return { error: 'Rating tidak valid' }

  // Check if user already has a testimonial
  const { data: existing } = await supabase
    .from('testimonials')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('testimonials')
      .update({ content, rating, game, handle, updated_at: new Date().toISOString(), approved: false })
      .eq('user_id', user.id)

    if (error) return { error: 'Gagal memperbarui ulasan' }
  } else {
    const { error } = await supabase
      .from('testimonials')
      .insert({
        user_id: user.id,
        author_name: profile?.full_name || user.email?.split('@')[0] || 'Player',
        content,
        rating,
        game,
        handle,
        approved: false,
      })

    if (error) return { error: 'Gagal menyimpan ulasan' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard/testimonial')
  return { success: true }
}

export async function deleteTestimonial() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal menghapus ulasan' }

  revalidatePath('/')
  revalidatePath('/dashboard/testimonial')
  return { success: true }
}

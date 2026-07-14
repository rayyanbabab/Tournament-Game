import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialForm } from './testimonial-form'
import {
  Star, MessageSquare, CheckCircle2, Clock, ChevronRight, Info,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function TestimonialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Load existing testimonial for this user
  const { data: existing } = await supabase
    .from('testimonials')
    .select('id, content, rating, game, handle, approved, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto pt-16 md:pt-6">
      <div className="max-w-2xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Ulasan Saya</h1>
                <p className="text-sm text-muted-foreground">Bagikan pengalaman Anda bermain di GameArena</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3.5">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                Ulasan Anda akan ditampilkan di halaman utama GameArena setelah disetujui oleh admin.
                Setiap akun hanya dapat memiliki <strong>satu ulasan</strong>.
              </p>
            </div>

            {/* Existing status */}
            {existing && (
              <div className={`rounded-2xl border p-5 ${
                existing.approved
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {existing.approved ? (
                    <><CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600">Ulasan Disetujui & Ditampilkan</span></>
                  ) : (
                    <><Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600">Menunggu Persetujuan Admin</span></>
                  )}
                </div>
                {/* Preview */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: existing.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
                    "{existing.content}"
                  </p>
                </div>
                {existing.game && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">{existing.game}</span>
                    {existing.handle && <span className="text-muted-foreground">{existing.handle}</span>}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2.5">
                  {existing.updated_at ? `Diperbarui ${format(new Date(existing.updated_at), 'dd MMM yyyy HH:mm', { locale: id })}` : `Dikirim ${format(new Date(existing.created_at), 'dd MMM yyyy HH:mm', { locale: id })}`}
                </p>
              </div>
            )}

            {/* Form */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-5">
                {existing ? 'Perbarui Ulasan' : 'Tulis Ulasan Baru'}
              </h2>
              <TestimonialForm existing={existing ? {
                id: existing.id,
                content: existing.content,
                rating: existing.rating,
                game: existing.game,
                handle: existing.handle,
                approved: existing.approved,
              } : null} />
            </div>

      </div>
    </main>
  )
}

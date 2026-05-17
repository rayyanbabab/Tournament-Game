import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Star, MessageSquare, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ApproveTestimonialButton } from './approve-button'

export default async function AdminTestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, author_name, content, rating, game, handle, approved, created_at, user_id')
    .order('approved', { ascending: true })
    .order('created_at', { ascending: false })

  const pending  = testimonials?.filter(t => !t.approved) ?? []
  const approved = testimonials?.filter(t => t.approved)  ?? []

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Ulasan Komunitas</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Ulasan Komunitas</h1>
              <p className="text-sm text-muted-foreground">Moderasi ulasan user sebelum ditampilkan di halaman utama</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Ulasan',      value: testimonials?.length || 0, accent: 'border-l-foreground/30', valColor: 'text-foreground' },
              { label: 'Menunggu Review',   value: pending.length,            accent: 'border-l-amber-500',     valColor: 'text-amber-500' },
              { label: 'Sudah Disetujui',   value: approved.length,           accent: 'border-l-emerald-500',   valColor: 'text-emerald-500' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border border-border/60 border-l-2 ${s.accent} bg-card p-4`}>
                <p className={`text-3xl font-extrabold tabular-nums ${s.valColor}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40 bg-amber-500/[0.03]">
                <Clock className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">Menunggu Persetujuan</h2>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {pending.length} ulasan
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {pending.map((t: any) => (
                  <TestimonialRow key={t.id} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-foreground">Sudah Disetujui</h2>
              <span className="ml-auto text-xs text-muted-foreground">{approved.length} ulasan ditampilkan</span>
            </div>
            {approved.length > 0 ? (
              <div className="divide-y divide-border/40">
                {approved.map((t: any) => (
                  <TestimonialRow key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">Belum ada ulasan yang disetujui</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function TestimonialRow({ t }: { t: any }) {
  const initial = (t.author_name?.[0] || 'G').toUpperCase()
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-extrabold text-primary">{initial}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-foreground">{t.author_name}</p>
          {t.handle && <span className="text-xs text-muted-foreground">{t.handle}</span>}
          {t.game && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{t.game}</span>
          )}
          <div className="flex items-center gap-0.5 ml-auto">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} className={`h-3 w-3 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground italic line-clamp-2">"{t.content}"</p>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
          {format(new Date(t.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
        </p>
      </div>
      <ApproveTestimonialButton id={t.id} approved={t.approved} />
    </div>
  )
}

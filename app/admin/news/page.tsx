import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Newspaper, Plus, Edit, Eye, EyeOff } from 'lucide-react'

export default async function AdminNewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, slug, category, published, created_at, cover_image_url, excerpt')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium">Manajemen Berita</span>
          <Link
            href="/admin/news/create"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Tulis Artikel
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Berita & Pengumuman
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {articles?.filter(a => a.published).length ?? 0} artikel dipublikasikan ·{' '}
                {articles?.filter(a => !a.published).length ?? 0} draft
              </p>
            </div>
            <Link
              href="/admin/news/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tulis Artikel
            </Link>
          </div>

          {/* Articles list */}
          {articles && articles.length > 0 ? (
            <div className="rounded-xl border border-border/60 overflow-hidden bg-card divide-y divide-border/60">
              {articles.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                  {/* Cover thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                    {a.cover_image_url ? (
                      <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        a.published
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {a.published ? 'Publik' : 'Draft'}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{a.title}</p>
                    {a.excerpt && <p className="text-xs text-muted-foreground truncate mt-0.5">{a.excerpt}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {format(new Date(a.created_at), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {a.published && (
                      <Link
                        href={`/news/${a.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                        title="Lihat publik"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/news/${a.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 hover:bg-accent transition-colors"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Newspaper className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Belum Ada Artikel</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Mulai tulis berita, pengumuman, atau rekap pertandingan untuk mengisi platform Anda.
              </p>
              <Link
                href="/admin/news/create"
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Tulis Artikel Pertama
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

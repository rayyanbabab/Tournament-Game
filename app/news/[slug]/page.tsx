import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ArrowLeft, Calendar, Tag, Newspaper } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('news_articles').select('title, excerpt').eq('slug', slug).single()
  return {
    title: data ? `${data.title} — GameArena` : 'Artikel tidak ditemukan',
    description: data?.excerpt,
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('news_articles')
    .select('*, author:profiles!news_articles_author_id_fkey(full_name)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!article) notFound()

  // Related articles
  const { data: related } = await supabase
    .from('news_articles')
    .select('id, title, slug, cover_image_url, category, created_at')
    .eq('published', true)
    .eq('category', article.category)
    .neq('slug', slug)
    .limit(3)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Cover */}
        {article.cover_image_url && (
          <div className="w-full h-72 md:h-96 overflow-hidden">
            <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="container mx-auto px-4 max-w-3xl py-8 md:py-12">
          {/* Back */}
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Berita
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: id })}
            </span>
            {article.author?.full_name && (
              <span className="text-xs text-muted-foreground">
                oleh <strong>{article.author.full_name}</strong>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 border-l-4 border-primary/40 pl-4 italic">
              {article.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-sm md:prose dark:prose-invert max-w-none"
            style={{
              ['--tw-prose-headings' as any]: 'hsl(var(--foreground))',
              ['--tw-prose-body' as any]: 'hsl(var(--foreground))',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <style>{`
            .prose h2 { font-size: 1.4rem; font-weight: 700; margin: 1.5rem 0 0.6rem; }
            .prose h3 { font-size: 1.15rem; font-weight: 600; margin: 1.2rem 0 0.4rem; }
            .prose blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1.5rem 0; }
            .prose hr { border-color: hsl(var(--border)); margin: 2rem 0; }
            .prose ul { list-style: disc; padding-left: 1.5rem; }
            .prose ol { list-style: decimal; padding-left: 1.5rem; }
            .prose li { margin: 0.3rem 0; }
            .prose p { margin: 0.8rem 0; line-height: 1.75; }
            .prose img { border-radius: 12px; margin: 1.5rem auto; }
          `}</style>

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-border/60">
            <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Lihat semua berita
            </Link>
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <div className="border-t border-border/60 bg-muted/20">
            <div className="container mx-auto px-4 max-w-5xl py-10">
              <h2 className="text-base font-semibold text-foreground mb-5">Artikel Terkait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((a: any) => (
                  <Link key={a.id} href={`/news/${a.slug}`} className="group rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 transition-all">
                    {a.cover_image_url && (
                      <div className="h-32 overflow-hidden">
                        <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{format(new Date(a.created_at), 'dd MMM yyyy', { locale: id })}</p>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

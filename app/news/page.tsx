import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Newspaper, Calendar, Tag, ArrowRight, Search } from 'lucide-react'

export const metadata = { title: 'Berita & Pengumuman — GameArena' }

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, slug, excerpt, cover_image_url, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const featured = articles?.[0]
  const rest = articles?.slice(1) ?? []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Berita & Pengumuman</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Update Terbaru dari GameArena
            </h1>
            <p className="text-muted-foreground">
              Rekap turnamen, pengumuman, dan berita seputar dunia esports lokal.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl py-10 space-y-10">
          {articles && articles.length > 0 ? (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/news/${featured.slug}`} className="group block">
                  <div className="rounded-2xl border border-border/60 overflow-hidden bg-card hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5">
                    {featured.cover_image_url && (
                      <div className="h-64 md:h-80 overflow-hidden">
                        <img
                          src={featured.cover_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          {featured.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(featured.created_at), 'dd MMMM yyyy', { locale: id })}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                      )}
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        Baca Selengkapnya <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid articles */}
              {rest.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-4">Artikel Lainnya</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {rest.map((a: any) => (
                      <Link key={a.id} href={`/news/${a.slug}`} className="group">
                        <div className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col">
                          <div className="h-40 overflow-hidden bg-muted">
                            {a.cover_image_url ? (
                              <img
                                src={a.cover_image_url}
                                alt={a.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Newspaper className="h-10 w-10 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{a.category}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(a.created_at), 'dd MMM yyyy', { locale: id })}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
                              {a.title}
                            </h3>
                            {a.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{a.excerpt}</p>
                            )}
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              Baca <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <Newspaper className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Berita</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Admin belum mempublikasikan artikel. Nantikan update terbaru dari kami!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

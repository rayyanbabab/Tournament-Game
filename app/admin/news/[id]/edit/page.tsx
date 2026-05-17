import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { NewsEditor } from '@/components/admin/news-editor'
import { Newspaper } from 'lucide-react'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: article } = await supabase
    .from('news_articles').select('*').eq('id', id).single()

  if (!article) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" /> Edit Artikel
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
          <NewsEditor initialData={article} />
        </main>
      </div>
    </div>
  )
}

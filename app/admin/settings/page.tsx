import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminPageHeader } from '@/components/admin/page-header'
import { ProfileForm } from '@/components/profile-form'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium text-foreground">Pengaturan Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-4">
          <AdminPageHeader
            title="Pengaturan Profil"
            description="Kelola informasi pribadi dan foto profil akun admin Anda"
            breadcrumbs={[{ label: 'Pengaturan' }]}
          />

          <div className="max-w-2xl">
            <ProfileForm initialProfile={profile} />
          </div>
        </main>
      </div>
    </div>
  )
}

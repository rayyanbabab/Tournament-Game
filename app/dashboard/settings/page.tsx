import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserSidebar } from '@/components/user/sidebar'
import { ProfileForm } from '@/components/profile-form'

export default async function UserSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium text-foreground">Pengaturan Profil</span>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Profil</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola informasi pribadi dan pengaturan akun Anda.
              </p>
            </div>

            <ProfileForm initialProfile={profile} />
          </div>
        </main>
      </div>
    </div>
  )
}

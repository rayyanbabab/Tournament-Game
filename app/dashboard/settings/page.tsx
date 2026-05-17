import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserSidebar } from '@/components/user/sidebar'
import { ProfileForm } from '@/components/profile-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Settings, User } from 'lucide-react'

export default async function UserSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Pengaturan Profil</span>
          </div>
          <ThemeToggle size="sm" />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pt-16 md:pt-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">Pengaturan Profil</h1>
                <p className="text-sm text-muted-foreground">Kelola informasi pribadi dan pengaturan akun Anda</p>
              </div>
            </div>

            {/* Profile Card */}
            {profile && (
              <div className="rounded-2xl border border-border/60 bg-card p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {(profile as any).avatar_url ? (
                    <img src={(profile as any).avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-primary">
                      {(profile.full_name || 'G')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground">{profile.full_name || 'Gamer'}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full border ${
                    profile.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    <User className="h-2.5 w-2.5" />
                    {profile.role === 'admin' ? 'Admin' : 'Player'}
                  </span>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <ProfileForm initialProfile={profile} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

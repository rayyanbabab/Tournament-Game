'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import {
  Gamepad2,
  Trophy,
  Users,
  LayoutDashboard,
  Shield,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
  Newspaper,
} from 'lucide-react'
import type { Profile } from '@/lib/types'

const navLinks = [
  { href: '/tournaments', label: 'Turnamen', icon: Trophy },
  { href: '/teams', label: 'Tim', icon: Users },
  { href: '/news', label: 'Berita', icon: Newspaper },
]

export function Navbar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()

    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [supabase])

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-4 w-4 text-background" />
              </div>
              <span className="text-[15px] font-bold text-foreground tracking-tight hidden sm:block">
                GameArena
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                    isActive(href)
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                  )}
                </Link>
              ))}
            </div>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <ThemeToggle size="sm" />

              {loading ? (
                <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
              ) : profile ? (
                <>
                  {/* Admin link */}
                  {profile.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  )}

                  {/* Dashboard link */}
                  <Link
                    href="/dashboard"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>

                  {/* User menu */}
                  <div className="relative" data-user-menu>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-border/60 bg-background hover:bg-accent hover:border-border transition-all group"
                    >
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-primary/30 transition-all">
                        {(profile as any).avatar_url ? (
                          <img src={(profile as any).avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-primary">{initials}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-foreground max-w-[80px] truncate hidden sm:block">
                        {profile.full_name?.split(' ')[0] || profile.email?.split('@')[0]}
                      </span>
                      <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-2.5 border-b border-border/60">
                          <p className="text-xs font-semibold text-foreground truncate">{profile.full_name || 'Gamer'}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{profile.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 shrink-0" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Settings className="h-4 w-4 shrink-0" />
                            Pengaturan
                          </Link>
                          {profile.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              <Shield className="h-4 w-4 shrink-0" />
                              Admin Panel
                            </Link>
                          )}
                          <div className="h-px bg-border/60 my-1" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Keluar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-1.5 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Daftar Gratis
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(href)
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-border/50 my-1" />

              {profile ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors">
                    <User className="h-4 w-4" /> Profil Saya
                  </Link>
                  {profile.role === 'admin' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-center border border-border rounded-lg hover:bg-accent transition-colors">
                    Masuk
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-center bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                    Daftar Gratis
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't go under fixed navbar */}
      <div className="h-16" />
    </>
  )
}

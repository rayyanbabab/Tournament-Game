'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notification-bell'
import { GridPlayLogo } from '@/components/gridplay-logo'
import { cn } from '@/lib/utils'
import {
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
  Calculator,
  Scan,
} from 'lucide-react'

const navLinks = [
  { href: '/#cara-kerja', label: 'Cara Kerja' },
  { href: '/#fitur', label: 'Fitur' },
  { href: '/ocr', label: 'Hitung Poin' },
  { href: '/tournaments', label: 'Turnamen' },
  { href: '/#cocok-untuk', label: 'Cocok Untuk' },
  { href: '/#bukti', label: 'Testimoni' },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const profile = session?.user ? {
    id: session.user.id,
    full_name: (session.user as any).full_name || session.user.name || '',
    email: session.user.email || '',
    role: (session.user as any).role || 'user',
    avatar_url: session.user.image || null,
  } : null
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/85 backdrop-blur-md border-b border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
            : 'bg-background/40 backdrop-blur-sm border-b border-border/30'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── GridPlay Logo ── */}
            <div className="flex items-center gap-6">
              <GridPlayLogo />
            </div>

            {/* ── Desktop Center Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'px-3 py-1.5 text-[13px] font-medium transition-all duration-150 rounded-md',
                      active
                        ? 'text-foreground font-semibold bg-muted/60'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-2.5">
              {/* Theme toggle */}
              <ThemeToggle size="sm" />

              {/* Notification Bell (only for logged-in users) */}
              {profile && <NotificationBell />}

              {loading ? (
                <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
              ) : profile ? (
                <>
                  {/* Admin link */}
                  {profile.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  )}

                  {/* Dashboard link */}
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border/70 bg-background hover:bg-muted text-foreground transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                    Dashboard
                  </Link>

                  {/* User menu */}
                  <div className="relative" data-user-menu>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border/70 bg-background hover:bg-muted transition-all group"
                    >
                      <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center overflow-hidden shrink-0 font-medium">
                        {(profile as any).avatar_url ? (
                          <img src={(profile as any).avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold">{initials}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-foreground max-w-[80px] truncate hidden sm:block">
                        {profile.full_name?.split(' ')[0] || profile.email?.split('@')[0]}
                      </span>
                      <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/70 bg-popover shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-4 py-3 border-b border-border/60">
                          <p className="text-xs font-semibold text-foreground truncate">{profile.full_name || 'Admin Tournament'}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{profile.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                            Dashboard
                          </Link>
                          <Link
                            href="/ocr"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
                            Hitung Poin Otomatis
                          </Link>
                          <Link
                            href="/tournaments"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                            Turnamen Saya
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                            Pengaturan
                          </Link>
                          {profile.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              <Shield className="h-4 w-4 shrink-0" />
                              Admin Panel
                            </Link>
                          )}
                          <div className="h-px bg-border/60 my-1" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
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
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/ocr"
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium bg-foreground text-background hover:opacity-90 shadow-sm transition-all"
                  >
                    Coba Gratis
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center h-9 w-9 rounded-full border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/70 bg-background/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1.5">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {label}
                </Link>
              ))}

              <div className="h-px bg-border/60 my-2" />

              {profile ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                  </Link>
                  <Link href="/ocr" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Calculator className="h-4 w-4 text-muted-foreground" /> Hitung Poin Otomatis
                  </Link>
                  <Link href="/tournaments" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Trophy className="h-4 w-4 text-muted-foreground" /> Turnamen
                  </Link>
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 text-center text-sm font-medium border border-border/80 rounded-full hover:bg-muted transition-colors">
                    Masuk
                  </Link>
                  <Link href="/ocr" onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 text-center text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
                    Coba Gratis
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Gamepad2,
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  LogOut,
  Shield,
  Home,
  PanelLeft,
  Star,
  Menu,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types'

const sections = [
  {
    label: 'Menu',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/teams', label: 'Tim Saya', icon: Users },
      { href: '/tournaments', label: 'Turnamen', icon: Trophy },
    ],
  },
  {
    label: 'Akun',
    items: [
      { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
]

interface UserSidebarProps {
  profile?: Profile | null
}

function SidebarNav({ profile, onClose }: { profile?: Profile | null; onClose?: () => void }) {
  const pathname = usePathname()
  const supabase = createClient()

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-border/60 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground shrink-0">
          <Gamepad2 className="h-4 w-4 text-background" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">GameArena</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Player Portal</p>
        </div>
      </div>

      {/* User Info */}
      {profile && (
        <div className="px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-1 ring-border shrink-0 overflow-hidden">
              {(profile as any).avatar_url ? (
                <img src={(profile as any).avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {(profile.full_name || 'G')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || 'Gamer'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 h-9 px-3 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {profile?.role === 'admin' && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">Admin</p>
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-2.5 h-9 px-3 rounded-md text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-border/60 p-3 space-y-0.5">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Beranda</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

export function UserSidebar({ profile }: UserSidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border/60 bg-sidebar sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-[56px]' : 'w-[220px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 px-3 border-b border-border/60 shrink-0',
          collapsed ? 'justify-center' : 'gap-2.5 justify-between'
        )}>
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground shrink-0">
              <Gamepad2 className="h-4 w-4 text-background" />
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-foreground leading-none truncate">GameArena</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Player Portal</p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent text-muted-foreground shrink-0"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-10 w-full items-center justify-center hover:bg-accent text-muted-foreground border-b border-border/40"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* User Info (desktop) */}
        {!collapsed && profile && (
          <div className="px-3 py-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center ring-1 ring-border shrink-0 overflow-hidden">
                {(profile as any).avatar_url ? (
                  <img src={(profile as any).avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-foreground">
                    {(profile.full_name || 'G')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{profile.full_name || 'Gamer'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item)
                  const Icon = item.icon
                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-md mx-auto transition-colors',
                            active
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 h-8 px-2 rounded-md text-sm transition-colors',
                        active
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {profile?.role === 'admin' && (
            <div>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">Admin</p>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-md mx-auto text-amber-500 hover:bg-amber-500/10 transition-colors">
                      <Shield className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Admin Panel</TooltipContent>
                </Tooltip>
              ) : (
                <Link href="/admin" className="flex items-center gap-2.5 h-8 px-2 rounded-md text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-2 space-y-0.5 shrink-0">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-md mx-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Home className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Beranda</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleSignOut} className="flex h-9 w-9 items-center justify-center rounded-md mx-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Keluar</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-2.5 h-8 px-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Home className="h-4 w-4 shrink-0" />
                <span>Beranda</span>
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 h-8 px-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Keluar</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 backdrop-blur px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <Gamepad2 className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-bold">GameArena</span>
        </Link>
        <div className="flex items-center gap-2">
          {profile && (
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center ring-1 ring-border overflow-hidden">
              {(profile as any).avatar_url ? (
                <img src={(profile as any).avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-foreground">
                  {(profile.full_name || 'G')[0].toUpperCase()}
                </span>
              )}
            </div>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarNav profile={profile} onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  )
}

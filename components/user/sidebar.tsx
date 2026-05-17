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
  Home,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Profile } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/teams', label: 'Tim Saya', icon: Users },
  { href: '/tournaments', label: 'Turnamen', icon: Trophy },
]

interface UserSidebarProps {
  profile?: Profile | null
}

export function UserSidebar({ profile }: UserSidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col border-r border-border/60 bg-sidebar min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'w-[70px]' : 'w-[240px]'
        )}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Logo */}
        <div className={cn('flex items-center border-b border-border/60 h-16 px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 shrink-0">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground leading-none">GameArena</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Player Portal</p>
              </div>
            )}
          </Link>
        </div>

        {/* User Info */}
        {!collapsed && profile && (
          <div className="px-4 py-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                <span className="text-sm font-bold text-primary">
                  {(profile.full_name || 'G')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || 'Gamer'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="mb-2 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Navigasi</p>
            </div>
          )}
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon

            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-all duration-200',
                      active
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          {/* Admin link if admin */}
          {profile?.role === 'admin' && (
            <>
              {!collapsed && (
                <div className="pt-4 pb-2 px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Admin</p>
                </div>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin"
                      className="flex h-10 w-10 items-center justify-center rounded-lg mx-auto text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">Admin Panel</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
                >
                  <Shield style={{ width: '1.125rem', height: '1.125rem' }} className="shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Divider */}
        <div className="px-3">
          <div className="border-t border-border/60" />
        </div>

        {/* Footer */}
        <div className="p-3 space-y-1">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-lg mx-auto text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Home style={{ width: '1.125rem', height: '1.125rem' }} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Beranda</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    className="flex h-10 w-10 items-center justify-center rounded-lg mx-auto text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Keluar</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Home className="shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
                <span>Beranda</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
                <span>Keluar</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

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
  ClipboardList,
  LogOut,
  Settings,
  Home,
  PanelLeft,
  Menu,
  X,
  Star,
  TrendingUp,
  Banknote,
  LayoutTemplate,
  CreditCard,
  Newspaper,
  Shuffle,
  BarChart2,
  Award,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
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
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const sections = [
  {
    label: 'Dashboards',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/admin/tournaments', label: 'Turnamen', icon: Trophy },
      { href: '/admin/brackets', label: 'Bracket', icon: Shuffle },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { href: '/admin/registrations', label: 'Pendaftaran', icon: ClipboardList },
      { href: '/admin/payments', label: 'Pembayaran', icon: Banknote },
      { href: '/admin/payment-settings', label: 'Metode Bayar', icon: CreditCard },
      { href: '/admin/certificates', label: 'Sertifikat', icon: Award },
      { href: '/admin/teams', label: 'Tim', icon: Users },
      { href: '/admin/game-categories', label: 'Kategori Game', icon: Gamepad2 },
      { href: '/admin/testimonials', label: 'Ulasan', icon: Star },
    ],
  },
  {
    label: 'Halaman',
    items: [
      { href: '/', label: 'Landing Page', icon: Home },
      { href: '/admin/news', label: 'Berita', icon: Newspaper },
      { href: '/admin/content', label: 'Edit Konten', icon: LayoutTemplate },
      { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
]

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
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
          <p className="text-[10px] text-muted-foreground mt-0.5">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
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
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-3">
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

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
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
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground shrink-0">
              <Gamepad2 className="h-4 w-4 text-background" />
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-foreground leading-none truncate">GameArena</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Admin Dashboard</p>
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
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        {item.label}
                      </TooltipContent>
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
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-2 shrink-0">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-md mx-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Keluar</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 h-8 px-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── MOBILE HEADER (hamburger) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 backdrop-blur px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <Gamepad2 className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-bold">GameArena Admin</span>
        </Link>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <SidebarNav onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  )
}

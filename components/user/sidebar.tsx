'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Gift,
  Wrench,
  CreditCard,
  Settings,
  MessageCircle,
  LogOut,
  Shield,
  PanelLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { GridPlayLogo } from '@/components/gridplay-logo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Profile } from '@/lib/types'

const workspaceLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { href: '/dashboard/missions', label: 'Misi & Bonus', icon: Gift },
  { href: '/dashboard/tools', label: 'Tools', icon: Wrench },
]

const accountLinks = [
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
]

interface UserSidebarProps {
  profile?: Profile | null
}

function SidebarNav({ profile, onClose }: { profile?: Profile | null; onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const userInitial = (profile?.full_name || profile?.email || 'R')[0]?.toUpperCase()
  const userPlan = (profile as any)?.subscription_tier || 'FREE'

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* ── Brand Header: TOURNAMENT OS ── */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-zinc-800/80 shrink-0">
        <GridPlayLogo showBadge={false} href="/dashboard" />
        <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
          TOURNAMENT OS
        </span>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {/* WORKSPACE */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 px-2.5 mb-2">
            WORKSPACE
          </p>
          {workspaceLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  active
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-zinc-400')} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* AKUN */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 px-2.5 mb-2">
            AKUN
          </p>
          {accountLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  active
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-zinc-400')} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* SUPER ADMIN SHORTCUT (if role === 'admin') */}
        {profile?.role === 'admin' && (
          <div className="space-y-1 pt-2 border-t border-zinc-800/80">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-500 px-2.5 mb-2 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              SUPER ADMIN
            </p>
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4" />
                <span>Admin OS Panel</span>
              </div>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </div>
        )}
      </nav>

      {/* ── Footer Profile & Actions ── */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 shrink-0">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate leading-tight">
              {profile?.email || 'user@gridplay.id'}
            </p>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5 tracking-wider uppercase">
              PLAN · {userPlan}
            </p>
          </div>
        </div>

        {/* Grup WA */}
        <a
          href="https://chat.whatsapp.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Grup WA</span>
        </a>

        {/* Keluar */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

export function UserSidebar({ profile }: UserSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-950 shrink-0 z-40 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarNav profile={profile} />
      </aside>

      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4">
        <GridPlayLogo showBadge={false} href="/dashboard" />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="h-9 w-9 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-r border-zinc-800">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <SidebarNav profile={profile} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

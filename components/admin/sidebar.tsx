'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Trophy,
  Users,
  ClipboardList,
  LogOut,
  Settings,
  Star,
  Banknote,
  LayoutTemplate,
  CreditCard,
  Newspaper,
  Shuffle,
  BarChart2,
  Award,
  ScanLine,
  Shield,
  ArrowLeft,
  Menu,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { GridPlayLogo } from '@/components/gridplay-logo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

const sections = [
  {
    label: 'Platform Management',
    items: [
      { href: '/admin', label: 'Overview Global', icon: LayoutDashboard, exact: true },
      { href: '/ocr', label: 'Hitung Poin (OCR)', icon: ScanLine },
      { href: '/admin/tournaments', label: 'Semua Turnamen', icon: Trophy },
      { href: '/admin/registrations', label: 'Pendaftaran', icon: ClipboardList },
      { href: '/admin/teams', label: 'Tim Peserta', icon: Users },
      { href: '/admin/brackets', label: 'Bagan Bracket', icon: Shuffle },
      { href: '/admin/analytics', label: 'Statistik Platform', icon: BarChart2 },
    ],
  },
  {
    label: 'Keuangan & Billing',
    items: [
      { href: '/admin/payments', label: 'Konfirmasi Bayar', icon: Banknote },
      { href: '/admin/payment-settings', label: 'Metode Pembayaran', icon: CreditCard },
    ],
  },
  {
    label: 'Konten & Pengaturan',
    items: [
      { href: '/admin/certificates', label: 'Template Sertifikat', icon: Award },
      { href: '/admin/news', label: 'Berita & Pengumuman', icon: Newspaper },
      { href: '/admin/testimonials', label: 'Moderasi Ulasan', icon: Star },
      { href: '/admin/content', label: 'Edit Konten Teks', icon: LayoutTemplate },
      { href: '/admin/settings', label: 'Pengaturan Global', icon: Settings },
    ],
  },
]

function AdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Brand: GRIDPLAY ADMIN OS */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-zinc-800/80 shrink-0">
        <GridPlayLogo showBadge={false} href="/admin" />
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold">
          ADMIN OS
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 px-2.5 mb-2">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    active
                      ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-zinc-400')} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Switch back to User Tournament OS */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 shrink-0">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-400" />
          <span>Buka Tournament OS (User)</span>
        </Link>

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

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-950 w-64 shrink-0 z-40">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GridPlayLogo showBadge={false} href="/admin" />
          <span className="text-[9px] font-mono text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1 rounded">
            ADMIN
          </span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="h-9 w-9 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-r border-zinc-800">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <AdminSidebarContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

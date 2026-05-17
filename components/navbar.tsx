'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Gamepad2, Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react'
import type { Profile } from '@/lib/types'

const navLinks = [
  { href: '/tournaments', label: 'Turnamen' },
  { href: '/teams', label: 'Tim' },
  { href: '/#features', label: 'Fitur' },
  { href: '/#stats', label: 'Statistik' },
]

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      scrolled 
        ? 'border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm' 
        : 'bg-background/50 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Gamepad2 className="h-5 w-5 text-background" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">GameArena</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            ) : profile ? (
              <>
                {profile.role === 'admin' && (
                  <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        {(profile as any).avatar_url ? (
                          <img src={(profile as any).avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-primary">
                            {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="max-w-[100px] truncate text-xs">{profile.full_name || profile.email}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profil Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button asChild size="sm" className="shadow-sm">
                  <Link href="/auth/signup">Daftar Gratis →</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground rounded-md hover:bg-accent"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-border/50 flex flex-col gap-2">
                {profile ? (
                  <>
                    <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-destructive">
                      <LogOut className="h-4 w-4" /> Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/auth/login">Masuk</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/auth/signup">Daftar Gratis</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

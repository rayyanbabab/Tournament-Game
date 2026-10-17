'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { GridPlayLogo } from '@/components/gridplay-logo'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Gagal membuat akun')
        return
      }

      toast.success('Akun berhasil dibuat! Silakan masuk.')
      router.push('/auth/login')
    } catch {
      toast.error('Terjadi kesalahan saat mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-muted/20 border-r border-border/60 flex-col justify-between p-12 lg:p-16">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <GridPlayLogo showBadge={false} />
        </div>

        {/* Center: Hero copy */}
        <div className="relative z-10 max-w-md space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-3">
              — DAFTAR
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Mulai dari turnamen pertama.
            </h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Buat akun, susun daftar tim, lalu biarkan poin dan klasemen bergerak sendiri.
            </p>
          </div>

          {/* 3 Value propositions */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">01</span>
              <span>Gratis untuk dicoba, tanpa kartu kredit.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">02</span>
              <span>Siap dipakai dalam dua menit, tanpa pemasangan.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">03</span>
              <span>Satu akun untuk semua turnamen dan musim.</span>
            </div>
          </div>
        </div>

        {/* Bottom: Legal */}
        <div className="relative z-10 text-[11px] text-muted-foreground font-mono">
          © 2026 GridPlay. Bukan afiliasi resmi Garena.
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden pb-4">
            <GridPlayLogo />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Buat akunmu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-foreground font-semibold hover:underline">
                Masuk
              </Link>
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                NAMA LENGKAP
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap atau nama admin"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  KATA SANDI
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">6+ karakter</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Buat akun gratis
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            Dengan mendaftar, kamu setuju memakai GridPlay untuk mengelola turnamen komunitas. Bukan afiliasi resmi Garena.
          </p>
        </div>
      </div>
    </div>
  )
}

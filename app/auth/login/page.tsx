'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { GridPlayLogo } from '@/components/gridplay-logo'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email atau kata sandi salah')
        return
      }

      toast.success('Masuk berhasil!')

      // Check user role
      const res = await fetch('/api/auth/session')
      const session = await res.json()

      if (session?.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/ocr')
      }
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan saat masuk')
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
              — MASUK
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Lanjutkan dari klasemen terakhir.
            </h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Semua turnamen, tim, dan poin yang sudah kau kelola tersimpan di akun ini.
            </p>
          </div>

          {/* 3 Value propositions */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">01</span>
              <span>Klasemen dan sertifikat tetap tersimpan antar-match.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">02</span>
              <span>Undang admin lain tanpa membagi kata sandi.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-foreground font-semibold">03</span>
              <span>Ekspor hasil ke gambar atau PDF kapan saja.</span>
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
              Masuk ke akunmu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Belum punya akun?{' '}
              <Link href="/auth/signup" className="text-foreground font-semibold hover:underline">
                Daftar gratis
              </Link>
            </p>
          </div>

          {/* GridPlay Server Notice Box */}
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/40 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[10px] text-foreground font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              SISTEM LOGIN TERVERIFIKASI
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Gunakan email dan kata sandi yang telah kamu daftarkan untuk mengakses turnamen, hasil scan OCR, dan sertifikatmu.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                <button
                  type="button"
                  onClick={() => toast.info('Fitur reset kata sandi dapat dilakukan melalui admin.')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              Masuk
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            Mengalami kendala saat login? Hubungi tim support komunitas kami melalui grup WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}

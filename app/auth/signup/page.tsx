'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Gamepad2, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Shield, Star } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: 'user',
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Pendaftaran berhasil! Silakan cek email Anda.')
      router.push('/auth/signup-success')
    } catch {
      toast.error('Terjadi kesalahan saat mendaftar')
    } finally {
      setLoading(false)
    }
  }

  const strengthLabel = ['', 'Lemah', 'Sedang', 'Kuat']
  const strengthColor = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500']

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">GameArena</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Mulai perjalanan<br />
              <span className="text-primary">gaming</span> Anda
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
              Daftar gratis dalam hitungan detik dan mulai ikuti turnamen gaming favorit Anda.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, text: 'Daftar & kelola tim gaming Anda' },
              { icon: Star, text: 'Ikuti turnamen dan raih prize pool' },
              { icon: Shield, text: 'Akun aman & data terlindungi' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm text-zinc-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs text-zinc-600">© 2025 GameArena. Gratis untuk semua gamer.</p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-border/60">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">GameArena</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm space-y-6">
            {/* Back link */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke beranda
            </Link>

            {/* Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-foreground">Buat akun baru</h1>
              <p className="text-sm text-muted-foreground">Gratis selamanya. Tidak perlu kartu kredit.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nama kamu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="h-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level ? strengthColor[passwordStrength] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kekuatan password: <span className={`font-medium ${
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>{strengthLabel[passwordStrength]}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  'Buat Akun Gratis'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">Sudah punya akun?</span>
              </div>
            </div>

            {/* Login link */}
            <Button asChild variant="outline" className="w-full h-10">
              <Link href="/auth/login">Masuk ke akun</Link>
            </Button>

            {/* TOS */}
            <p className="text-center text-xs text-muted-foreground">
              Dengan mendaftar, Anda menyetujui{' '}
              <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                Syarat & Ketentuan
              </span>{' '}
              kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

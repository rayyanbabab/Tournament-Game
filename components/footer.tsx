import Link from 'next/link'
import { GridPlayLogo } from '@/components/gridplay-logo'
import { MessageCircle, ExternalLink, ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background relative overflow-hidden">
      {/* Pre-footer Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-border/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Turnamenmu jalan sendiri.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Buat akun, undang tim, dan biarkan point serta klasemen bergerak tanpa Excel.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/ocr"
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              Mulai gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full text-sm font-medium border border-border/80 bg-background hover:bg-muted text-foreground transition-all"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <GridPlayLogo showBadge={false} />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kelola turnamen Free Fire tanpa ribet dan tanpa Excel.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif & Stabil
            </div>
          </div>

          {/* Produk */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
              Produk
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/#fitur" className="hover:text-foreground transition-colors">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="/#cara-kerja" className="hover:text-foreground transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="hover:text-foreground transition-colors">
                  Hitung Point Otomatis (OCR)
                </Link>
              </li>
              <li>
                <Link href="/#cocok-untuk" className="hover:text-foreground transition-colors">
                  Cocok Untuk
                </Link>
              </li>
              <li>
                <Link href="/#bukti" className="hover:text-foreground transition-colors">
                  Bukti & Testimoni
                </Link>
              </li>
            </ul>
          </div>

          {/* Sumber Daya */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
              Sumber Daya
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/cara-membuat-turnamen-free-fire" className="hover:text-foreground transition-colors">
                  Cara Membuat Turnamen Free Fire
                </Link>
              </li>
              <li>
                <Link href="/sistem-point-turnamen-free-fire" className="hover:text-foreground transition-colors">
                  Sistem Point Turnamen Free Fire
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="hover:text-foreground transition-colors">
                  Hitung Point Otomatis (OCR)
                </Link>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Grup WhatsApp <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/#cara-kerja" className="hover:text-foreground transition-colors">
                  Tutorial Video
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Komunitas */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
              Kontak
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a
                  href="https://wa.me/6285883795285"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  wa.me/6285883795285 <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">gridplay.my.id</span>
              </li>
              <li className="pt-2">
                <div className="p-3 rounded-xl border border-border/60 bg-muted/30 text-[11px] leading-relaxed text-muted-foreground">
                  Butuh bantuan setup turnamen atau custom format poin? Hubungi tim admin melalui WhatsApp.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 GridPlay. Dibuat untuk organizer turnamen Free Fire.</p>
          <p className="text-muted-foreground/80">Bukan afiliasi resmi Garena.</p>
        </div>
      </div>
    </footer>
  )
}

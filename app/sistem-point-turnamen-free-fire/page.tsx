import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, Trophy, Flame, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sistem Point Turnamen Free Fire (FFWS / FFML) & Aturan Tie Breaker — GridPlay',
  description:
    'Penjelasan lengkap tabel sistem skor point turnamen Free Fire resmi. Pelajari alokasi poin placement, kill point, serta aturan pemecah seri (tie breaker).',
}

export default function SistemPointPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link href="/" className="hover:text-foreground">BERANDA</Link>
            <span>/</span>
            <span className="text-foreground">SISTEM POIN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Sistem Point Turnamen Free Fire Resmi (FFWS) & Aturan Tie-Breaker
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Panduan lengkap struktur nilai placement dan kill point yang diterapkan pada kompetisi esports Free Fire di Indonesia dan internasional.
          </p>
        </div>

        {/* Scoring Table */}
        <div className="mt-10 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              1. Tabel Distribusi Poin Placement
            </h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono uppercase text-muted-foreground">
                    <th className="py-3 px-4">Posisi (Placement)</th>
                    <th className="py-3 px-4 text-center">Poin Placement</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="bg-amber-500/10 font-bold">
                    <td className="py-3 px-4 text-amber-500">Juara 1 (Booyah)</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-500">12 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-amber-500">Maksimum</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 2</td>
                    <td className="py-3 px-4 text-center font-mono">9 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 3</td>
                    <td className="py-3 px-4 text-center font-mono">8 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 4</td>
                    <td className="py-3 px-4 text-center font-mono">7 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 5</td>
                    <td className="py-3 px-4 text-center font-mono">6 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 6</td>
                    <td className="py-3 px-4 text-center font-mono">5 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 7</td>
                    <td className="py-3 px-4 text-center font-mono">4 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 8</td>
                    <td className="py-3 px-4 text-center font-mono">3 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 9</td>
                    <td className="py-3 px-4 text-center font-mono">2 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Juara 10</td>
                    <td className="py-3 px-4 text-center font-mono">1 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">-</td>
                  </tr>
                  <tr className="text-muted-foreground">
                    <td className="py-3 px-4">Juara 11 &amp; 12</td>
                    <td className="py-3 px-4 text-center font-mono">0 Poin</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">Tanpa Poin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Kill Points */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Perhitungan Poin Kill
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Setiap eliminasi yang dicetak oleh anggota tim memberikan <strong>1 Poin Kill</strong> secara langsung ke total tim. Tidak ada batasan maksimum (kill cap) pada format turnamen Free Fire standar.
            </p>
          </section>

          {/* Tie Breaker Rules */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Aturan Pemecah Seri (Tie-Breaker Hierarchy)
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jika dua tim atau lebih memiliki total poin yang sama di akhir kompetisi, penentuan peringkat dilakukan secara berurutan:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li><strong>Total Booyah Terbanyak:</strong> Tim dengan jumlah kemenangan ronde (Juara 1) lebih banyak berada di atas.</li>
              <li><strong>Total Poin Placement Terbanyak:</strong> Tim dengan akumulasi poin bertahan hidup tertinggi.</li>
              <li><strong>Jumlah Kill di Match Terakhir:</strong> Tim yang mencetak eliminasi lebih banyak di ronde final.</li>
            </ol>
          </section>

          <div className="pt-6">
            <Link
              href="/ocr"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
            >
              Gunakan GridPlay Auto Hitung Point Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

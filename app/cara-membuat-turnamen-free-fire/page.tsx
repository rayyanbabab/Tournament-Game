import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle2, ArrowRight, ShieldCheck, Trophy, Clock, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cara Membuat Turnamen Free Fire Komunitas & Fast Scrim — Panduan EO GridPlay',
  description:
    'Panduan lengkap cara menyelenggarakan turnamen Free Fire dari awal: penyusunan rulebook, sistem poin resmi FFWS, manajemen slot 12 tim, dan auto hitung point tanpa Excel.',
}

export default function CaraMembuatTurnamenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link href="/" className="hover:text-foreground">BERANDA</Link>
            <span>/</span>
            <span className="text-foreground">PANDUAN EO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Cara Membuat Turnamen Free Fire dari Nol untuk Komunitas & Scrim
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Menyelenggarakan turnamen Free Fire (FF) tidak harus rumit dan memakan waktu berjam-jam mencatat nilai di Excel. Ikuti 5 langkah terstruktur berikut untuk memastikan turnamenmu berjalan profesional dan transparan.
          </p>
        </div>

        <div className="mt-10 space-y-12 text-sm sm:text-base leading-relaxed">
          {/* Step 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono">
                01
              </span>
              Tentukan Format Turnamen & Jumlah Slot
            </h2>
            <p className="text-muted-foreground">
              Satu room Free Fire kompetitif menampung <strong>12 tim</strong> (48 pemain aktif). Untuk turnamen komunitas, format yang paling umum digunakan adalah:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li><strong>Fast Scrim Harian:</strong> 1 pot (12 tim) bermain 3 hingga 4 ronde.</li>
              <li><strong>Community Cup / Mini Tournament:</strong> 2 hingga 4 pot babak kualifikasi, diambil 3 tim teratas dari tiap pot menuju Grand Final.</li>
              <li><strong>League / Guild Championship:</strong> Klasemen akumulasi poin selama beberapa pekan bertanding.</li>
            </ul>
          </section>

          {/* Step 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono">
                02
              </span>
              Gunakan Sistem Poin Resmi FFWS
            </h2>
            <p className="text-muted-foreground">
              Jangan gunakan sistem hitung manual yang membingungkan peserta. Standar kompetitif resmi Free Fire menggunakan sistem poin berikut:
            </p>
            <div className="p-4 rounded-2xl border border-border bg-muted/30 font-mono text-xs">
              <p className="font-bold text-foreground mb-2">STANDAR POIN FFWS (PLACEMENT + KILL):</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div>#1 (Booyah): 12 poin</div>
                <div>#2: 9 poin</div>
                <div>#3: 8 poin</div>
                <div>#4: 7 poin</div>
                <div>#5: 6 poin</div>
                <div>#6: 5 poin</div>
                <div>#7: 4 poin</div>
                <div>#8: 3 poin</div>
                <div>#9: 2 poin</div>
                <div>#10: 1 poin</div>
                <div>#11 - #12: 0 poin</div>
                <div className="text-foreground font-bold">1 Kill = 1 Poin</div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono">
                03
              </span>
              Otomatisasi Penghitungan Poin dengan GridPlay (Tanpa Excel)
            </h2>
            <p className="text-muted-foreground">
              Masalah terbesar admin turnamen adalah lelah merekap skor di Excel setelah tiap ronde berakhir. Dengan <strong>GridPlay AI OCR Scanner</strong>, admin cukup screenshot tabel hasil pertandingan lalu mengunggahnya. Sistem langsung membaca data tim, menghitung skor, dan memperbarui klasemen otomatis dalam waktu kurang dari 2 detik.
            </p>
            <div className="pt-2">
              <Link
                href="/ocr"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
              >
                Coba Hitung Poin Otomatis Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Step 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono">
                04
              </span>
              Bagikan Papan Skor PNG & Cetak Sertifikat E-Turnamen
            </h2>
            <p className="text-muted-foreground">
              Begitu match terakhir selesai, ekspor hasil klasemen dalam bentuk gambar HD PNG siap share ke grup WhatsApp tim. GridPlay juga menyediakan generator sertifikat e-turnamen otomatis untuk Juara 1, 2, 3, dan Predator (Most Kill).
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

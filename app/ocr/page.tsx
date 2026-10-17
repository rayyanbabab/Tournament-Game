import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GridPlayScanner } from '@/components/ocr-calculator/gridplay-scanner'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hitung Poin Otomatis & Klasemen Turnamen Free Fire — GridPlay',
  description:
    'Upload screenshot hasil pertandingan Free Fire, hitung poin per match secara otomatis, susun klasemen, dan unduh papan skor leaderboard PNG HD.',
}

export default function OcrPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <GridPlayScanner />
      </main>

      <Footer />
    </div>
  )
}

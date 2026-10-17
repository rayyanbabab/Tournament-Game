'use client'

import React from 'react'
import Link from 'next/link'
import { Scan, Users, Calculator, Tv, Award, ArrowRight } from 'lucide-react'

export default function ToolsPage() {
  const tools = [
    {
      title: 'Scanner Screenshot Match',
      desc: 'Pindai tabel screenshot hasil pertandingan Free Fire dan hitung poin secara otomatis.',
      href: '/ocr',
      icon: Scan,
      badge: 'POPULER',
    },
    {
      title: 'Kalkulator Poin Resmi FFWS',
      desc: 'Simulator hitung placement, kill points, dan tie-breaker klasemen tanpa upload gambar.',
      href: '/hitung-point',
      icon: Calculator,
      badge: 'STANDAR',
    },
    {
      title: 'OBS Live Stream Overlay Studio',
      desc: 'Kustomisasi tampilan klasemen broadcast real-time untuk Browser Source OBS Studio.',
      href: '/overlay',
      icon: Tv,
      badge: 'BROADCAST',
    },
    {
      title: 'Generator Sertifikat Juara',
      desc: 'Cetak sertifikat e-turnamen resmi untuk Juara 1, 2, 3 dan Predator secara instan.',
      href: '/ocr',
      icon: Award,
      badge: 'HD EXPORT',
    },
  ]

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      <div className="space-y-1">
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground block">
          — WORKSPACE TOOLS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Peralatan Turnamen.
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kumpulan utilitas praktis untuk mempercepat tugas admin dan menyajikan turnamen profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map(({ title, desc, href, icon: Icon, badge }) => (
          <Link
            key={title}
            href={href}
            className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/30 transition-all flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground pt-2">
              Buka Tool <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { Gift, CheckCircle2, Share2, ArrowRight, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function MissionsPage() {
  const missions = [
    {
      id: 1,
      title: 'Bagikan GridPlay ke Grup WhatsApp',
      reward: '+3 Kredit Scan',
      desc: 'Bagikan tautan GridPlay ke grup turnamen Free Fire dan salin link bukti pesan.',
      completed: false,
    },
    {
      id: 2,
      title: 'Buat Turnamen Pertama',
      reward: '+5 Kredit Scan',
      desc: 'Selesaikan setup room match pertamamu di GridPlay Tournament OS.',
      completed: true,
    },
    {
      id: 3,
      title: 'Ikuti Saluran WhatsApp Resmi',
      reward: '+2 Kredit Scan',
      desc: 'Dapatkan pengumuman update fitur dan tips penyelenggara turnamen.',
      completed: false,
    },
  ]

  const handleClaim = (mId: number) => {
    toast.success('Misi diverifikasi! Kredit scan berhasil ditambahkan ke akunmu.')
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      <div className="space-y-1">
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground block">
          — MISI & HADIAH
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Kerjakan misi, klaim kredit.
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Promosikan GridPlay di media sosial dan klaim kredit scan tambahan secara gratis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {missions.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 text-amber-500">
                <Gift className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {m.reward}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            </div>

            <button
              onClick={() => handleClaim(m.id)}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm shrink-0"
            >
              Klaim Hadiah
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

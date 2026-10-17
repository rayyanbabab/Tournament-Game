'use client'

import React, { useState } from 'react'
import { Check, Crown, Shield, CreditCard, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handleUpgrade = (tierName: string) => {
    toast.success(`Permintaan upgrade ke paket ${tierName} diterima! Hubungi WhatsApp admin untuk pembayaran otomatis.`)
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground block">
            TAGIHAN & KREDIT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Lembar Tagihan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pantau pemakaian kuota, top up saldo kredit scan, dan pilih paket turnamen.
          </p>
        </div>

        <div className="text-right text-[11px] font-mono text-muted-foreground hidden sm:block">
          <span>NO. DOKUMEN: GPL-20261008</span>
          <p>08 Oktober 2026</p>
        </div>
      </div>

      {/* ── METRICS SUMMARY BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Plan */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            PLAN AKTIF
          </p>
          <div className="text-2xl font-bold text-foreground">Free Tier</div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>1 / 3 Turnamen</span>
              <span>33%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-foreground rounded-full w-1/3" />
            </div>
          </div>
        </div>

        {/* Saldo Credits */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            SALDO CREDITS
          </p>
          <div className="text-4xl font-extrabold font-mono text-foreground">5</div>
          <p className="text-[11px] font-mono text-muted-foreground">1 KREDIT = 1 KALI SCAN MATCH</p>
        </div>

        {/* Quick Action */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 flex flex-col justify-between space-y-3">
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
              AKSI CEPAT
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Upgrade Pro untuk turnamen tanpa batas, tanpa watermark, dan 50 kredit/bulan.
            </p>
          </div>
          <button
            onClick={() => handleUpgrade('PRO TIER')}
            className="w-full py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            Upgrade ke Pro
          </button>
        </div>
      </div>

      {/* ── BILLING PERIOD TOGGLE ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <div>
          <p className="text-xs font-semibold text-foreground">Periode Pembayaran</p>
          <p className="text-xs text-muted-foreground">Pilih periode — makin panjang, makin hemat.</p>
        </div>
        <div className="p-1 rounded-full border border-border bg-muted/40 flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-3 py-1 rounded-full transition-all ${
              billingPeriod === 'monthly' ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground'
            }`}
          >
            BULANAN
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-3 py-1 rounded-full transition-all ${
              billingPeriod === 'yearly' ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground'
            }`}
          >
            TAHUNAN (-20%)
          </button>
        </div>
      </div>

      {/* ── PRICING TIERS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pro Tier */}
        <div className="rounded-3xl border border-zinc-700 bg-zinc-950 text-zinc-100 p-8 space-y-6 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                ★ PRO TIER · PLN-PRO
              </span>
              <h3 className="text-xl font-bold text-white">Komunitas & Panitia Rutin</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                Rp 15.000
              </span>
              <span className="text-xs text-zinc-400 font-mono block">/ BULAN</span>
            </div>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Turnamen tanpa batas (Unlimited)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>50 Kredit Scan Match per bulan</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Bebas watermark GridPlay di ekspor gambar</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>OBS Live Stream Overlay Studio kustom</span>
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade('PRO TIER')}
            className="w-full py-3 rounded-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm"
          >
            Pilih Pro Tier
          </button>
        </div>

        {/* Business Tier */}
        <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                  BUSINESS TIER · DISARANKAN
                </span>
                <h3 className="text-xl font-bold text-foreground">Event Organizer Profesional</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                  Rp 80.000
                </span>
                <span className="text-xs text-muted-foreground font-mono block">/ BULAN</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground mt-6">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Semua fitur Pro Tier</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>300 Kredit Scan Match per bulan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Kustomisasi logo sponsor turnamen</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Akses API & multi-admin co-host</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('BUSINESS TIER')}
            className="w-full py-3 rounded-full text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all"
          >
            Pilih Business Tier
          </button>
        </div>
      </div>
    </main>
  )
}

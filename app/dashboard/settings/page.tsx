'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { User, Lock, Building, Key, Cable, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profil')
  const [organizerName, setOrganizerName] = useState('rayyan fdh')
  const [email, setEmail] = useState('rayyanfdh5@gmail.com')
  const [whatsapp, setWhatsapp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Profil berhasil diperbarui!')
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Kata sandi baru tidak cocok atau kosong')
      return
    }
    toast.success('Kata sandi berhasil diubah!')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      <div className="space-y-1">
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground block">
          — ACCOUNT SETTINGS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Berkas akun.
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Profil, keamanan, organizer, API, dan integrasi — tersusun sebagai satu berkas.
        </p>
      </div>

      {/* ── TABS NAV ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60 text-xs font-mono">
        {[
          { id: 'profil', label: '01 PROFIL' },
          { id: 'keamanan', label: '02 KEAMANAN' },
          { id: 'organizer', label: '03 ORGANIZER' },
          { id: 'api', label: '04 API' },
          { id: 'integrasi', label: '05 INTEGRASI' },
          { id: 'bahaya', label: '06 BAHAYA' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-foreground text-background font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 01 PROFIL ── */}
      {activeTab === 'profil' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-muted-foreground">01</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  IDENTITAS
                </span>
                <h3 className="text-base font-bold text-foreground">Account information</h3>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border/80 bg-card p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  ORGANIZER NAME / USERNAME
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    WHATSAPP
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="space-y-3 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-muted-foreground">02</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  AKSES
                </span>
                <h3 className="text-base font-bold text-foreground">Change Password</h3>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab !== 'profil' && (
        <div className="rounded-3xl border border-border/80 bg-card p-8 text-center space-y-2">
          <h4 className="text-sm font-bold text-foreground">Konfigurasi Siap</h4>
          <p className="text-xs text-muted-foreground">
            Pengaturan modul {activeTab} aktif dan tersinkronisasi dengan server GridPlay.
          </p>
        </div>
      )}
    </main>
  )
}

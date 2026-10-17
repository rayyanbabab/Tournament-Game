# GridPlay — Platform Pendaftaran Turnamen & Hitung Poin Otomatis Esports

<div align="center">

![GridPlay Banner](https://img.shields.io/badge/GridPlay-Esports%20Tournament%20Platform-blue?style=for-the-badge&logo=gamepad)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20%2F%20Supabase-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

**Platform all-in-one untuk penyelenggara turnamen (Tournament Organizer), komunitas gaming, dan tim esports di Indonesia.**  
*Hitung poin turnamen Free Fire otomatis dari screenshot hasil pertandingan, susun klasemen instan, cetak sertifikat juara, dan kelola pendaftaran turnamen tanpa Excel.*

[Fitur Utama](#-fitur-utama) • [Teknologi](#-tech-stack) • [Cara Kerja](#-cara-kerja-hitung-poin-ocr) • [Instalasi](#-instalasi--menjalankan-secara-lokal) • [Struktur Proyek](#-struktur-direktori)

</div>

---

## 📌 Tentang Aplikasi

Mengelola turnamen esports sering kali merepotkan: panitia harus menyalin skor hasil pertandingan satu per satu ke lembar Excel, menghitung poin penempatan (placement) dan kill secara manual, menyusun klasemen sementara, hingga mendesain sertifikat juara satu per satu. Proses manual ini memakan waktu lama dan rentan terhadap kesalahan hitung (*human error*).

**GridPlay** hadir sebagai solusi modern untuk memecahkan masalah tersebut. Dengan antarmuka yang bersih, responsif, dan bernuansa arena kompetitif profesional, GridPlay menyediakan sistem pendaftaran turnamen online lengkap sekaligus alat hitung poin otomatis berbasis OCR (Optical Character Recognition) untuk game *Battle Royale* seperti Free Fire, serta dukungan untuk Mobile Legends, PUBG Mobile, Valorant, dan game kompetitif lainnya.

---

## ⚡ Fitur Utama

### 1. 🔍 Hitung Poin Otomatis via Screenshot (OCR Match Scanner)
- **Ekstraksi Instan**: Upload gambar screenshot tabel skor akhir pertandingan Free Fire langsung dari galeri HP atau PC.
- **Deteksi Otomatis**: Sistem mendeteksi nama tim, peringkat/penempatan (placement), dan total kill secara akurat.
- **Standar Regulasi Resmi**: Menggunakan standar poin resmi turnamen (FFWS / Free Fire World Series) atau konfigurasi skor kustom.
- **Edit & Validasi Cepat**: Pratinjau tabel hasil pembacaan sebelum disimpan untuk memastikan data 100% tepat.

### 2. 📊 Papan Klasemen Real-Time (Live Standings & Leaderboard)
- **Kalkulasi Otomatis**: Total poin, Booyah count, dan placement point langsung diperbarui secara dinamis.
- **Ekspor Gambar HD**: Download visual papan klasemen beresolusi tinggi siap bagikan ke WhatsApp Group, Instagram, atau Discord.
- **OBS Streamer Overlay (`/overlay`)**: Ticker dan overlay klasemen transparan siap pakai di OBS Studio untuk siaran langsung (live streaming).

### 3. 🏆 Manajemen Pendaftaran Turnamen Online
- **Pendaftaran Tim & Roster**: Formulir pendaftaran tim dengan validasi anggota, nomor kontak kapten, dan ID game.
- **Slot & Batas Waktu**: Pengaturan kuota maksimal tim, tanggal pendaftaran, dan status turnamen otomatis (*Open*, *Ongoing*, *Completed*).
- **Verifikasi Pembayaran**: Sistem upload bukti transfer biaya registrasi turnamen dengan panel persetujuan admin.

### 4. ⚔️ Bagan Pertandingan (Tournament Bracket)
- Generator bagan turnamen interaktif (*Single Elimination* & *Double Elimination*).
- Manajemen babak kualifikasi hingga grand final dengan update skor per match.

### 5. 📜 E-Sertifikat Juara Otomatis
- Pembuatan sertifikat digital untuk Juara 1, Juara 2, Juara 3, dan Sertifikat Partisipasi.
- Dilengkapi template elegan, nama tim, nama turnamen, tanggal, dan nomor sertifikat unik.
- Ekspor instan ke format PDF dan gambar resolusi tinggi (`jspdf` + `html2canvas`).

### 6. 👥 Manajemen Tim & Profil Pemain
- Profil tim lengkap dengan logo, riwayat keikutsertaan turnamen, statistik kemenangan, dan daftar roster.
- Lencana pemain (*Player Badges*) untuk pencapaian MVP, Top Eliminator, dan Juara Turnamen.

### 7. 🛡️ Panel Admin & Dashboard Organizer
- **Dashboard Analitik**: Pantau jumlah peserta, turnamen aktif, total pendapatan pendaftaran, dan grafik aktivitas.
- **Manajemen Kategori Game**: Kelola konfigurasi game (Free Fire, MLBB, PUBGM, Valorant, dll.).
- **Jadwal Pertandingan & Notifikasi**: Atur waktu pertandingan dan kirim notifikasi jadwal ke peserta.
- **Chat Turnamen Real-Time**: Ruang koordinasi langsung antara panitia dan perwakilan tim.

---

## 🛠️ Tech Stack

| Lapisan | Teknologi | Deskripsi |
|---|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Framework React modern dengan Server-Side Rendering (SSR) & Server Components |
| **Bahasa Pemrograman**| [TypeScript 5.7](https://www.typescriptlang.org/) | Type-safe coding untuk keandalan dan skalabilitas aplikasi |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) | Desain kustom berkinerja tinggi, dark/light mode, dan aksesibilitas standar industri |
| **Komponen & Ikon** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/) | Ikonografi modern dan toast notifications yang responsif |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Neon Serverless & Supabase) | Penyimpanan data relasional berkecepatan tinggi dengan pooling connection |
| **Autentikasi** | [NextAuth.js v5](https://authjs.dev/) / Supabase Auth | Manajemen sesi, enkripsi password (bcryptjs), dan role-based access (Admin/User) |
| **Dokumen & Media** | `html2canvas`, `jspdf` | Rendering visual klasemen dan cetak sertifikat ke format PDF |
| **Grafik & Analitik** | [Recharts](https://recharts.org/) | Visualisasi data analitik dan statistik pendaftaran turnamen |

---

## 🎯 Cara Kerja Hitung Poin (OCR)

```
[ Screenshot Hasil Match ]
            │
            ▼
┌────────────────────────┐
│  Upload ke GridPlay   │  -> Mendukung PNG, JPG, JPEG (Screenshot in-game)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   Optical Character    │  -> Membaca kolom Rank, Nama Tim, dan Kill
│    Recognition (OCR)   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Kalkulasi Regulasi    │  -> Rank 1 (12 pt), Rank 2 (9 pt), +1 pt per Kill, dll.
│    (Standar FFWS)      │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   Papan Klasemen HD    │  -> Ekspor Gambar / Bagikan / Hubungkan ke OBS Overlay
└────────────────────────┘
```

---

## 🚀 Instalasi & Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.18 atau lebih baru
- [npm](https://www.npmjs.com/) atau [pnpm](https://pnpm.io/)
- Akun dan database PostgreSQL ([Neon](https://neon.tech/) atau [Supabase](https://supabase.com/))

### Langkah-langkah

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/rayyanbabab/Tournament-Game.git
   cd Tournament-Game
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Lalu lengkapi konfigurasi berikut di `.env.local`:
   ```env
   # NextAuth
   AUTH_SECRET=rahasia-string-acak-minimal-32-karakter
   NEXTAUTH_URL=http://localhost:3000
   AUTH_TRUST_HOST=true

   # PostgreSQL Database (Neon / Supabase)
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

4. **Inisialisasi Database:**
   Jalankan file SQL yang tersedia (seperti `database.sql`, `neon_schema.sql`, `certificates.sql`) pada query editor PostgreSQL Anda untuk membuat tabel-tabel utama.

5. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

6. **Build untuk Produksi:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Struktur Direktori

```text
├── app/                              # Next.js App Router
│   ├── admin/                        # Panel Admin (Turnamen, Sertifikat, Kategori, Analytics)
│   ├── api/                          # REST API Endpoints (Sync status, Webhooks, dll.)
│   ├── auth/                         # Autentikasi (Login, Signup)
│   ├── cara-membuat-turnamen-free-fire/ # Halaman panduan SEO turnamen
│   ├── dashboard/                    # User Dashboard (Tim, Sertifikat, Billing, Pengaturan)
│   ├── hitung-point/ & ocr/          # Fitur OCR kalkulator hitung poin otomatis
│   ├── leaderboard/                  # Papan peringkat tim dan pemain
│   ├── news/                         # Berita & artikel esports
│   ├── overlay/                      # Halaman overlay klasemen live untuk OBS Studio
│   ├── sistem-point-turnamen-free-fire/ # Panduan sistem penilaian & regulasi poin
│   ├── tournaments/                  # Detail turnamen, registrasi, & bracket
│   ├── globals.css                   # Global styles & tema Tailwind CSS v4
│   └── page.tsx                      # Landing page utama GridPlay
├── components/                       # Komponen antarmuka (UI Components)
│   ├── admin/                        # Komponen khusus panel admin (Sidebar, tabel, dsb.)
│   ├── ocr-calculator/               # Komponen Scanner & parser OCR hasil pertandingan
│   ├── user/                         # Komponen dashboard pengguna
│   ├── gridplay-logo.tsx             # Brand logo GridPlay
│   ├── navbar.tsx                    # Navigasi utama
│   └── footer.tsx                    # Footer aplikasi
├── lib/                              # Utilitas, koneksi database, dan helper fungsi
├── public/                           # Aset statis (Gambar game, icon, dsb.)
├── database.sql                      # Schema SQL PostgreSQL
└── package.json                      # Konfigurasi dependensi dan skrip proyek
```

---

## 🔒 Keamanan & Kebijakan Data

- **Penyimpanan Password**: Menggunakan hashing *bcryptjs* dengan salt rounds standar keamanan tinggi.
- **Environment Safety**: Kunci akses database dan token rahasia tidak pernah diekspos ke klien (*client-side*).
- **Validasi Input**: Validasi skema ketat menggunakan *Zod* dan *React Hook Form* untuk mencegah SQL Injection dan data korup.

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Jika Anda memiliki saran fitur, laporan bug, atau ingin berkontribusi:
1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan Anda (`git commit -m "Menambahkan fitur X"`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Ajukan **Pull Request**

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**. Silakan gunakan dan kembangkan sesuai kebutuhan Anda.

<div align="center">
  Dibuat dengan ❤️ untuk kemajuan komunitas Esports Indonesia.
</div>

# Design Direction: GameArena (Esports League Platform)

> Arah desain visual dan pedoman identitas untuk platform pendaftaran & turnamen kompetitif GameArena.
> Mode Antislop: Dial ENERGY 2 / RHYTHM 2 / MOTION 1

---

## 1. Brand Identity & Character

- **Produk**: Platform pendaftaran dan manajemen turnamen esports daring untuk tim, komunitas, dan turnamen organizer di Indonesia (Mobile Legends, PUBG Mobile, Valorant, Free Fire, Dota 2).
- **Target Pengguna**: Pemain kompetitif, kapten tim, dan penyelenggara turnamen gaming.
- **Karakter Visual**: Kompetitif, presisi, taktis, dan tepercaya (seperti arena esports profesional ESL / VCT / Liquipedia), bukan sekadar landing page startup AI generik dengan bola ungu melayang.

---

## 2. Palette Sistem (Maksimal 3 Warna Inti + 1 Aksen Terarah)

| Peran | Token / Nilai | Alasan & Tujuan |
|---|---|---|
| **Neutral Base (Dark)** | Slate Charcoal `oklch(0.12 0.02 245)` (`#0B0F19`) | Latar belakang gelap yang tenang, kontras tinggi untuk teks dan kartu data pertandingan. |
| **Neutral Base (Light)**| Crisp Off-White `oklch(0.98 0.005 240)` (`#F8FAFC`) | Latar belakang terang yang jernih, profesional, dan nyaman di mata tanpa silau. |
| **Surface Cards** | Solid Dark Slate `oklch(0.16 0.02 245)` / Crisp White | Permukaan kartu solid dengan pembatas border tipis berbobot, bukan kaca/blur di semua sudut. |
| **Core Brand Color** | Cobalt Blue `oklch(0.55 0.22 255)` (`#2563EB`) | Identitas esports yang tegas, fokus, dan profesional untuk tombol tindakan utama (CTA) & seleksi. |
| **Accent 1 (Prize/Stakes)**| Amber Gold `oklch(0.75 0.18 80)` (`#F59E0B`) | Aksen terarah khusus hadiah turnamen (Prize Pool) dan peringkat 1 Hall of Fame. |
| **Status Signals** | Emerald `oklch(0.65 0.18 150)` & Rose `oklch(0.58 0.22 25)` | Indikator status pertandingan fungsional: Open/Live (Hijau) & Closed/Full (Merah). |

> **Pantangan Warna**: Dilarang menggunakan gradien ungu-ke-pink sembarangan, glow orbs di balik hero, atau teks gradien pelangi tanpa fungsi hierarki.

---

## 3. Typography & Spacing

- **Heading**: Sans-serif tegas (Geist / Inter / system font) dengan tracking normal, ukuran proporsional terhadap kontainer.
- **Data & Angka**: Menggunakan `tabular-nums` untuk skor, kuota slot tim, prize pool, dan countdown timer agar tata letak tidak bergeser saat data berubah.
- **Label Status**: Huruf proporsional kapitalisasi wajar (Sentence case atau Title case), hindari uppercase dengan letter-spacing ekstrem.

---

## 4. Liveliness Dials & Levers

- **ENERGY: 2 (Balanced)** — Cukup bertenaga untuk merefleksikan adrenalin gaming kompetitif, tetapi disiplin dan tidak berisik.
- **RHYTHM: 2 (Varied)** — Struktur berganti dinamis: Marquee Featured Match di puncak, grid turnamen aktif berbasis slot, leaderboard peringkat tim/pemain riil, dan feed pendaftaran live.
- **MOTION: 1 (Calm)** — Interaksi hover tombol dan transisi tab yang responsif dan cepat (150-200ms). Tidak ada elemen yang terus-menerus bergoyang/melayang (`floatA`/`floatB`) tanpa interaksi pengguna.
- **Keystone Element**: Kartu Turnamen Kompetitif dengan visual cover game nyata, badge game, deadline pendaftaran jelas, dan bar kapasitas kuota tim terisi.

---

## 5. Clean Copywriting Rules

- Hapus semua buzzword klise AI seperti: *"Next-Gen AI Platform"*, *"Seamless Gaming Synergy"*, *"Cutting-Edge Experience"*.
- Gunakan bahasa lugas dan nyata khas esports Indonesia: *"Pendaftaran Turnamen"*, *"Bentuk Tim & Roster"*, *"Bagan Pertandingan"*, *"Prize Pool Resmi"*.
- Tanpa klaim fiktif atau angka palsu: hanya tampilkan statistik turnamen dan tim yang bersumber dari database riil.

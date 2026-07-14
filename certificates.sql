-- =====================================================
-- SERTIFIKAT DIGITAL - SKEMA DATABASE
-- Jalankan di Supabase SQL Editor
-- =====================================================

-- Tabel untuk menyimpan hasil/ranking turnamen
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL, -- 1 = Juara 1, 2 = Juara 2, 3 = Juara 3, 0 = Participant
  notes TEXT, -- catatan tambahan
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, team_id),
  UNIQUE(tournament_id, rank) -- tidak ada 2 tim dengan rank yang sama (kecuali rank 0)
);

-- Disable unique constraint for rank = 0 (participants)
-- Kita handle di aplikasi

ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa lihat hasil turnamen
CREATE POLICY "Tournament results viewable by everyone."
  ON public.tournament_results FOR SELECT USING (true);

-- Hanya admin yang bisa insert/update/delete
CREATE POLICY "Admins can manage tournament results."
  ON public.tournament_results FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- Tambah kolom certificate_template ke tournaments
-- Untuk menyimpan kustomisasi template sertifikat
-- =====================================================
ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS certificate_template JSONB DEFAULT '{
    "primary_color": "#7c3aed",
    "secondary_color": "#a855f7",
    "organizer_name": "GameArena",
    "organizer_signature": null
  }'::jsonb;

-- =====================================================
-- Helper: ambil semua peserta yang approved untuk satu turnamen
-- (dipakai untuk generate sertifikat partisipan)
-- =====================================================
CREATE OR REPLACE FUNCTION get_tournament_certificate_data(p_tournament_id UUID)
RETURNS TABLE (
  registration_id UUID,
  team_id UUID,
  team_name TEXT,
  tournament_name TEXT,
  game TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  rank INTEGER,
  rank_label TEXT,
  prize_pool TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.id AS registration_id,
    t.id AS team_id,
    t.name AS team_name,
    tn.name AS tournament_name,
    tn.game,
    tn.start_date,
    tn.end_date,
    COALESCE(res.rank, 0) AS rank,
    CASE
      WHEN res.rank = 1 THEN 'Juara 1'
      WHEN res.rank = 2 THEN 'Juara 2'
      WHEN res.rank = 3 THEN 'Juara 3'
      ELSE 'Peserta'
    END AS rank_label,
    tn.prize_pool
  FROM public.tournament_registrations tr
  JOIN public.teams t ON t.id = tr.team_id
  JOIN public.tournaments tn ON tn.id = tr.tournament_id
  LEFT JOIN public.tournament_results res
    ON res.tournament_id = tr.tournament_id AND res.team_id = tr.team_id
  WHERE tr.tournament_id = p_tournament_id
    AND tr.status = 'approved'
  ORDER BY COALESCE(res.rank, 999), t.name;
END;
$$;

-- Hapus constraint unique yang bermasalah untuk rank 0 dan buat partial unique
-- Hanya rank 1, 2, 3 yang harus unik per tournament
CREATE UNIQUE INDEX IF NOT EXISTS unique_top_rank_per_tournament
  ON public.tournament_results (tournament_id, rank)
  WHERE rank > 0;

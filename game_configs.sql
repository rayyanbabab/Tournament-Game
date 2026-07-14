-- Tabel konfigurasi game untuk CRUD di admin
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.game_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  value text UNIQUE NOT NULL,          -- key unik, dipakai di kolom 'game' tabel tournaments
  label text NOT NULL,
  emoji text NOT NULL DEFAULT '🎮',
  category text NOT NULL DEFAULT 'Other',
  default_mode text NOT NULL DEFAULT 'bracket', -- 'leaderboard' | 'bracket' | 'league'
  scoring_preset text,                 -- 'ffim' | 'pmgc' (untuk leaderboard)
  maps text[],                         -- daftar map (untuk leaderboard)
  default_bracket_format text,         -- 'single' | 'double' | 'group_playoffs'
  default_league_slot integer DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.game_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read game_configs" ON public.game_configs
  FOR SELECT USING (true);

CREATE POLICY "Admin full access game_configs" ON public.game_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed data (game default)
INSERT INTO public.game_configs (value, label, emoji, category, default_mode, scoring_preset, maps, default_bracket_format, default_league_slot) VALUES
  ('Free Fire',        'Free Fire',        '🔥', 'Battle Royale', 'leaderboard', 'ffim', ARRAY['Bermuda','Purgatory','Kalahari','Alpine','Nextera','Solara'], NULL, NULL),
  ('PUBG Mobile',      'PUBG Mobile',      '🔫', 'Battle Royale', 'leaderboard', 'pmgc', ARRAY['Erangel','Miramar','Sanhok','Vikendi','Livik'], NULL, NULL),
  ('Mobile Legends',   'Mobile Legends',   '⚔️', 'MOBA',          'bracket', NULL, NULL, 'single', NULL),
  ('Dota 2',           'Dota 2',           '🧙', 'MOBA',          'bracket', NULL, NULL, 'double', NULL),
  ('League of Legends','League of Legends','🦁', 'MOBA',          'bracket', NULL, NULL, 'single', NULL),
  ('Valorant',         'Valorant',         '🎯', 'FPS',           'bracket', NULL, NULL, 'single', NULL),
  ('CS:GO / CS2',      'CS:GO / CS2',      '💣', 'FPS',           'bracket', NULL, NULL, 'double', NULL),
  ('eFootball',        'eFootball',        '⚽', 'Sports',        'league',  NULL, NULL, NULL, 24),
  ('FIFA',             'FIFA',             '🏆', 'Sports',        'league',  NULL, NULL, NULL, 24),
  ('Other',            'Other',            '🎮', 'Other',         'bracket', NULL, NULL, 'single', NULL)
ON CONFLICT (value) DO NOTHING;

-- Create site_settings table for landing page content management
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Site settings viewable by everyone." ON public.site_settings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admins can manage site settings." ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Insert default values
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_badge', 'Platform Turnamen Gaming Terbaik'),
  ('hero_title', 'Kelola Turnamen'),
  ('hero_title2', 'Gaming Anda'),
  ('hero_subtitle', 'Platform lengkap untuk mendaftar, mengelola tim, dan mengikuti turnamen gaming favoritmu. Dari pendaftaran hingga pengumuman pemenang.'),
  ('hero_cta_primary', 'Mulai Sekarang Gratis'),
  ('hero_cta_secondary', 'Lihat Turnamen'),
  ('stat1_value', '1,200+'),
  ('stat1_label', 'Gamer Terdaftar'),
  ('stat2_value', '340+'),
  ('stat2_label', 'Tim Aktif'),
  ('stat3_value', 'Rp 50 Jt+'),
  ('stat3_label', 'Total Prize Pool'),
  ('cta_title', 'Siap Untuk Berkompetisi?'),
  ('cta_subtitle', 'Bergabung dengan ribuan gamer lainnya dan buktikan kemampuan tim Anda di turnamen resmi.'),
  ('site_name', 'GameArena'),
  ('site_tagline', 'Platform Turnamen Gaming Indonesia')
ON CONFLICT (key) DO NOTHING;

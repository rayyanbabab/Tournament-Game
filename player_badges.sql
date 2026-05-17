-- Run in Supabase SQL Editor (optional: for admin-awarded badges)
CREATE TABLE IF NOT EXISTS public.player_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_slug)
);
ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Badges viewable by everyone." ON public.player_badges;
CREATE POLICY "Badges viewable by everyone." ON public.player_badges FOR SELECT USING (true);

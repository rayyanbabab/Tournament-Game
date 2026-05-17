-- =============================================
-- Migration: Match Schedule & In-App Notifications
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add schedule + score columns to matches table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS score_team1 INTEGER;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS score_team2 INTEGER;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Matches viewable by everyone." ON public.matches;
DROP POLICY IF EXISTS "Admins can manage matches." ON public.matches;

CREATE POLICY "Matches viewable by everyone." ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage matches." ON public.matches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications." ON public.notifications;

CREATE POLICY "Users can view own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications." ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications." ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

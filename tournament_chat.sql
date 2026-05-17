-- =============================================
-- Migration: Tournament Announcements & Live Chat
-- Run in Supabase SQL Editor
-- =============================================

-- Live chat messages table
CREATE TABLE IF NOT EXISTS public.tournament_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tournament_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages." ON public.tournament_messages;
DROP POLICY IF EXISTS "Participants can send messages." ON public.tournament_messages;
DROP POLICY IF EXISTS "Admins can delete messages." ON public.tournament_messages;

-- Approved participants AND admins can read
CREATE POLICY "Participants can view messages." ON public.tournament_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.tournament_registrations tr
      WHERE tr.tournament_id = tournament_messages.tournament_id
        AND tr.registered_by = auth.uid()
        AND tr.status = 'approved'
    )
  );

-- Approved participants AND admins can insert
CREATE POLICY "Participants can send messages." ON public.tournament_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR EXISTS (
        SELECT 1 FROM public.tournament_registrations tr
        WHERE tr.tournament_id = tournament_messages.tournament_id
          AND tr.registered_by = auth.uid()
          AND tr.status = 'approved'
      )
    )
  );

-- Admins can delete messages
CREATE POLICY "Admins can delete messages." ON public.tournament_messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_messages;

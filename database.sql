-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, COALESCE(new.raw_user_meta_data->>'role', 'user'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_teams INTEGER NOT NULL,
  team_size INTEGER NOT NULL,
  prize_pool TEXT,
  rules TEXT,
  image_url TEXT,
  registration_fee TEXT,
  location TEXT,
  contact_info TEXT,
  created_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments viewable by everyone." ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can create tournaments." ON public.tournaments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update tournaments." ON public.tournaments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  captain_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams viewable by everyone." ON public.teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams." ON public.teams FOR INSERT WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Team leader can update team." ON public.teams FOR UPDATE USING (auth.uid() = captain_id);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  in_game_name TEXT,
  in_game_id TEXT,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members viewable by everyone." ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team leaders can manage members." ON public.team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
);

-- Create tournament_registrations table
CREATE TABLE public.tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  registered_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations viewable by everyone." ON public.tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Team leaders can register." ON public.tournament_registrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_id AND teams.captain_id = auth.uid())
);
CREATE POLICY "Admins can update registration status." ON public.tournament_registrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Add new columns to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS discord_link TEXT;

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('team_logos', 'team_logos', true) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for team_logos
CREATE POLICY "Team logos are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'team_logos');
CREATE POLICY "Users can upload team logos." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team_logos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their team logos." ON storage.objects FOR UPDATE USING (bucket_id = 'team_logos' AND auth.role() = 'authenticated');


ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;


-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY "Avatars are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');


ALTER TABLE public.profiles RENAME COLUMN phone_number TO phone;


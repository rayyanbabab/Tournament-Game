-- ============================================================
-- Auto Status Update (TANPA pg_cron)
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- 0. Hapus function lama jika ada (untuk menghindari konflik return type)
DROP FUNCTION IF EXISTS public.sync_tournament_statuses() CASCADE;
DROP FUNCTION IF EXISTS public.check_tournament_full_on_registration() CASCADE;

-- 1. Function untuk update status semua turnamen
CREATE OR REPLACE FUNCTION public.sync_tournament_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
  new_status TEXT;
  approved_count INTEGER;
BEGIN
  FOR rec IN
    SELECT t.id, t.status, t.start_date, t.end_date,
           t.registration_deadline, t.max_teams
    FROM public.tournaments t
    WHERE t.status != 'cancelled'
  LOOP
    SELECT COUNT(*) INTO approved_count
    FROM public.tournament_registrations
    WHERE tournament_id = rec.id AND status = 'approved';

    IF NOW() > rec.end_date THEN
      new_status := 'completed';
    ELSIF NOW() >= rec.start_date AND NOW() <= rec.end_date THEN
      new_status := 'ongoing';
    ELSIF (NOW() >= rec.registration_deadline AND NOW() < rec.start_date)
       OR (approved_count >= rec.max_teams) THEN
      new_status := 'registration_closed';
    ELSE
      new_status := 'upcoming';
    END IF;

    IF rec.status != new_status THEN
      UPDATE public.tournaments
      SET status = new_status
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$;

-- 2. Trigger: langsung update saat slot penuh
CREATE OR REPLACE FUNCTION public.check_tournament_full_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approved_count INTEGER;
  max_slots INTEGER;
BEGIN
  IF NEW.status = 'approved' THEN
    SELECT COUNT(*) INTO approved_count
    FROM public.tournament_registrations
    WHERE tournament_id = NEW.tournament_id AND status = 'approved';

    SELECT max_teams INTO max_slots
    FROM public.tournaments
    WHERE id = NEW.tournament_id;

    IF approved_count >= max_slots THEN
      UPDATE public.tournaments
      SET status = 'registration_closed'
      WHERE id = NEW.tournament_id AND status = 'upcoming';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_tournament_full ON public.tournament_registrations;
CREATE TRIGGER trg_check_tournament_full
  AFTER INSERT OR UPDATE ON public.tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tournament_full_on_registration();

-- 3. Jalankan sync sekarang
SELECT public.sync_tournament_statuses();

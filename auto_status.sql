-- ============================================================
-- Auto Status Update untuk Turnamen
-- Jalankan di Supabase SQL Editor
-- ============================================================

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
    WHERE t.status != 'cancelled'  -- jangan ubah yang sudah dibatalkan admin
  LOOP
    -- Hitung slot yang sudah terisi (approved)
    SELECT COUNT(*) INTO approved_count
    FROM public.tournament_registrations
    WHERE tournament_id = rec.id AND status = 'approved';

    -- Tentukan status baru
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

    -- Update hanya jika berubah
    IF rec.status != new_status THEN
      UPDATE public.tournaments
      SET status = new_status
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$;

-- 2. Aktifkan pg_cron (jika belum aktif di project Supabase)
-- Perlu ke: Dashboard → Database → Extensions → aktifkan "pg_cron"

-- 3. Jadwalkan cron job setiap 5 menit
SELECT cron.schedule(
  'sync-tournament-statuses',   -- nama job
  '*/5 * * * *',                -- setiap 5 menit
  'SELECT public.sync_tournament_statuses();'
);

-- 4. (Opsional) Cek daftar cron job aktif
-- SELECT * FROM cron.job;

-- 5. (Opsional) Hapus cron job jika ingin ganti jadwal
-- SELECT cron.unschedule('sync-tournament-statuses');

-- 6. Trigger otomatis saat ada pendaftaran baru (slot penuh langsung update)
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

-- 7. Jalankan sekali sekarang untuk sync status yang sudah lewat
SELECT public.sync_tournament_statuses();

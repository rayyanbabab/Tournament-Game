-- Script: Kosongkan Database (Kecuali Admin)
-- Menggunakan DO block agar aman meskipun ada tabel yang belum dibuat

DO $$ 
BEGIN
    -- 1. Hapus data secara dinamis (abaikan jika tabel tidak ada)
    BEGIN EXECUTE 'DELETE FROM public.notifications;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.tournament_messages;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.matches;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.tournament_registrations;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.team_members;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.player_badges;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.teams;'; EXCEPTION WHEN undefined_table THEN END;
    BEGIN EXECUTE 'DELETE FROM public.tournaments;'; EXCEPTION WHEN undefined_table THEN END;

    -- 2. Hapus semua pengguna (User) biasa dari auth
    -- Profil user akan otomatis terhapus berkat ON DELETE CASCADE.
    DELETE FROM auth.users 
    WHERE id IN (
      SELECT id FROM public.profiles WHERE role != 'admin' OR role IS NULL
    );
END $$;

ALTER TABLE public.tournament_registrations ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

INSERT INTO storage.buckets (id, name, public) VALUES ('payment_proofs', 'payment_proofs', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Payment proofs viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'payment_proofs');
CREATE POLICY "Users can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment_proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update payment proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'payment_proofs' AND auth.role() = 'authenticated');

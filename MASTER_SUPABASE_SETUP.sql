-- ==========================================
-- THE ULTIMATE SUPABASE SETUP & FIX SCRIPT
-- ==========================================
-- 1. Create the Database Table exactly how it needs to be
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Force Overwrite any old database rules that threw errors
ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.media;
DROP POLICY IF EXISTS "Allow admin manage" ON public.media;
DROP POLICY IF EXISTS "Enable all actions for everyone" ON public.media;

-- Create one master rule for the table since frontend handles password
CREATE POLICY "Enable all actions for everyone"
ON public.media FOR ALL
USING (true)
WITH CHECK (true);

-- Enable RLS safely
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Fix the Storage Bucket to allow uploading
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean out any conflicting old storage rules
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Insert final safe storage rules
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE USING (bucket_id = 'media');

-- ALL DONE! YOU CAN UPLOAD FREELY.

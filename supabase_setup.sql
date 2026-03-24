-- Create the 'media' table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Policy: Allow everyone to read media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow admin manage" ON public.media FOR ALL USING (auth.role() = 'authenticated');

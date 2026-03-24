-- Make sure RLS is physically disabled so our admin dashboard can insert freely
-- (since our frontend handles the password lock)

-- Disable RLS entirely to stop the errors
ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;

-- As a backup, drop any policies that might be hanging around and recreate an open policy
DROP POLICY IF EXISTS "Allow public read access" ON public.media;
DROP POLICY IF EXISTS "Allow admin manage" ON public.media;

CREATE POLICY "Enable all actions for everyone"
ON public.media FOR ALL
USING (true)
WITH CHECK (true);

-- Then re-enable just so it uses the 'Allow all' policy
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

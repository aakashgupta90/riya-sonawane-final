-- 1. Insert the 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public to READ from the 'media' bucket
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 3. Allow public (including anon) to UPLOAD to the 'media' bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- 4. Allow public (including anon) to DELETE from the 'media' bucket
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

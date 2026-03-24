CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all actions for everyone" ON public.content;

CREATE POLICY "Enable all actions for everyone"
ON public.content FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Insert default starter values
INSERT INTO public.content (key, value, description) VALUES
('home_typing_text', 'Some stories don''t start with love...', 'The small italic text above the main title on Home page'),
('home_title_main', 'Hunny''s', 'The main large white title text'),
('home_title_accent', 'Birthday.', 'The colored accent text next to the main title'),
('music_url', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Direct link to background MP3 music'),
('final_message_quote', 'Every year with you is better than the last. You make life feel like a movie, and I''m so grateful to play a part in your story.', 'The big paragraph quote on the final reveal page')
ON CONFLICT (key) DO NOTHING;

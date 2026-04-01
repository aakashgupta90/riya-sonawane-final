-- ==========================================
-- ACTIVITY LOGS TABLE SETUP
-- ==========================================
-- Tracks all admin actions: uploads, edits, deletes

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL CHECK (action IN ('ADD', 'UPDATE', 'DELETE')),
    page TEXT,
    section TEXT,
    field TEXT,
    old_value TEXT,
    new_value TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security: Same open policy as other tables (frontend handles auth)
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all actions for everyone" ON public.activity_logs;

CREATE POLICY "Enable all actions for everyone"
ON public.activity_logs FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ALL DONE! Activity logging is ready.

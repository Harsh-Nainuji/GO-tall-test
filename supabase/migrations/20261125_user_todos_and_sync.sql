-- ============================================================================
-- GoTall User Todos Schema & Multi-Device Sync Migration
-- Migration: 20261125_user_todos_and_sync.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_todos (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Habit',
    icon TEXT DEFAULT '✨',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    is_default BOOLEAN DEFAULT FALSE,
    todo_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos(user_id);
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_todos' AND policyname = 'Users can manage own todos'
    ) THEN
        CREATE POLICY "Users can manage own todos" ON public.user_todos
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

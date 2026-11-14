-- ============================================================================
-- GoTall Mobile Suite Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================================

-- 1. WATER LOGS TABLE
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    size_label TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, logged_date);
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'water_logs' AND policyname = 'Users can manage own water logs'
    ) THEN
        CREATE POLICY "Users can manage own water logs" ON public.water_logs
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 2. SLEEP LOGS TABLE
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bedtime TEXT,
    wakeup_time TEXT,
    hours NUMERIC(4, 1) NOT NULL CHECK (hours >= 0),
    quality TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, logged_date);
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sleep_logs' AND policyname = 'Users can manage own sleep logs'
    ) THEN
        CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. PROFILES COLUMN EXTENSIONS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal_ml INTEGER DEFAULT 2500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_questions_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_window_start BIGINT;

-- 4. ACHIEVEMENTS COLUMN EXTENSION (for custom uploaded badge icons)
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- 5. STORAGE BUCKET FOLDER PERMISSIONS (exercise-media/badges/)
-- Ensure public read for exercise-media
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'exercise-media'
    ) THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-media', 'exercise-media', true);
    END IF;
END $$;

-- =============================================================================
-- WORKOUT CATEGORIES, STRETCH ASSIGNMENTS & CATEGORY QUESTIONS SCHEMA
-- =============================================================================

-- 1. WORKOUT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.workout_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT '🌱',
    description TEXT,
    color TEXT NOT NULL DEFAULT '#0284C7',
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORY WORKOUT ASSIGNMENT JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.category_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.workout_categories(id) ON DELETE CASCADE,
    stretch_id INTEGER REFERENCES public.stretches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, stretch_id)
);

-- 3. CATEGORY DIAGNOSTIC ONBOARDING QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.category_questions (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.workout_categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    subtitle TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SLEEP LOGS TABLE (For Sleep Tracking & Biometric Arithmetic)
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bedtime TEXT,
    wakeup_time TEXT,
    hours NUMERIC(4, 2) NOT NULL,
    quality TEXT DEFAULT 'Restful Deep Sleep',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories and questions
CREATE POLICY "Allow public read on active workout categories"
ON public.workout_categories FOR SELECT USING (active = true);

CREATE POLICY "Allow public read on category workouts"
ON public.category_workouts FOR SELECT USING (true);

CREATE POLICY "Allow public read on active category questions"
ON public.category_questions FOR SELECT USING (active = true);

-- User-scoped sleep logs
CREATE POLICY "Users can manage own sleep logs"
ON public.sleep_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Seed Base Categories
INSERT INTO public.workout_categories (id, name, slug, icon, description, color, order_index)
VALUES
('cat-1', 'Height Growth & Spinal Decompression', 'height-growth', '🌱', 'Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.', '#0284C7', 1),
('cat-2', 'Postural Alignment & Cervical Reset', 'posture-alignment', '📐', 'Reverses forward head tilt and text-neck kyphosis to reclaim compressed standing stature.', '#10B981', 2),
('cat-3', 'Core & Pelvic Stabilization', 'core-pelvic', '⚡', 'Corrects anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.', '#6366F1', 3),
('cat-4', 'Morning Axial Elongation', 'morning-elongation', '🌅', 'Circadian mobility wake-up sequence to expand vertebral joints for daytime upright stature.', '#F59E0B', 4),
('cat-5', 'Bedtime Disc Restoration', 'bedtime-restoration', '🌙', 'Releases daytime spinal compression before sleep to maximize slow-wave hGH disc uptake.', '#8B5CF6', 5)
ON CONFLICT (id) DO NOTHING;


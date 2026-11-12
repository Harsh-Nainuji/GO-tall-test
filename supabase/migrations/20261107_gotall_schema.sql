-- =============================================================================
-- GOTALL / TALLGRAM DATABASE SCHEMA MIGRATION
-- Unified Supabase PostgreSQL Schema for Mobile App & Web Admin Studio
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Biometrics & Clinical Stature Trajectory)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    age INTEGER,
    current_height NUMERIC(5, 2) NOT NULL, -- in cm
    predicted_height NUMERIC(5, 2) NOT NULL, -- in cm (Tanner model output)
    potential_gain NUMERIC(4, 2) NOT NULL, -- in cm
    growth_plate_status TEXT NOT NULL, -- 'Open (Accelerated)', 'Open (Decelerating)', 'Terminal Fusion Window', 'Fully Ossified'
    tanner_stage INTEGER DEFAULT 3,
    father_height NUMERIC(5, 2), -- in cm
    mother_height NUMERIC(5, 2), -- in cm
    mid_parental_target NUMERIC(5, 2), -- in cm
    streak_days INTEGER DEFAULT 1,
    subscription_tier TEXT DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Pro Monthly', 'Pro Annual')),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACHIEVEMENTS TABLE (Admin-Managed Gamification Badges)
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('streak', 'stretches', 'nutrition', 'sleep', 'biometrics')),
    target_metric TEXT NOT NULL, -- 'streak_days', 'stretches_completed', 'protein_target_hit', etc.
    target_value INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER ACHIEVEMENTS TABLE (Unlocked Badges)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 4. STRETCHES TABLE (Clinical Spinal Decompression Exercises)
CREATE TABLE IF NOT EXISTS public.stretches (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    tag TEXT NOT NULL,
    target_zone TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    intensity TEXT NOT NULL CHECK (intensity IN ('Beginner', 'Intermediate', 'Advanced')),
    clinical_benefit TEXT NOT NULL,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    contraindications TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MEALS TABLE (Verified Foods & Nutrition Database)
CREATE TABLE IF NOT EXISTS public.meals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serving_size TEXT NOT NULL,
    category TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein NUMERIC(5, 2) NOT NULL,
    carbs NUMERIC(5, 2) NOT NULL,
    fat NUMERIC(5, 2) NOT NULL,
    calcium INTEGER DEFAULT 0, -- in mg
    zinc NUMERIC(4, 2) DEFAULT 0, -- in mg
    vitamin_d3 INTEGER DEFAULT 0, -- in IU
    clinical_rationale TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DAILY LOGS TABLE (User Daily Habits & Retention Records)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(5, 2) DEFAULT 0,
    carbs NUMERIC(5, 2) DEFAULT 0,
    fat NUMERIC(5, 2) DEFAULT 0,
    completed_stretches JSONB DEFAULT '[]'::jsonb,
    sleep_hours NUMERIC(3, 1) DEFAULT 0,
    water_liters NUMERIC(3, 1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- 7. PAYMENTS TABLE (Subscription & In-App Purchase Records)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revenuecat_original_transaction_id TEXT UNIQUE,
    product_id TEXT,
    plan_name TEXT NOT NULL,
    amount_paise INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AI PROMPT CHIPS TABLE (Mobile Quick Suggestion Chips)
CREATE TABLE IF NOT EXISTS public.ai_prompt_chips (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    preset_response TEXT NOT NULL,
    clicks_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stretches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_chips ENABLE ROW LEVEL SECURITY;

-- Public read access for static CMS catalogs
CREATE POLICY "Public can view active achievements" ON public.achievements FOR SELECT USING (active = true);
CREATE POLICY "Public can view active stretches" ON public.stretches FOR SELECT USING (active = true);
CREATE POLICY "Public can view active preset meals" ON public.meals FOR SELECT USING (active = true AND user_id IS NULL);
CREATE POLICY "Public can view active prompt chips" ON public.ai_prompt_chips FOR SELECT USING (active = true);

-- User-scoped policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 4. MEALS TABLE RLS (PROTECT NUTRITION LOGS)
-- =============================================================================
CREATE POLICY "Users can manage own meals" 
ON public.meals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. USER ACHIEVEMENTS TABLE RLS (PROTECT GAMIFICATION)
-- =============================================================================
CREATE POLICY "Users can manage own achievements" 
ON public.user_achievements 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 6. PAYMENTS TABLE RLS (PROTECT FINANCIAL LOGS)
-- =============================================================================
-- Users can read their own payment history
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Prevent users from inserting/faking successful payment rows directly from the app.
-- RevenueCat webhooks updating the DB via Service Role Key will bypass this restriction safely.

-- =============================================================================
-- SEED DATA INSERTS
-- =============================================================================

-- Seed Achievements
INSERT INTO public.achievements (id, title, description, icon, category, target_metric, target_value, xp_reward, tier, active)
VALUES
('badge-1', 'Spine Alignment Pioneer', 'Complete your first clinical spinal decompression session.', '🧘', 'stretches', 'stretches_completed', 1, 50, 'bronze', true),
('badge-2', '7-Day Disc Traction Streak', 'Maintain 7 consecutive days of intervertebral decompression.', '🔥', 'streak', 'streak_days', 7, 200, 'silver', true),
('badge-3', 'Somatotropin Pulse Synced', 'Log 8+ hours of sleep during the slow-wave peak anabolic window.', '🌙', 'sleep', 'deep_sleep_hours', 8, 100, 'bronze', true),
('badge-4', 'Protein Synthesis Maxima', 'Hit 100g+ daily protein requirement for skeletal chondrocytes.', '🥩', 'nutrition', 'protein_target_hit', 100, 75, 'bronze', true),
('badge-5', '14-Day Epiphyseal Master', '14 days of unbroken multi-factorial protocol adherence.', '⚡', 'streak', 'streak_days', 14, 500, 'gold', true),
('badge-6', '100 Decompressions Milestone', 'Perform 100 cumulative spinal decompression sessions.', '🏆', 'stretches', 'stretches_completed', 100, 1000, 'platinum', true),
('badge-7', 'Tanner Baseline Calibrated', 'Complete the comprehensive 15-factor biometric diagnostic.', '🧬', 'biometrics', 'quiz_completed', 1, 150, 'silver', true),
('badge-8', 'Hydration Disc Guard', 'Meet full daily water and bone-mineral electrolyte quotas for 5 days.', '💧', 'nutrition', 'water_quota_met', 5, 250, 'silver', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Stretches
INSERT INTO public.stretches (id, title, tag, target_zone, duration_seconds, intensity, clinical_benefit, instructions, contraindications, sort_order)
VALUES
(1, 'Dead Hang Disc Traction', 'Axial Elongation', 'Lumbar & Thoracic', 60, 'Beginner', 'Creates negative intradiscal pressure using bodyweight, allowing synovial fluid to rehydrate compressed L1–L5 discs.', '["Grip overhead bar shoulder-width apart.", "Allow feet to hang freely.", "Breathe deeply and let gravity elongate your spine.", "Disengage smoothly."]', 'Shoulder impingement', 1),
(2, 'Cobra Pose (Bhujangasana)', 'Spine Decompression', 'Lumbar Lordosis', 45, 'Beginner', 'Promotes restorative lumbar lordosis and counteracts prolonged sedentary thoracic kyphosis.', '["Lie face down on mat with palms flat beneath shoulders.", "Gently press through palms to lift chest.", "Keep pelvis glued to mat.", "Inhale slowly into abdomen for 45s."]', 'Severe disc herniation', 2),
(3, 'Cat-Cow Posture Flow', 'Thoracic Mobility', 'Thoracic Articulation', 60, 'Beginner', 'Circulates synovial fluid across the 24 articulating vertebrae and improves thoracic extension.', '["Start on all fours with hands under shoulders.", "Inhale: Drop belly, lift chest (Cow).", "Exhale: Arch spine toward ceiling (Cat).", "Cycle rhythmically for 10-12 repetitions."]', NULL, 3)
ON CONFLICT (id) DO NOTHING;


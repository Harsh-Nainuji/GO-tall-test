-- =============================================================================
-- GOTALL COMPLETE DATABASE SETUP & MIGRATION SCRIPT
-- Project ID: xoxhmugmtzscmjlbpfuj
-- Instructions: Open Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
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
    current_height NUMERIC(5, 2) NOT NULL DEFAULT 172.4, -- in cm
    predicted_height NUMERIC(5, 2) NOT NULL DEFAULT 182.0, -- in cm
    potential_gain NUMERIC(4, 2) NOT NULL DEFAULT 9.6, -- in cm
    growth_plate_status TEXT NOT NULL DEFAULT 'Open (Accelerated)',
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
    target_metric TEXT NOT NULL,
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
    category TEXT NOT NULL DEFAULT 'Height Growth' CHECK (category IN ('Height Growth', 'Strength', 'Posture')),
    tag TEXT NOT NULL DEFAULT 'Axial Traction',
    target_zone TEXT NOT NULL DEFAULT 'Lumbar & Thoracic',
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    intensity TEXT NOT NULL DEFAULT 'Beginner' CHECK (intensity IN ('Beginner', 'Intermediate', 'Advanced')),
    clinical_benefit TEXT NOT NULL,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    contraindications TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('video', 'gif', 'image')),
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WORKOUT CATEGORIES TABLE
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

-- 6. CATEGORY WORKOUT ASSIGNMENT JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.category_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id TEXT REFERENCES public.workout_categories(id) ON DELETE CASCADE,
    stretch_id INTEGER REFERENCES public.stretches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, stretch_id)
);

-- 7. CATEGORY DIAGNOSTIC ONBOARDING QUESTIONS TABLE
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

-- 8. SLEEP LOGS TABLE (Dynamic Sleep Tracking & Arithmetic)
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    day_of_week TEXT,
    bedtime TEXT,
    wakeup_time TEXT,
    hours NUMERIC(4, 2) NOT NULL,
    quality TEXT DEFAULT 'Deep Restorative',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- 9. MEALS TABLE (Verified Foods & Nutrition Database)
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
    calcium INTEGER DEFAULT 0,
    zinc NUMERIC(4, 2) DEFAULT 0,
    vitamin_d3 INTEGER DEFAULT 0,
    clinical_rationale TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DAILY LOGS TABLE
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

-- 11. PAYMENTS TABLE
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

-- =============================================================================
-- STORAGE BUCKET: exercise-media
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-media', 'exercise-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for exercise-media
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-media');

-- Authenticated upload for exercise-media
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-media');

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stretches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active achievements" ON public.achievements FOR SELECT USING (active = true);
CREATE POLICY "Public can view active stretches" ON public.stretches FOR SELECT USING (active = true);
CREATE POLICY "Public can view active workout categories" ON public.workout_categories FOR SELECT USING (active = true);
CREATE POLICY "Public can view category workouts" ON public.category_workouts FOR SELECT USING (true);
CREATE POLICY "Public can view active category questions" ON public.category_questions FOR SELECT USING (active = true);
CREATE POLICY "Public can view active preset meals" ON public.meals FOR SELECT USING (active = true AND user_id IS NULL);

-- User-scoped policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own user_achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA INSERTS
-- =============================================================================

-- Seed Base Categories
INSERT INTO public.workout_categories (id, name, slug, icon, description, color, order_index)
VALUES
('cat-1', 'Height Growth & Spinal Decompression', 'height-growth', '🌱', 'Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.', '#0284C7', 1),
('cat-2', 'Postural Alignment & Cervical Reset', 'posture-alignment', '📐', 'Reverses forward head tilt and text-neck kyphosis to reclaim compressed standing stature.', '#10B981', 2),
('cat-3', 'Core & Pelvic Stabilization', 'core-pelvic', '⚡', 'Corrects anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.', '#6366F1', 3),
('cat-4', 'Morning Axial Elongation', 'morning-elongation', '🌅', 'Circadian mobility wake-up sequence to expand vertebral joints for daytime upright stature.', '#F59E0B', 4),
('cat-5', 'Bedtime Disc Restoration', 'bedtime-restoration', '🌙', 'Releases daytime spinal compression before sleep to maximize slow-wave hGH disc uptake.', '#8B5CF6', 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Stretches
INSERT INTO public.stretches (id, title, category, tag, target_zone, duration_seconds, intensity, clinical_benefit, instructions, contraindications, media_type, media_url, sort_order)
VALUES
(1, 'Dead Hang Disc Traction', 'Height Growth', 'Axial Elongation', 'Lumbar & Thoracic', 60, 'Beginner', 'Creates negative intradiscal pressure using bodyweight, allowing synovial fluid to rehydrate compressed L1–L5 discs.', '["Grip overhead bar shoulder-width apart.", "Allow feet to hang freely.", "Breathe deeply and let gravity elongate your spine.", "Disengage smoothly."]', 'Shoulder impingement', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 1),
(2, 'Cobra Pose (Bhujangasana)', 'Height Growth', 'Spine Decompression', 'Lumbar Lordosis', 45, 'Beginner', 'Promotes restorative lumbar lordosis and counteracts prolonged sedentary thoracic kyphosis.', '["Lie face down on mat with palms flat beneath shoulders.", "Gently press through palms to lift chest.", "Keep pelvis glued to mat.", "Inhale slowly into abdomen for 45s."]', 'Severe disc herniation', 'image', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 2),
(3, 'Cat-Cow Posture Flow', 'Posture', 'Thoracic Mobility', 'Thoracic Articulation', 60, 'Beginner', 'Circulates synovial fluid across the 24 articulating vertebrae and improves thoracic extension.', '["Start on all fours with hands under shoulders.", "Inhale: Drop belly, lift chest (Cow).", "Exhale: Arch spine toward ceiling (Cat).", "Cycle rhythmically for 10-12 repetitions."]', NULL, 'image', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', 3),
(4, 'Pelvic Shift & Glute Bridge', 'Strength', 'Lower Spine Release', 'Pelvic Neutralization', 60, 'Intermediate', 'Rebalances anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.', '["Lie supine with knees bent and feet flat on floor.", "Press lower back flat into floor.", "Drive through heels to lift hips in line with thighs.", "Hold peak squeeze for 3 seconds, lower slowly, and repeat."]', NULL, 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 4),
(5, 'Child’s Pose Extension', 'Height Growth', 'Full Back Decompression', 'Lumbar Paraspinal', 60, 'Beginner', 'Relaxes deep erector spinae musculature and opens posterior intervertebral disc spaces.', '["Kneel on floor with big toes touching, knees spread wide.", "Sit hips back onto heels and fold forward.", "Crawl fingertips forward to actively stretch latissimus dorsi.", "Breathe deeply into posterior ribcage for 60 seconds."]', NULL, 'image', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 5)
ON CONFLICT (id) DO NOTHING;

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

-- Seed Category Diagnostic Questions
INSERT INTO public.category_questions (id, category_id, question_text, subtitle, options, order_index)
VALUES
('cq-1', 'cat-1', 'Do you feel back tightness after sitting at school or studying?', 'Helps identify daily intradiscal compressive strain on lumbar vertebrae.', '[{"label": "Yes, constant stiffness", "sublabel": "Indicates high spinal disc fluid loss", "icon": "😣"}, {"label": "Only after 4+ hours", "sublabel": "Moderate postural loading", "icon": "⏱️"}, {"label": "Rarely / Never", "sublabel": "Discs maintain healthy hydration", "icon": "✨"}]'::jsonb, 1),
('cq-2', 'cat-2', 'Do your shoulders roll forward or head protrude while looking at your phone?', 'Identifies text-neck kyphosis, which can obscure 1.5–2.0 cm of standing stature.', '[{"label": "Severe forward tilt", "sublabel": "Text-neck is actively reducing height", "icon": "📱"}, {"label": "Slight slumping", "sublabel": "Can be corrected with scapular retraction", "icon": "🧍"}, {"label": "Upright clinical posture", "sublabel": "Full standing height unlocked", "icon": "🎖️"}]'::jsonb, 2),
('cq-3', 'cat-3', 'Does your lower back arch excessively when standing straight (pelvic tilt)?', 'Anterior pelvic tilt shifts the pelvis forward, hiding available leg and spinal height.', '[{"label": "Yes, noticeable arch", "sublabel": "Can regain +1 to +2 cm from neutral tilt", "icon": "🔄"}, {"label": "Neutral and balanced", "sublabel": "Optimal core pelvic alignment", "icon": "⚖️"}]'::jsonb, 3),
('cq-4', 'cat-5', 'Do you do any physical decompression before sleeping at night?', 'Discs rehydrate 80% of daily fluid during the first 4 hours of horizontal rest.', '[{"label": "Never, just go straight to bed", "sublabel": "Missing overnight growth expansion", "icon": "😴"}, {"label": "Sometimes light stretching", "sublabel": "Partial decompression benefit", "icon": "🧘"}, {"label": "Yes, dedicated routine", "sublabel": "Maximum overnight somatotropin sync", "icon": "🌙"}]'::jsonb, 4),
('cq-5', 'cat-6', 'What is your primary weight gain objective?', 'Calibrates daily caloric surplus and skeletal amino acid density targets.', '[{"label": "Lean Muscular Bulk (+3–5 kg)", "sublabel": "Athletic muscle with minimal fat gain", "icon": "💪"}, {"label": "Overcoming Fast Metabolism (+5–10 kg)", "sublabel": "Dense calorie protocols for hardgainers", "icon": "⚡"}, {"label": "Heavy Mass Building (+10+ kg)", "sublabel": "Substantial structural frame expansion", "icon": "🏋️"}]'::jsonb, 5),
('cq-6', 'cat-6', 'What describes your daily appetite & meal consistency?', 'Determines whether liquid nutrition or frequent meals are needed to hit surplus.', '[{"label": "Hardgainer (Get full very quickly)", "sublabel": "Needs liquid calorie density and shakes", "icon": "🥤"}, {"label": "Moderate (Eat 3 meals, hard to gain)", "sublabel": "Needs post-workout calorie booster", "icon": "🍽️"}, {"label": "Strong appetite (Can eat consistently)", "sublabel": "Focus on protein quality and heavy lifting", "icon": "🥩"}]'::jsonb, 6),
('cq-7', 'cat-7', 'What is your primary weight reduction focus?', 'Tailors cardio intervals and core decompression pacing to preserve posture.', '[{"label": "Belly fat reduction & posture reveal", "sublabel": "Eliminates abdominal weight pulling spine forward", "icon": "🎯"}, {"label": "Athletic recomp & waist slimming", "sublabel": "Reclaims narrow waist and height illusion", "icon": "⏳"}, {"label": "Total body transformation (-10+ kg)", "sublabel": "Comprehensive metabolic and mobility routine", "icon": "🔥"}]'::jsonb, 7),
('cq-8', 'cat-7', 'What is your biggest hurdle when maintaining a caloric deficit?', 'Adjusts bedtime nutrition to protect nocturnal somatotropin secretion.', '[{"label": "Late-night cravings & hunger", "sublabel": "We will optimize slow-digesting micellar casein", "icon": "🌙"}, {"label": "Afternoon energy crashes", "sublabel": "Balanced low-glycemic hydration strategies", "icon": "🔋"}, {"label": "Slow metabolism / plateau", "sublabel": "High-NEAT step targets and metabolic circuits", "icon": "📈"}]'::jsonb, 8),
('cq-9', 'cat-8', 'What is your resistance training experience level?', 'Calibrates mechanical tension and progressive overload volume.', '[{"label": "Beginner (<1 year lifting)", "sublabel": "Focus on compound form and spinal safety", "icon": "🌱"}, {"label": "Intermediate (1–3 years)", "sublabel": "Progressive overload with dedicated split", "icon": "⚡"}, {"label": "Advanced (3+ years)", "sublabel": "High-volume hypertrophy & micro-adjustments", "icon": "🏆"}]'::jsonb, 9),
('cq-10', 'cat-8', 'What is your primary aesthetic physique target?', 'Aligns exercises to accentuate vertical V-taper ratios.', '[{"label": "V-Taper (Wide lats & capped shoulders)", "sublabel": "Maximizes illusion of shoulder width & height", "icon": "📐"}, {"label": "Thick Chest & Spinal Extensors", "sublabel": "Upright clinical rib cage posture", "icon": "🛡️"}, {"label": "Full Body Symmetry & Power", "sublabel": "Balanced athletic hypertrophy", "icon": "⚡"}]'::jsonb, 10)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. RPC FUNCTION: PERMANENT ACCOUNT DELETION (RIGHT TO BE FORGOTTEN)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    curr_uid UUID := auth.uid();
BEGIN
    IF curr_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete all user data from public tables
    DELETE FROM public.profiles WHERE user_id = curr_uid;
    DELETE FROM public.user_achievements WHERE user_id = curr_uid;
    DELETE FROM public.food_logs WHERE user_id = curr_uid;
    DELETE FROM public.sleep_logs WHERE user_id = curr_uid;
    DELETE FROM public.stretches_progress WHERE user_id = curr_uid;

    -- Delete user from auth schema
    DELETE FROM auth.users WHERE id = curr_uid;
END;
$$;


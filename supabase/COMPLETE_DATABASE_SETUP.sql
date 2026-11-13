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

-- 1. Seed All 8 Base Workout Categories
INSERT INTO public.workout_categories (id, name, slug, icon, description, color, order_index)
VALUES
('cat-1', 'Height Growth & Spinal Decompression', 'height-growth', '🌱', 'Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.', '#0284C7', 1),
('cat-2', 'Postural Alignment & Cervical Reset', 'posture-alignment', '📐', 'Reverses forward head tilt and text-neck kyphosis to reclaim compressed standing stature.', '#10B981', 2),
('cat-3', 'Core & Pelvic Stabilization', 'core-pelvic', '⚡', 'Corrects anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.', '#6366F1', 3),
('cat-4', 'Morning Axial Elongation', 'morning-elongation', '🌅', 'Circadian mobility wake-up sequence to expand vertebral joints for daytime upright stature.', '#F59E0B', 4),
('cat-5', 'Bedtime Disc Restoration', 'bedtime-restoration', '🌙', 'Releases daytime spinal compression before sleep to maximize slow-wave hGH disc uptake.', '#8B5CF6', 5),
('cat-6', 'Weight Gain & Muscle Density', 'weight-gain', '🥩', 'Progressive structural hypertrophy and caloric surplus optimization for ectomorph frames.', '#EA580C', 6),
('cat-7', 'Weight Loss & Posture Reveal', 'weight-loss', '🔥', 'High-NEAT metabolic intervals and core toning to shed abdominal load pulling posture down.', '#EF4444', 7),
('cat-8', 'Bodybuilder Stature & V-Taper', 'bodybuilder', '🏋️', 'Scapular width and latissimus dorsi hypertrophy to create dramatic vertical presence.', '#059669', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index;

-- 2. Seed All 16 Clinical Stretches & Exercises
INSERT INTO public.stretches (id, title, category, tag, target_zone, duration_seconds, intensity, clinical_benefit, instructions, contraindications, media_type, media_url, sort_order)
VALUES
(1, 'Dead Hang Disc Traction', 'Height Growth', 'Axial Elongation', 'Lumbar & Thoracic', 60, 'Beginner', 'Creates negative intradiscal pressure using bodyweight, allowing synovial fluid to rehydrate compressed L1–L5 discs.', '["Grip overhead bar shoulder-width apart with an overhand grip.", "Allow feet to hang freely; keep core and shoulders relaxed.", "Breathe deeply and let gravity elongate your vertebral column.", "Disengage smoothly without jumping down abruptly."]'::jsonb, 'Shoulder impingement or acute wrist injury.', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 1),
(2, 'Cobra Pose (Bhujangasana)', 'Height Growth', 'Spine Decompression', 'Lumbar Lordosis', 45, 'Beginner', 'Promotes restorative lumbar lordosis and counteracts prolonged sedentary thoracic kyphosis.', '["Lie face down on mat with palms flat beneath shoulders.", "Engage glutes and gently press through palms to lift chest.", "Keep pelvis glued to mat and gaze forward.", "Hold position and inhale slowly into abdomen for 45s."]'::jsonb, 'Severe spondylolisthesis or active disc herniation.', 'image', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 2),
(3, 'Cat-Cow Posture Flow', 'Posture', 'Thoracic Mobility', 'Thoracic Articulation', 60, 'Beginner', 'Circulates synovial fluid across the 24 articulating vertebrae and improves thoracic extension.', '["Start on all fours with hands under shoulders, knees under hips.", "Inhale: Drop belly, lift chest and tailbone (Cow).", "Exhale: Arch spine toward ceiling, tucking chin (Cat).", "Cycle rhythmically with breath for 10-12 repetitions."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', 3),
(4, 'Pelvic Shift & Glute Bridge', 'Strength', 'Lower Spine Release', 'Pelvic Neutralization', 60, 'Intermediate', 'Rebalances anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.', '["Lie supine with knees bent and feet flat on floor, hip-width apart.", "Press lower back flat into floor (posterior pelvic tilt).", "Drive through heels to lift hips in line with thighs.", "Hold peak squeeze for 3 seconds, lower slowly, and repeat."]'::jsonb, NULL, 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 4),
(5, 'Child’s Pose Extension', 'Height Growth', 'Full Back Decompression', 'Lumbar Paraspinal', 60, 'Beginner', 'Relaxes deep erector spinae musculature and opens posterior intervertebral disc spaces.', '["Kneel on floor with big toes touching, knees spread wide.", "Sit hips back onto heels and fold forward, resting forehead on mat.", "Crawl fingertips forward to actively stretch latissimus dorsi.", "Breathe deeply into posterior ribcage for 60 seconds."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 5),
(6, 'Wall Angel Scapular Retraction', 'Posture', 'Cervical Alignment', 'Cervical & Upper Spine', 60, 'Intermediate', 'Reverses forward head posture (text neck) which typically causes 1.5 cm stature shortening.', '["Stand with heels, glutes, upper back, and head against wall.", "Bring arms into 90-degree goalpost position against wall.", "Slowly slide hands upward overhead while maintaining contact.", "Return to 90 degrees; repeat smoothly for 12 reps."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80', 6),
(7, 'Standing Axial Reach', 'Posture', 'Posture Alignment', 'Full Axial Column', 45, 'Beginner', 'De-rotates ribcage and elongates posterior longitudinal ligament before sleep.', '["Stand tall with feet hip-width apart.", "Interlock fingers overhead with palms facing ceiling.", "Reach upward while rising onto balls of feet.", "Hold tall alignment for 5 breaths, lower, and repeat."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 7),
(8, 'Kneeling Psoas Release', 'Strength', 'Vertebral Release', 'Hip Flexor / Pelvis', 60, 'Intermediate', 'Lengthens hypertonic psoas muscles that pull the lumbar spine into exaggerated lordosis.', '["Step right foot forward into 90-degree lunge, resting left knee on mat.", "Tuck pelvis under and gently shift weight forward into left hip.", "Raise left arm overhead and lean gently to right.", "Hold 30s per side for a total of 60 seconds."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 8),
(9, 'Incline Dumbbell Form & Clavicle Stretch', 'Strength', 'Pectoral Expansion', 'Upper Chest & Clavicle', 60, 'Intermediate', 'Expands the upper thoracic rib cage and stimulates clavicular bone mineralization for broader posture.', '["Position torso on a 30-degree incline surface with dumbbells at shoulder height.", "Press upward in an arc, focusing on upper pectoral contraction.", "Lower slowly over 3 seconds to achieve a deep stretch across the sternum.", "Perform 4 sets with controlled breathing."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', 9),
(10, 'Romanian Deadlift Spinal Hip Hinge', 'Strength', 'Posterior Chain Density', 'Erector Spinae & Hamstrings', 60, 'Intermediate', 'Strengthens the deep paraspinal muscle columns to keep the spinal column naturally upright against gravity.', '["Stand feet hip-width apart holding weight with shoulders retracted.", "Hinge at hips, driving pelvis backward while keeping back strictly flat.", "Lower bar to mid-shin level until hamstrings are fully engaged.", "Drive through heels to return to tall standing lock."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', 10),
(11, 'Goblet Squat & Thoracic Wedge', 'Strength', 'Axial Loading', 'Pelvis & Femoral Plates', 60, 'Intermediate', 'Loads the lower extremity long bones to stimulate growth factors and anabolic hormone secretion.', '["Hold dumbbell vertically against chest with elbows pointing down.", "Squat deep between knees while maintaining an upright vertical chest.", "Hold bottom position for 1 second to stretch adductors and groin.", "Exhale and drive up powerfully."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80', 11),
(12, 'High-Knee Metabolic Mountain Climbers', 'Posture', 'Caloric Burn', 'Transverse Abdominis & Core', 45, 'Intermediate', 'Burns visceral abdominal fat while strengthening deep pelvic stabilizers to prevent anterior pelvic tilt.', '["Start in a push-up plank with wrists directly beneath shoulders.", "Drive right knee rapidly toward chest without raising hips.", "Alternate legs at an athletic, controlled cadence for 45 seconds.", "Keep core braced and spine neutral throughout."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80', 12),
(13, 'Hollow Body Core Compression', 'Posture', 'Midsection Flattening', 'Deep Core & Lumbar Stabilization', 45, 'Beginner', 'Reverses lumbar hyperextension and flattens lower abdomen, unlocking 1–2 cm of obscured standing stature.', '["Lie flat on back and press lower lumbar spine firmly into the floor.", "Raise arms overhead and lift shoulder blades and heels 6 inches off ground.", "Hold banana shape while breathing shallowly through rib cage.", "Ensure lower back never peels away from the surface."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 13),
(14, 'Wide-Grip Lat Extension & Rib Cage Expansion', 'Height Growth', 'V-Taper Traction', 'Latissimus Dorsi & Costal Cartilage', 60, 'Intermediate', 'Expands the lateral rib cage and widens upper torso V-taper, creating immediate height and shoulder presence.', '["Grip wide overhead bar with overhand grip wider than shoulders.", "Pull elbows down and backward toward back pockets, arching upper thoracic spine.", "Squeeze shoulder blades together at bottom for 2 seconds.", "Slowly release to full overhead lat stretch."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 14),
(15, 'Standing Arnold Overhead Lockout', 'Strength', 'Scapular Plane Hypertrophy', 'Deltoids & Trapezius', 60, 'Intermediate', 'Builds 3D shoulder caps while demanding vertical spine stabilization under overhead load.', '["Stand upright holding dumbbells at chest height with palms facing inward.", "Rotate palms outward as you press overhead in a smooth spiral motion.", "Lock out with bicep adjacent to ears and ribs pulled down.", "Lower slowly along the same rotational path."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', 15),
(16, 'Hanging Decompression Knee Tucks', 'Height Growth', 'Axial Traction & Core', 'Lower Lumbar & Lower Abs', 60, 'Intermediate', 'Simultaneously decompresses lower lumbar discs while strengthening lower rectus abdominis.', '["Hang from bar with relaxed shoulders to initiate axial spine traction.", "Curl pelvis upward and draw knees smoothly toward chest.", "Pause for 1 second at top contraction.", "Lower legs slowly without swinging back and forth."]'::jsonb, NULL, 'image', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 16)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  tag = EXCLUDED.tag,
  target_zone = EXCLUDED.target_zone,
  duration_seconds = EXCLUDED.duration_seconds,
  intensity = EXCLUDED.intensity,
  clinical_benefit = EXCLUDED.clinical_benefit,
  instructions = EXCLUDED.instructions,
  media_type = EXCLUDED.media_type,
  media_url = EXCLUDED.media_url;

-- 3. Seed Category Workout Mappings (Junction Table)
INSERT INTO public.category_workouts (category_id, stretch_id)
VALUES
('cat-1', 1), ('cat-1', 2), ('cat-1', 5), ('cat-1', 14), ('cat-1', 16),
('cat-2', 3), ('cat-2', 6), ('cat-2', 7),
('cat-3', 4), ('cat-3', 8), ('cat-3', 13),
('cat-4', 1), ('cat-4', 3), ('cat-4', 7),
('cat-5', 2), ('cat-5', 5), ('cat-5', 8),
('cat-6', 9), ('cat-6', 10), ('cat-6', 11), ('cat-6', 1),
('cat-7', 12), ('cat-7', 13), ('cat-7', 4),
('cat-8', 14), ('cat-8', 15), ('cat-8', 9)
ON CONFLICT (category_id, stretch_id) DO NOTHING;

-- 4. Seed All 8 Achievements
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
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  target_value = EXCLUDED.target_value,
  xp_reward = EXCLUDED.xp_reward;

-- 5. Seed Category Diagnostic Questions
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
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  subtitle = EXCLUDED.subtitle,
  options = EXCLUDED.options;

-- 6. Seed All 12 Clinical Preset Foods in public.meals
INSERT INTO public.meals (id, user_id, name, serving_size, category, calories, protein, carbs, fat, calcium, zinc, vitamin_d3, clinical_rationale, active)
VALUES
('food-1', NULL, 'Greek Yogurt 0%', '200g bowl', 'Breakfast', 120, 22.0, 8.0, 0.0, 250, 1.2, 0, 'Rich in slow-release micellar casein and bioavailable calcium for epiphyseal chondrocytes.', true),
('food-2', NULL, 'Grilled Chicken Breast', '150g cooked', 'Lunch', 247, 46.0, 0.0, 5.0, 22, 1.8, 8, 'High leucine amino acid profile stimulates muscle protein synthesis and IGF-1 axis.', true),
('food-3', NULL, 'Hard Boiled Eggs (x2)', '2 large eggs', 'Snack', 156, 13.0, 1.0, 11.0, 56, 1.3, 88, 'Whole food source of natural Vitamin D3 and choline to support neuro-muscular signaling.', true),
('food-4', NULL, 'Organic Whole Milk', '1 glass (250ml)', 'Bedtime Anabolic', 152, 8.0, 12.0, 8.0, 290, 1.0, 100, 'Bioavailable calcium matrix + IGF-1 cofactors to support nighttime skeletal mineral uptake.', true),
('food-5', NULL, 'Steamed Edamame in Pods', '150g bowl', 'Snack', 188, 18.0, 14.0, 8.0, 98, 2.1, 0, 'High vegetable zinc and magnesium content for osteoblast alkaline phosphatase activation.', true),
('food-6', NULL, 'Wild Salmon Fillet', '150g baked', 'Dinner', 280, 34.0, 0.0, 15.0, 30, 0.9, 570, 'Massive natural Vitamin D3 + EPA/DHA omega-3 fatty acids reduce systemic epiphyseal inflammation.', true),
('food-7', NULL, 'Low Fat Cottage Cheese', '200g bowl', 'Bedtime Anabolic', 164, 28.0, 6.0, 2.0, 206, 1.5, 12, 'Slow-digesting casein stabilizes nocturnal blood glucose and supports slow-wave hGH pulses.', true),
('food-8', NULL, 'Grass-fed Whey Protein Shake', '1 scoop (35g in water)', 'Post-Workout', 130, 26.0, 2.0, 1.5, 160, 0.8, 0, 'Rapid bioavailability post-traction triggers immediate chondrocyte nitrogen uptake.', true),
('food-9', NULL, 'Raw Sprouted Almonds', '40g handful', 'Snack', 232, 8.5, 8.0, 20.0, 104, 1.4, 0, 'Dense in alpha-tocopherol and magnesium to counteract daily spinal disc compressive oxidative stress.', true),
('food-10', NULL, 'Steel Cut Oats with Chia Seeds', '60g dry with water', 'Breakfast', 260, 9.0, 42.0, 6.0, 115, 2.3, 0, 'Low-glycemic complex carbohydrates sustain day-long upright metabolic energy without insulin spikes.', true),
('food-11', NULL, 'Steamed Broccoli with Olive Oil', '150g steamed', 'Dinner', 85, 4.0, 9.0, 4.5, 68, 0.7, 0, 'Rich in Vitamin K1 and sulforaphane, promoting osteocalcin carboxylation for bone matrix density.', true),
('food-12', NULL, 'Canned Sardines in Olive Oil', '1 can (100g)', 'Lunch', 208, 24.0, 0.0, 12.0, 380, 2.4, 190, 'Exceptional calcium density and Vitamin D3 from soft edible bones for rapid skeletal remodeling.', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  serving_size = EXCLUDED.serving_size,
  category = EXCLUDED.category,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  calcium = EXCLUDED.calcium,
  zinc = EXCLUDED.zinc,
  vitamin_d3 = EXCLUDED.vitamin_d3,
  clinical_rationale = EXCLUDED.clinical_rationale;

-- =============================================================================
-- 7. RPC FUNCTION: PERMANENT ACCOUNT DELETION (RIGHT TO BE FORGOTTEN)
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
    DELETE FROM public.meals WHERE user_id = curr_uid;
    DELETE FROM public.sleep_logs WHERE user_id = curr_uid;
    DELETE FROM public.daily_logs WHERE user_id = curr_uid;
    DELETE FROM public.payments WHERE user_id = curr_uid;

    -- Delete user from auth schema
    DELETE FROM auth.users WHERE id = curr_uid;
END;
$$;


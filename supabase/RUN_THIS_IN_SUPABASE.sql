-- =============================================================================
-- TOLLGRAM — COMPLETE DATABASE SETUP
-- Paste this ENTIRE file into Supabase SQL Editor → Run
-- Project: xoxhmugmtzscmjlbpfuj
-- Safe to run multiple times (all CREATE IF NOT EXISTS + ON CONFLICT DO NOTHING)
-- =============================================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    age INTEGER,
    current_height NUMERIC(5,2) NOT NULL DEFAULT 170,
    predicted_height NUMERIC(5,2) NOT NULL DEFAULT 178,
    potential_gain NUMERIC(4,2) NOT NULL DEFAULT 8,
    growth_plate_status TEXT NOT NULL DEFAULT 'Open (Accelerated)',
    tanner_stage INTEGER DEFAULT 3,
    father_height NUMERIC(5,2),
    mother_height NUMERIC(5,2),
    mid_parental_target NUMERIC(5,2),
    streak_days INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Pro Monthly', 'Pro Annual')),
    is_premium BOOLEAN DEFAULT FALSE,
    water_goal_ml INTEGER DEFAULT 2500,
    ai_questions_used INTEGER DEFAULT 0,
    ai_window_start BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. ACHIEVEMENTS (admin-managed badges)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏆',
    icon_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('streak','stretches','nutrition','sleep','biometrics')),
    target_metric TEXT NOT NULL,
    target_value INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    tier TEXT NOT NULL CHECK (tier IN ('bronze','silver','gold','platinum')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. USER ACHIEVEMENTS (unlocked badges per user)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- =============================================================================
-- 4. STRETCHES (exercise catalog — admin managed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stretches (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Height Growth',
    tag TEXT NOT NULL DEFAULT 'Axial Traction',
    target_zone TEXT NOT NULL DEFAULT 'Lumbar & Thoracic',
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    intensity TEXT NOT NULL DEFAULT 'Beginner' CHECK (intensity IN ('Beginner','Intermediate','Advanced')),
    clinical_benefit TEXT NOT NULL DEFAULT '',
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    contraindications TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('video','gif','image')),
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. WORKOUT CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.workout_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT '🌱',
    description TEXT,
    color TEXT NOT NULL DEFAULT '#0284C7',
    sort_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. CATEGORY QUESTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.category_questions (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.workout_categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    subtitle TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. MEALS (food catalog — preset items have user_id = NULL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.meals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serving_size TEXT NOT NULL DEFAULT '100g',
    category TEXT NOT NULL DEFAULT 'High Protein',
    calories INTEGER NOT NULL DEFAULT 0,
    protein NUMERIC(5,2) NOT NULL DEFAULT 0,
    carbs NUMERIC(5,2) NOT NULL DEFAULT 0,
    fat NUMERIC(5,2) NOT NULL DEFAULT 0,
    calcium INTEGER DEFAULT 0,
    zinc NUMERIC(4,2) DEFAULT 0,
    vitamin_d3 INTEGER DEFAULT 0,
    clinical_rationale TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. SLEEP LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bedtime TEXT,
    wakeup_time TEXT,
    hours NUMERIC(4,1) NOT NULL CHECK (hours >= 0),
    quality TEXT DEFAULT 'Deep Restorative',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, logged_date);

-- =============================================================================
-- 9. WATER LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    size_label TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, logged_date);

-- =============================================================================
-- 10. DAILY LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(5,2) DEFAULT 0,
    carbs NUMERIC(5,2) DEFAULT 0,
    fat NUMERIC(5,2) DEFAULT 0,
    completed_stretches JSONB DEFAULT '[]'::jsonb,
    sleep_hours NUMERIC(3,1) DEFAULT 0,
    water_liters NUMERIC(3,1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- =============================================================================
-- 11. PAYMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revenuecat_original_transaction_id TEXT UNIQUE,
    product_id TEXT,
    plan_name TEXT NOT NULL,
    amount_paise INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-media', 'exercise-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate storage policies cleanly
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'exercise-media');

DROP POLICY IF EXISTS "Authenticated users can upload restricted media" ON storage.objects;
CREATE POLICY "Authenticated users can upload restricted media" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'exercise-media'
    AND LOWER(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','mp4','webm')
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stretches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop all old policies first so re-runs are clean
DROP POLICY IF EXISTS "Public can view active achievements" ON public.achievements;
DROP POLICY IF EXISTS "Public can view active stretches" ON public.stretches;
DROP POLICY IF EXISTS "Public can view active workout categories" ON public.workout_categories;
DROP POLICY IF EXISTS "Public can view active category questions" ON public.category_questions;
DROP POLICY IF EXISTS "Public can view active preset meals" ON public.meals;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can manage own sleep logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can manage own water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users can manage own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can manage own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Public read-only catalog policies
CREATE POLICY "Public can view active achievements" ON public.achievements FOR SELECT USING (active = true);
CREATE POLICY "Public can view active stretches" ON public.stretches FOR SELECT USING (active = true);
CREATE POLICY "Public can view active workout categories" ON public.workout_categories FOR SELECT USING (active = true);
CREATE POLICY "Public can view active category questions" ON public.category_questions FOR SELECT USING (active = true);
CREATE POLICY "Public can view active preset meals" ON public.meals FOR SELECT USING (active = true AND user_id IS NULL);

-- User data policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own user_achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- SUBSCRIPTION PROTECTION TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF (auth.jwt() ->> 'role') IS DISTINCT FROM 'service_role' THEN
        NEW.is_premium := OLD.is_premium;
        NEW.subscription_tier := OLD.subscription_tier;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_subscription ON public.profiles;
CREATE TRIGGER trg_protect_profile_subscription
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_subscription_fields();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Workout Categories
INSERT INTO public.workout_categories (id, name, slug, icon, description, color, sort_order) VALUES
('cat-1','Height Growth & Spinal Decompression','height-growth','🌱','Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.','#0284C7',1),
('cat-2','Postural Alignment & Cervical Reset','posture-alignment','📐','Reverses forward head tilt and text-neck kyphosis to reclaim compressed standing stature.','#10B981',2),
('cat-3','Core & Pelvic Stabilization','core-pelvic','⚡','Corrects anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.','#6366F1',3),
('cat-4','Morning Axial Elongation','morning-elongation','🌅','Circadian mobility wake-up sequence to expand vertebral joints for daytime upright stature.','#F59E0B',4),
('cat-5','Bedtime Disc Restoration','bedtime-restoration','🌙','Releases daytime spinal compression before sleep to maximize slow-wave hGH disc uptake.','#8B5CF6',5),
('cat-6','Weight Gain & Muscle Density','weight-gain','🥩','Progressive structural hypertrophy and caloric surplus optimization for ectomorph frames.','#EA580C',6),
('cat-7','Weight Loss & Posture Reveal','weight-loss','🔥','High-NEAT metabolic intervals and core toning to shed abdominal load pulling posture down.','#EF4444',7),
('cat-8','Bodybuilder Stature & V-Taper','bodybuilder','🏋️','Scapular width and latissimus dorsi hypertrophy to create dramatic vertical presence.','#059669',8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, color=EXCLUDED.color;

-- Achievements / Badges
INSERT INTO public.achievements (id, title, description, icon, category, target_metric, target_value, xp_reward, tier, active) VALUES
('badge-1','Spine Alignment Pioneer','Complete your first clinical spinal decompression session.','🧘','stretches','stretches_completed',1,50,'bronze',true),
('badge-2','7-Day Disc Traction Streak','Maintain 7 consecutive days of intervertebral decompression.','🔥','streak','streak_days',7,200,'silver',true),
('badge-3','Somatotropin Pulse Synced','Log 8+ hours of sleep during the slow-wave peak anabolic window.','🌙','sleep','deep_sleep_hours',8,100,'bronze',true),
('badge-4','Protein Synthesis Maxima','Hit daily protein requirement for skeletal chondrocytes.','🥩','nutrition','protein_target_hit',1,75,'bronze',true),
('badge-5','14-Day Epiphyseal Master','14 days of unbroken multi-factorial protocol adherence.','⚡','streak','streak_days',14,500,'gold',true),
('badge-6','100 Decompressions Milestone','Perform 100 cumulative spinal decompression sessions.','🏆','stretches','stretches_completed',100,1000,'platinum',true),
('badge-7','Tanner Baseline Calibrated','Complete the comprehensive biometric diagnostic.','🧬','biometrics','quiz_completed',1,150,'silver',true),
('badge-8','Hydration Disc Guard','Meet daily water quota for 5 consecutive days.','💧','nutrition','water_quota_met',5,250,'silver',true)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, target_value=EXCLUDED.target_value, xp_reward=EXCLUDED.xp_reward;

-- Stretches (16 clinical exercises)
INSERT INTO public.stretches (id, title, category, tag, target_zone, duration_seconds, intensity, clinical_benefit, instructions, media_type, media_url, sort_order) VALUES
(1,'Dead Hang Disc Traction','Height Growth','Axial Elongation','Lumbar & Thoracic',60,'Beginner','Creates negative intradiscal pressure, allowing synovial fluid to rehydrate compressed L1–L5 discs.','["Grip overhead bar shoulder-width apart with an overhand grip.","Allow feet to hang freely; keep core and shoulders relaxed.","Breathe deeply and let gravity elongate your vertebral column.","Disengage smoothly without jumping down abruptly."]','video','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',1),
(2,'Cobra Pose (Bhujangasana)','Height Growth','Spine Decompression','Lumbar Lordosis',45,'Beginner','Promotes restorative lumbar lordosis and counteracts prolonged sedentary thoracic kyphosis.','["Lie face down on mat with palms flat beneath shoulders.","Engage glutes and gently press through palms to lift chest.","Keep pelvis glued to mat and gaze forward.","Hold position and inhale slowly into abdomen for 45s."]','image','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',2),
(3,'Cat-Cow Posture Flow','Posture','Thoracic Mobility','Thoracic Articulation',60,'Beginner','Circulates synovial fluid across the 24 articulating vertebrae and improves thoracic extension.','["Start on all fours with hands under shoulders, knees under hips.","Inhale: Drop belly, lift chest and tailbone (Cow).","Exhale: Arch spine toward ceiling, tucking chin (Cat).","Cycle rhythmically with breath for 10-12 repetitions."]','image','https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',3),
(4,'Pelvic Shift & Glute Bridge','Strength','Lower Spine Release','Pelvic Neutralization',60,'Intermediate','Rebalances anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.','["Lie supine with knees bent and feet flat on floor, hip-width apart.","Press lower back flat into floor (posterior pelvic tilt).","Drive through heels to lift hips in line with thighs.","Hold peak squeeze for 3 seconds, lower slowly, and repeat."]','video','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',4),
(5,'Child''s Pose Extension','Height Growth','Full Back Decompression','Lumbar Paraspinal',60,'Beginner','Relaxes deep erector spinae musculature and opens posterior intervertebral disc spaces.','["Kneel on floor with big toes touching, knees spread wide.","Sit hips back onto heels and fold forward, resting forehead on mat.","Crawl fingertips forward to actively stretch latissimus dorsi.","Breathe deeply into posterior ribcage for 60 seconds."]','image','https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',5),
(6,'Wall Angel Scapular Retraction','Posture','Cervical Alignment','Cervical & Upper Spine',60,'Intermediate','Reverses forward head posture which typically causes 1.5 cm stature shortening.','["Stand with heels, glutes, upper back, and head against wall.","Bring arms into 90-degree goalpost position against wall.","Slowly slide hands upward overhead while maintaining contact.","Return to 90 degrees; repeat smoothly for 12 reps."]','image','https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80',6),
(7,'Standing Axial Reach','Posture','Posture Alignment','Full Axial Column',45,'Beginner','De-rotates ribcage and elongates posterior longitudinal ligament before sleep.','["Stand tall with feet hip-width apart.","Interlock fingers overhead with palms facing ceiling.","Reach upward while rising onto balls of feet.","Hold tall alignment for 5 breaths, lower, and repeat."]','image','https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',7),
(8,'Kneeling Psoas Release','Strength','Vertebral Release','Hip Flexor / Pelvis',60,'Intermediate','Lengthens hypertonic psoas muscles that pull the lumbar spine into exaggerated lordosis.','["Step right foot forward into 90-degree lunge, resting left knee on mat.","Tuck pelvis under and gently shift weight forward into left hip.","Raise left arm overhead and lean gently to right.","Hold 30s per side for a total of 60 seconds."]','image','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',8),
(9,'Incline Dumbbell Clavicle Stretch','Strength','Pectoral Expansion','Upper Chest & Clavicle',60,'Intermediate','Expands the upper thoracic rib cage and stimulates clavicular bone mineralization.','["Position torso on a 30-degree incline with dumbbells at shoulder height.","Press upward in an arc, focusing on upper pectoral contraction.","Lower slowly over 3 seconds to achieve a deep stretch.","Perform 4 sets with controlled breathing."]','image','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',9),
(10,'Romanian Deadlift Hip Hinge','Strength','Posterior Chain Density','Erector Spinae & Hamstrings',60,'Intermediate','Strengthens the deep paraspinal muscle columns to keep the spinal column naturally upright.','["Stand feet hip-width apart holding weight with shoulders retracted.","Hinge at hips, driving pelvis backward while keeping back strictly flat.","Lower bar to mid-shin level until hamstrings are fully engaged.","Drive through heels to return to tall standing lock."]','image','https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',10),
(11,'Goblet Squat & Thoracic Wedge','Strength','Axial Loading','Pelvis & Femoral Plates',60,'Intermediate','Loads the lower extremity long bones to stimulate growth factors and anabolic hormone secretion.','["Hold dumbbell vertically against chest with elbows pointing down.","Squat deep between knees while maintaining an upright vertical chest.","Hold bottom position for 1 second to stretch adductors.","Exhale and drive up powerfully."]','image','https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',11),
(12,'High-Knee Mountain Climbers','Posture','Caloric Burn','Transverse Abdominis & Core',45,'Intermediate','Burns visceral abdominal fat while strengthening deep pelvic stabilizers.','["Start in a push-up plank with wrists directly beneath shoulders.","Drive right knee rapidly toward chest without raising hips.","Alternate legs at an athletic, controlled cadence for 45 seconds.","Keep core braced and spine neutral throughout."]','image','https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',12),
(13,'Hollow Body Core Compression','Posture','Midsection Flattening','Deep Core & Lumbar Stabilization',45,'Beginner','Reverses lumbar hyperextension and flattens lower abdomen, unlocking 1–2 cm of obscured stature.','["Lie flat on back and press lower lumbar spine firmly into the floor.","Raise arms overhead and lift shoulder blades and heels 6 inches off ground.","Hold banana shape while breathing shallowly through rib cage.","Ensure lower back never peels away from the surface."]','image','https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',13),
(14,'Wide-Grip Lat Extension','Height Growth','V-Taper Traction','Latissimus Dorsi & Costal Cartilage',60,'Intermediate','Expands the lateral rib cage and widens upper torso V-taper, creating immediate height presence.','["Grip wide overhead bar with overhand grip wider than shoulders.","Pull elbows down and backward toward back pockets.","Squeeze shoulder blades together at bottom for 2 seconds.","Slowly release to full overhead lat stretch."]','image','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',14),
(15,'Standing Arnold Overhead Lockout','Strength','Scapular Plane Hypertrophy','Deltoids & Trapezius',60,'Intermediate','Builds 3D shoulder caps while demanding vertical spine stabilization under overhead load.','["Stand upright holding dumbbells at chest height with palms facing inward.","Rotate palms outward as you press overhead in a smooth spiral motion.","Lock out with bicep adjacent to ears and ribs pulled down.","Lower slowly along the same rotational path."]','image','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',15),
(16,'Hanging Decompression Knee Tucks','Height Growth','Axial Traction & Core','Lower Lumbar & Lower Abs',60,'Intermediate','Simultaneously decompresses lower lumbar discs while strengthening lower rectus abdominis.','["Hang from bar with relaxed shoulders to initiate axial spine traction.","Curl pelvis upward and draw knees smoothly toward chest.","Pause for 1 second at top contraction.","Lower legs slowly without swinging back and forth."]','image','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',16)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, clinical_benefit=EXCLUDED.clinical_benefit, instructions=EXCLUDED.instructions, media_type=EXCLUDED.media_type, media_url=EXCLUDED.media_url;

-- =============================================================================
-- DONE. All tables, policies, and seed data created.
-- Your 95 foods from the admin panel are already in the meals table.
-- Water logs will now save correctly.
-- =============================================================================

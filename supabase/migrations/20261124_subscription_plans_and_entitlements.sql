-- ============================================================================
-- GoTall Subscription Plans & Plan-Based Feature Entitlements Schema
-- Migration: 20261124_subscription_plans_and_entitlements.sql
-- Run in Supabase SQL Editor or apply via Supabase CLI
-- ============================================================================

-- 1. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,                                      -- e.g. 'plan_free', 'plan_pro_monthly', 'plan_pro_annual', 'plan_lifetime'
    name TEXT NOT NULL,                                       -- Display Name: 'Free Starter', 'Tallgrame Pro Monthly'
    tagline TEXT,                                             -- Short subtitle
    price_usd NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    price_inr NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    interval TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('free', 'monthly', 'quarterly', 'yearly', 'lifetime')),
    revenuecat_product_id TEXT,                               -- Matching RevenueCat Product ID ('monthly', 'yearly', 'lifetime')
    badge_label TEXT,                                         -- e.g. 'FLEXIBLE', 'BEST VALUE', 'VIP'
    badge_color TEXT DEFAULT '#0284C7',
    sort_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,                               -- FALSE = Archived Plan
    
    -- Feature Limits & Quotas
    ai_chat_daily_limit INTEGER NOT NULL DEFAULT 5,            -- Daily AI questions quota (-1 = unlimited)
    max_program_weeks INTEGER NOT NULL DEFAULT 6,              -- Maximum program weeks accessible
    can_access_advanced_stretches BOOLEAN DEFAULT FALSE,       -- Unlock advanced decompression routines
    can_access_ai_biomechanical_calibration BOOLEAN DEFAULT FALSE, -- AI posture and archetype calibration
    can_access_somatotropin_sleep_sync BOOLEAN DEFAULT FALSE,  -- Nocturnal hGH peak synchronization
    can_access_clinical_nutrition BOOLEAN DEFAULT FALSE,       -- Clinical bone mineralization & casein timing
    can_access_priority_support BOOLEAN DEFAULT FALSE,
    
    -- Feature bullet points for Paywall / UI
    marketing_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting and active filtering
CREATE INDEX IF NOT EXISTS idx_subscription_plans_order ON public.subscription_plans(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Public can view active plans; service_role can view and edit all plans (including archived)
DROP POLICY IF EXISTS "Public can view active subscription plans" ON public.subscription_plans;
CREATE POLICY "Public can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (active = TRUE);

-- 2. LINK USER PROFILES TO ACTIVE PLAN
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_plan_id TEXT REFERENCES public.subscription_plans(id) DEFAULT 'plan_free';

-- 3. SEED DEFAULT BASELINE PLANS
INSERT INTO public.subscription_plans (
    id, name, tagline, price_usd, price_inr, interval, revenuecat_product_id,
    badge_label, badge_color, sort_order, active,
    ai_chat_daily_limit, max_program_weeks,
    can_access_advanced_stretches, can_access_ai_biomechanical_calibration,
    can_access_somatotropin_sleep_sync, can_access_clinical_nutrition,
    can_access_priority_support, marketing_features
) VALUES
(
    'plan_free',
    'Free Starter',
    'Essential stature estimation and basic daily logging',
    0.00,
    0.00,
    'free',
    NULL,
    NULL,
    '#64748B',
    1,
    TRUE,
    5,
    2,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    '[
        "Tanner-Whitehouse III biological calculation",
        "Basic 2-week spinal decompression routine",
        "Daily water intake & streak tracking",
        "5 daily AI Clinical Advisor queries"
    ]'::jsonb
),
(
    'plan_pro_monthly',
    'Tallgrame Pro Monthly',
    'Full progressive protocol with daily AI clinical coaching',
    9.99,
    899.00,
    'monthly',
    'monthly',
    'FLEXIBLE',
    '#0284C7',
    2,
    TRUE,
    20,
    6,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    '[
        "Full 6-week progressive spinal elongation protocol",
        "20 daily Dr. Jack AI Growth Advisor queries",
        "Nocturnal Somatotropin (hGH) peak sync",
        "Clinical bone mineralization nutrition matrix",
        "AI-powered pelvic & cervical posture calibration",
        "Cancel anytime with zero commitment"
    ]'::jsonb
),
(
    'plan_pro_annual',
    'Tallgrame Pro Annual',
    'Maximum biological stature optimization with 50% savings',
    59.99,
    4999.00,
    'yearly',
    'yearly',
    'BEST VALUE',
    '#10B981',
    3,
    TRUE,
    50,
    6,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    '[
        "Everything in Pro Monthly included",
        "50 daily Dr. Jack AI Growth Advisor queries",
        "Save 50% compared to monthly billing",
        "Unlimited stature trajectory recalculations",
        "Parental genetics & epiphyseal plate monitoring",
        "Exclusive VIP Gold status",
        "7-day risk-free trial guarantee"
    ]'::jsonb
),
(
    'plan_lifetime',
    'Tallgrame Lifetime VIP',
    'Permanent lifetime access with zero recurring fees',
    149.99,
    12999.00,
    'lifetime',
    'lifetime',
    'VIP PERMANENT',
    '#8B5CF6',
    4,
    TRUE,
    100,
    6,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    '[
        "Permanent lifetime access to all features",
        "100 daily Dr. Jack AI Growth Advisor queries",
        "Zero recurring subscription fees",
        "All future AI upgrades & protocols included",
        "Lifetime priority cloud backup"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    price_usd = EXCLUDED.price_usd,
    price_inr = EXCLUDED.price_inr,
    interval = EXCLUDED.interval,
    revenuecat_product_id = EXCLUDED.revenuecat_product_id,
    badge_label = EXCLUDED.badge_label,
    badge_color = EXCLUDED.badge_color,
    sort_order = EXCLUDED.sort_order,
    active = EXCLUDED.active,
    ai_chat_daily_limit = EXCLUDED.ai_chat_daily_limit,
    max_program_weeks = EXCLUDED.max_program_weeks,
    can_access_advanced_stretches = EXCLUDED.can_access_advanced_stretches,
    can_access_ai_biomechanical_calibration = EXCLUDED.can_access_ai_biomechanical_calibration,
    can_access_somatotropin_sleep_sync = EXCLUDED.can_access_somatotropin_sleep_sync,
    can_access_clinical_nutrition = EXCLUDED.can_access_clinical_nutrition,
    can_access_priority_support = EXCLUDED.can_access_priority_support,
    marketing_features = EXCLUDED.marketing_features,
    updated_at = NOW();

-- 4. SERVER-SIDE SAFE RPC 1: CHECK AI QUOTA (DOES NOT BURN QUOTA)
CREATE OR REPLACE FUNCTION public.check_user_ai_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_caller_id UUID;
    v_plan_id TEXT;
    v_plan_name TEXT;
    v_daily_limit INTEGER := 5;
    v_current_count INTEGER := 0;
    v_window_start BIGINT := 0;
    v_now_epoch BIGINT;
    v_window_duration_ms BIGINT := 86400000; -- 24 hours
    v_remaining INTEGER;
BEGIN
    -- Verify caller authorization: caller must be user themselves or service_role
    v_caller_id := auth.uid();
    IF v_caller_id IS NOT NULL AND v_caller_id != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Caller % cannot access quota for user %', v_caller_id, p_user_id;
    END IF;

    v_now_epoch := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;

    -- Fetch user profile & plan limit
    SELECT 
        COALESCE(p.active_plan_id, 'plan_free'),
        COALESCE(p.ai_questions_used, 0),
        COALESCE(p.ai_window_start, 0),
        COALESCE(sp.ai_chat_daily_limit, 5),
        COALESCE(sp.name, 'Free Starter')
    INTO v_plan_id, v_current_count, v_window_start, v_daily_limit, v_plan_name
    FROM public.profiles p
    LEFT JOIN public.subscription_plans sp ON sp.id = p.active_plan_id
    WHERE p.user_id = p_user_id;

    -- If profile doesn't exist yet, return default free quota
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'limit', 5,
            'used', 0,
            'remaining', 5,
            'plan_name', 'Free Starter',
            'plan_id', 'plan_free',
            'reset_countdown', 'Ready'
        );
    END IF;

    -- Check if rolling 24h window has elapsed
    IF v_window_start = 0 OR (v_now_epoch - v_window_start) >= v_window_duration_ms THEN
        v_current_count := 0;
    END IF;

    IF v_daily_limit = -1 THEN
        v_remaining := 9999;
    ELSE
        v_remaining := GREATEST(0, v_daily_limit - v_current_count);
    END IF;

    RETURN jsonb_build_object(
        'allowed', (v_daily_limit = -1 OR v_remaining > 0),
        'limit', v_daily_limit,
        'used', v_current_count,
        'remaining', v_remaining,
        'plan_name', v_plan_name,
        'plan_id', v_plan_id,
        'reset_countdown', CASE 
            WHEN v_window_start > 0 AND (v_now_epoch - v_window_start) < v_window_duration_ms THEN
                LPAD(((v_window_duration_ms - (v_now_epoch - v_window_start)) / 3600000)::TEXT, 2, '0') || 'h ' ||
                LPAD(((((v_window_duration_ms - (v_now_epoch - v_window_start)) % 3600000) / 60000))::TEXT, 2, '0') || 'm'
            ELSE 'Ready'
        END
    );
END;
$$;

-- 5. SERVER-SIDE SAFE RPC 2: CONSUME AI QUOTA (CALLED ONLY ON SUCCESSFUL API CALL)
CREATE OR REPLACE FUNCTION public.consume_user_ai_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_caller_id UUID;
    v_plan_id TEXT;
    v_daily_limit INTEGER := 5;
    v_current_count INTEGER := 0;
    v_window_start BIGINT := 0;
    v_now_epoch BIGINT;
    v_window_duration_ms BIGINT := 86400000; -- 24 hours
    v_remaining INTEGER;
BEGIN
    -- Verify caller authorization
    v_caller_id := auth.uid();
    IF v_caller_id IS NOT NULL AND v_caller_id != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Caller % cannot consume quota for user %', v_caller_id, p_user_id;
    END IF;

    v_now_epoch := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;

    -- Fetch user profile & plan limit
    SELECT 
        COALESCE(p.active_plan_id, 'plan_free'),
        COALESCE(p.ai_questions_used, 0),
        COALESCE(p.ai_window_start, 0),
        COALESCE(sp.ai_chat_daily_limit, 5)
    INTO v_plan_id, v_current_count, v_window_start, v_daily_limit
    FROM public.profiles p
    LEFT JOIN public.subscription_plans sp ON sp.id = p.active_plan_id
    WHERE p.user_id = p_user_id;

    -- If 24h window has elapsed or never started, reset window start
    IF v_window_start = 0 OR (v_now_epoch - v_window_start) >= v_window_duration_ms THEN
        v_window_start := v_now_epoch;
        v_current_count := 1;
    ELSE
        -- If user is at or above quota, block
        IF v_daily_limit != -1 AND v_current_count >= v_daily_limit THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'error', 'Daily quota exhausted',
                'limit', v_daily_limit,
                'used', v_current_count,
                'remaining', 0
            );
        END IF;
        v_current_count := v_current_count + 1;
    END IF;

    -- Atomic write to user's profile
    UPDATE public.profiles
    SET 
        ai_questions_used = v_current_count,
        ai_window_start = v_window_start,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    IF v_daily_limit = -1 THEN
        v_remaining := 9999;
    ELSE
        v_remaining := GREATEST(0, v_daily_limit - v_current_count);
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'limit', v_daily_limit,
        'used', v_current_count,
        'remaining', v_remaining
    );
END;
$$;

-- Grant execute permissions to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.check_user_ai_quota(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_user_ai_quota(UUID) TO authenticated, service_role;

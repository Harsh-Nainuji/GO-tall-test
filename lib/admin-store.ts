'use client'

import { useState, useEffect } from 'react'

export interface AchievementBadge {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'stretches' | 'nutrition' | 'sleep' | 'biometrics'
  metricTrigger: string
  targetValue: number
  xpReward: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  active: boolean
  unlockedCount: number
}

export interface WorkoutCategory {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  color: string
  workoutIds: string[]
  active: boolean
  order: number
}

export interface CategoryQuestion {
  id: string
  categoryId: string
  questionText: string
  subtitle: string
  options: Array<{
    label: string
    sublabel?: string
    icon?: string
    scoreBoost?: number
  }>
  active: boolean
  order: number
}

export interface SpinalStretch {
  id: string
  title: string
  category: 'Height Growth' | 'Strength' | 'Posture'
  targetZone: 'Lumbar Decompression' | 'Thoracic Expansion' | 'Cervical Alignment' | 'Pelvic Neutralization' | string
  durationSeconds: number
  intensity: 'Beginner' | 'Intermediate' | 'Advanced'
  clinicalBenefit: string
  instructions: string[]
  contraindications?: string
  active: boolean
  order: number
  media_url?: string
  media_type?: 'video' | 'gif' | 'image'
}

export interface FoodItem {
  id: string
  name: string
  servingSize: string
  category: 'High Protein' | 'Bone Mineralization' | 'Bedtime Anabolic' | 'Growth Micronutrients'
  calories: number
  protein: number
  carbs: number
  fat: number
  calcium: number
  zinc: number
  vitaminD3: number
  clinicalRationale: string
  active: boolean
}

export interface UserBiometricProfile {
  id: string
  name: string
  email: string
  gender: 'Male' | 'Female'
  age: number
  currentHeight: number
  predictedHeight: number
  potentialGain: number
  growthPlateStatus: 'Open (Accelerated)' | 'Open (Decelerating)' | 'Terminal Fusion Window' | 'Fully Ossified'
  tannerStage: number
  fatherHeight: number
  motherHeight: number
  midParentalTarget: number
  streakDays: number
  stretchesCompleted: number
  nutritionLoggedCount: number
  unlockedBadgesCount: number
  subscriptionTier: 'Free' | 'Pro Monthly' | 'Pro Annual'
  joinDate: string
  lastActive: string
  recentActivity: string
}

export interface AiPromptChip {
  id: string
  label: string
  category: 'Biometrics' | 'Nutrition' | 'Sleep & Hormones' | 'Posture & Spine'
  prompt: string
  presetResponse: string
  clicksCount: number
  active: boolean
  order: number
}

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-1',
    title: 'Spine Alignment Pioneer',
    description: 'Complete your first clinical spinal decompression session.',
    icon: '🧘',
    category: 'stretches',
    metricTrigger: 'stretches_completed',
    targetValue: 1,
    xpReward: 50,
    tier: 'bronze',
    active: true,
    unlockedCount: 8940,
  },
  {
    id: 'badge-2',
    title: '7-Day Disc Traction Streak',
    description: 'Maintain 7 consecutive days of intervertebral decompression.',
    icon: '🔥',
    category: 'streak',
    metricTrigger: 'streak_days',
    targetValue: 7,
    xpReward: 200,
    tier: 'silver',
    active: true,
    unlockedCount: 4210,
  },
  {
    id: 'badge-3',
    title: 'Somatotropin Pulse Synced',
    description: 'Log 8+ hours of sleep during the slow-wave peak anabolic window.',
    icon: '🌙',
    category: 'sleep',
    metricTrigger: 'deep_sleep_hours',
    targetValue: 8,
    xpReward: 100,
    tier: 'bronze',
    active: true,
    unlockedCount: 6512,
  },
  {
    id: 'badge-4',
    title: 'Protein Synthesis Maxima',
    description: 'Hit 100% of your personalized skeletal amino acid requirement.',
    icon: '🥩',
    category: 'nutrition',
    metricTrigger: 'protein_target_hit',
    targetValue: 1,
    xpReward: 75,
    tier: 'bronze',
    active: true,
    unlockedCount: 5890,
  },
  {
    id: 'badge-5',
    title: '14-Day Epiphyseal Master',
    description: '14 days of unbroken multi-factorial protocol adherence.',
    icon: '⚡',
    category: 'streak',
    metricTrigger: 'streak_days',
    targetValue: 14,
    xpReward: 500,
    tier: 'gold',
    active: true,
    unlockedCount: 1980,
  },
  {
    id: 'badge-6',
    title: '100 Decompressions Milestone',
    description: 'Perform 100 cumulative spinal decompression sessions.',
    icon: '🏆',
    category: 'stretches',
    metricTrigger: 'stretches_completed',
    targetValue: 100,
    xpReward: 1000,
    tier: 'platinum',
    active: true,
    unlockedCount: 640,
  },
  {
    id: 'badge-7',
    title: 'Tanner Baseline Calibrated',
    description: 'Complete the comprehensive 15-factor biometric diagnostic.',
    icon: '🧬',
    category: 'biometrics',
    metricTrigger: 'quiz_completed',
    targetValue: 1,
    xpReward: 150,
    tier: 'silver',
    active: true,
    unlockedCount: 10240,
  },
  {
    id: 'badge-8',
    title: 'Hydration Disc Guard',
    description: 'Meet full daily water and bone-mineral electrolyte quotas for 5 days.',
    icon: '💧',
    category: 'nutrition',
    metricTrigger: 'water_quota_met',
    targetValue: 5,
    xpReward: 250,
    tier: 'silver',
    active: true,
    unlockedCount: 3120,
  },
]

export const INITIAL_STRETCHES: SpinalStretch[] = [
  {
    id: 'stretch-1',
    title: 'Dead Hang Disc Traction',
    category: 'Height Growth',
    targetZone: 'Lumbar Decompression',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Creates axial gravity traction, generating negative intradiscal pressure to pull fluids back into compressed L1–L5 discs.',
    instructions: [
      'Grip an overhead bar shoulder-width apart with an overhand grip.',
      'Allow feet to hang freely or rest lightly on toes if starting out.',
      'Relax paraspinal muscles and breathe deeply for 60 seconds.',
      'Disengage smoothly without jumping down abruptly.',
    ],
    contraindications: 'Acute shoulder impingement or wrist fracture.',
    active: true,
    order: 1,
    media_type: 'image',
  },
  {
    id: 'stretch-2',
    title: 'Cobra Pose (Bhujangasana)',
    category: 'Height Growth',
    targetZone: 'Lumbar Decompression',
    durationSeconds: 45,
    intensity: 'Beginner',
    clinicalBenefit: 'Promotes restorative lumbar lordosis and counteracts prolonged sedentary kyphosis.',
    instructions: [
      'Lie face down on mat with palms flat under shoulders.',
      'Engage glutes and press gently through hands to lift upper torso.',
      'Keep pelvis anchored to the floor and shoulders back and down.',
      'Hold position and inhale slowly into the abdomen for 45 seconds.',
    ],
    contraindications: 'Severe lumbar spondylolisthesis or active spinal stenosis.',
    active: true,
    order: 2,
    media_type: 'image',
  },
  {
    id: 'stretch-3',
    title: 'Cat-Cow Dynamic Decompression',
    category: 'Posture',
    targetZone: 'Thoracic Expansion',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Increases synovial fluid circulation along the 24 articulating vertebral joints.',
    instructions: [
      'Start on all fours with wrists under shoulders and knees under hips.',
      'Inhale: Drop belly toward floor, lift chest and gaze upward (Cow).',
      'Exhale: Round spine toward ceiling, tucking chin to chest (Cat).',
      'Cycle rhythmically with your breath for 10-12 repetitions over 60 seconds.',
    ],
    active: true,
    order: 3,
    media_type: 'image',
  },
  {
    id: 'stretch-4',
    title: 'Pelvic Tilt & Glute Bridge',
    category: 'Strength',
    targetZone: 'Pelvic Neutralization',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Rebalances anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.',
    instructions: [
      'Lie supine with knees bent and feet flat on mat, hip-distance apart.',
      'Flatten lower back firmly against the floor (posterior pelvic tilt).',
      'Drive through heels to lift hips until thighs and torso form a straight diagonal line.',
      'Hold peak contraction for 3 seconds, lower slowly, and repeat for 60s.',
    ],
    active: true,
    order: 4,
    media_type: 'image',
  },
  {
    id: 'stretch-5',
    title: 'Child’s Pose Intervertebral Reset',
    category: 'Height Growth',
    targetZone: 'Lumbar Decompression',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Relaxes deep erector spinae muscles and expands intervertebral disc spacing.',
    instructions: [
      'Kneel on the floor with big toes touching and knees spread comfortably apart.',
      'Sit hips back onto heels and fold forward, resting forehead on mat.',
      'Extend arms long in front with palms grounded.',
      'Breathe deeply into posterior ribcage for 60 seconds.',
    ],
    active: true,
    order: 5,
    media_type: 'image',
  },
  {
    id: 'stretch-6',
    title: 'Wall Angel Scapular Retraction',
    category: 'Posture',
    targetZone: 'Cervical Alignment',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Reverses forward head tilt and thoracic kyphosis, which typically compromises 1.5 cm of standing height.',
    instructions: [
      'Stand with heels, sacrum, upper back, and head against a flat wall.',
      'Bring elbows and backs of hands against the wall at 90-degree angles.',
      'Slowly slide arms upward overhead while keeping all contact points pressed to wall.',
      'Lower slowly back to starting position; perform 12 smooth reps over 60 seconds.',
    ],
    active: true,
    order: 6,
    media_type: 'image',
  },
  {
    id: 'stretch-7',
    title: 'Standing Axial Extension Reach',
    category: 'Posture',
    targetZone: 'Thoracic Expansion',
    durationSeconds: 45,
    intensity: 'Beginner',
    clinicalBenefit: 'De-rotates thoracic ribcage and elongates the posterior longitudinal ligament.',
    instructions: [
      'Stand tall with feet hip-width apart and core lightly braced.',
      'Interlock fingers overhead with palms turned toward ceiling.',
      'Reach upward while rising slightly onto balls of feet.',
      'Hold tall alignment for 5 breaths, lower heels, and repeat.',
    ],
    active: true,
    order: 7,
    media_type: 'image',
  },
  {
    id: 'stretch-8',
    title: 'Kneeling Psoas Release',
    category: 'Strength',
    targetZone: 'Pelvic Neutralization',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Lengthens contracted hip flexors that pull the lumbar spine into hyperlordosis.',
    instructions: [
      'Step right foot forward into a 90-degree lunge, resting left knee on mat.',
      'Tuck pelvis under and gently shift weight forward until left groin stretches.',
      'Raise left arm straight overhead and lean gently to the right.',
      'Hold 30 seconds per side for a total 60-second decompression cycle.',
    ],
    active: true,
    order: 8,
    media_type: 'image',
  },
]

export const INITIAL_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'cat-1',
    name: 'Height Growth & Spinal Decompression',
    slug: 'height-growth',
    icon: '🌱',
    description: 'Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.',
    color: '#0284C7',
    workoutIds: ['stretch-1', 'stretch-2', 'stretch-5'],
    active: true,
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Postural Alignment & Cervical Reset',
    slug: 'posture-alignment',
    icon: '📐',
    description: 'Reverses forward head tilt and text-neck kyphosis to reclaim compressed standing stature.',
    color: '#10B981',
    workoutIds: ['stretch-3', 'stretch-6', 'stretch-7'],
    active: true,
    order: 2,
  },
  {
    id: 'cat-3',
    name: 'Core & Pelvic Stabilization',
    slug: 'core-pelvic',
    icon: '⚡',
    description: 'Corrects anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.',
    color: '#6366F1',
    workoutIds: ['stretch-4', 'stretch-8'],
    active: true,
    order: 3,
  },
  {
    id: 'cat-4',
    name: 'Morning Axial Elongation',
    slug: 'morning-elongation',
    icon: '🌅',
    description: 'Circadian mobility wake-up sequence to expand vertebral joints for daytime upright stature.',
    color: '#F59E0B',
    workoutIds: ['stretch-1', 'stretch-3', 'stretch-7'],
    active: true,
    order: 4,
  },
  {
    id: 'cat-5',
    name: 'Bedtime Disc Restoration',
    slug: 'bedtime-restoration',
    icon: '🌙',
    description: 'Releases daytime spinal compression before sleep to maximize slow-wave hGH disc uptake.',
    color: '#8B5CF6',
    workoutIds: ['stretch-2', 'stretch-5', 'stretch-8'],
    active: true,
    order: 5,
  },
]

export const INITIAL_CATEGORY_QUESTIONS: CategoryQuestion[] = [
  {
    id: 'cq-1',
    categoryId: 'cat-1',
    questionText: 'Do you feel back tightness after sitting at school or studying?',
    subtitle: 'Helps identify daily intradiscal compressive strain on lumbar vertebrae.',
    options: [
      { label: 'Yes, constant stiffness', sublabel: 'Indicates high spinal disc fluid loss', icon: '😣' },
      { label: 'Only after 4+ hours', sublabel: 'Moderate postural loading', icon: '⏱️' },
      { label: 'Rarely / Never', sublabel: 'Discs maintain healthy hydration', icon: '✨' },
    ],
    active: true,
    order: 1,
  },
  {
    id: 'cq-2',
    categoryId: 'cat-2',
    questionText: 'Do your shoulders roll forward or head protrude while looking at your phone?',
    subtitle: 'Identifies text-neck kyphosis, which can obscure 1.5–2.0 cm of standing stature.',
    options: [
      { label: 'Severe forward tilt', sublabel: 'Text-neck is actively reducing height', icon: '📱' },
      { label: 'Slight slumping', sublabel: 'Can be corrected with scapular retraction', icon: '🧍' },
      { label: 'Upright clinical posture', sublabel: 'Full standing height unlocked', icon: '🎖️' },
    ],
    active: true,
    order: 2,
  },
  {
    id: 'cq-3',
    categoryId: 'cat-3',
    questionText: 'Does your lower back arch excessively when standing straight (pelvic tilt)?',
    subtitle: 'Anterior pelvic tilt shifts the pelvis forward, hiding available leg and spinal height.',
    options: [
      { label: 'Yes, noticeable arch', sublabel: 'Can regain +1 to +2 cm from neutral tilt', icon: '🔄' },
      { label: 'Neutral and balanced', sublabel: 'Optimal core pelvic alignment', icon: '⚖️' },
    ],
    active: true,
    order: 3,
  },
  {
    id: 'cq-4',
    categoryId: 'cat-5',
    questionText: 'Do you do any physical decompression before sleeping at night?',
    subtitle: 'Discs rehydrate 80% of daily fluid during the first 4 hours of horizontal rest.',
    options: [
      { label: 'Never, just go straight to bed', sublabel: 'Missing overnight growth expansion', icon: '😴' },
      { label: 'Sometimes light stretching', sublabel: 'Partial decompression benefit', icon: '🧘' },
      { label: 'Yes, dedicated routine', sublabel: 'Maximum overnight somatotropin sync', icon: '🌙' },
    ],
    active: true,
    order: 4,
  },
]

export const INITIAL_FOODS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Greek Yogurt 0%',
    servingSize: '1 cup (200g)',
    category: 'High Protein',
    calories: 120,
    protein: 22,
    carbs: 8,
    fat: 0,
    calcium: 250,
    zinc: 1.2,
    vitaminD3: 0,
    clinicalRationale: 'High-density casein and whey delivering essential branched-chain amino acids for nocturnal skeletal repair.',
    active: true,
  },
  {
    id: 'food-2',
    name: 'Grilled Chicken Breast',
    servingSize: '150g cooked',
    category: 'High Protein',
    calories: 247,
    protein: 46,
    carbs: 0,
    fat: 5,
    calcium: 18,
    zinc: 1.5,
    vitaminD3: 8,
    clinicalRationale: 'Complete amino acid profile required for chondrocyte proliferation in the growth plate.',
    active: true,
  },
  {
    id: 'food-3',
    name: 'Hard Boiled Pasture-Raised Eggs',
    servingSize: '2 large eggs',
    category: 'Growth Micronutrients',
    calories: 156,
    protein: 13,
    carbs: 1.2,
    fat: 10.6,
    calcium: 56,
    zinc: 1.1,
    vitaminD3: 88,
    clinicalRationale: 'Choline, lutein, and bioavailable Vitamin D3 required for osteoblast calcium deposition.',
    active: true,
  },
  {
    id: 'food-4',
    name: 'Whole Organic Milk',
    servingSize: '1 glass (250ml)',
    category: 'Bone Mineralization',
    calories: 152,
    protein: 8,
    carbs: 12,
    fat: 8,
    calcium: 290,
    zinc: 1.0,
    vitaminD3: 100,
    clinicalRationale: 'Contains IGF-1 promoting bioactive peptides and high bioavailable calcium-to-phosphorus ratio.',
    active: true,
  },
  {
    id: 'food-5',
    name: 'Steamed Edamame in Pods',
    servingSize: '1 bowl (150g)',
    category: 'High Protein',
    calories: 188,
    protein: 18,
    carbs: 14,
    fat: 8,
    calcium: 98,
    zinc: 2.1,
    vitaminD3: 0,
    clinicalRationale: 'Plant-based complete protein packed with zinc, an essential cofactor for alkaline phosphatase.',
    active: true,
  },
  {
    id: 'food-6',
    name: 'Wild Atlantic Salmon Fillet',
    servingSize: '150g baked',
    category: 'Growth Micronutrients',
    calories: 280,
    protein: 34,
    carbs: 0,
    fat: 15,
    calcium: 20,
    zinc: 0.9,
    vitaminD3: 570,
    clinicalRationale: 'Exceptional source of EPA/DHA omega-3 fatty acids and natural Vitamin D3 to stimulate epiphyseal mineralization.',
    active: true,
  },
  {
    id: 'food-7',
    name: 'Low Fat Cottage Cheese',
    servingSize: '1 cup (200g)',
    category: 'Bedtime Anabolic',
    calories: 164,
    protein: 28,
    carbs: 6,
    fat: 2.4,
    calcium: 138,
    zinc: 1.3,
    vitaminD3: 12,
    clinicalRationale: 'Slow-digesting micellar casein maintains positive nitrogen balance during the 8-hour sleep growth hormone pulse.',
    active: true,
  },
  {
    id: 'food-8',
    name: 'Raw California Almonds',
    servingSize: '1 handful (30g)',
    category: 'Bone Mineralization',
    calories: 173,
    protein: 6,
    carbs: 6,
    fat: 15,
    calcium: 76,
    zinc: 0.9,
    vitaminD3: 0,
    clinicalRationale: 'Dense magnesium and phosphorus source crucial for stabilizing hydroxyapatite bone crystal matrix.',
    active: true,
  },
  {
    id: 'food-9',
    name: 'Atlantic Sardines in Olive Oil',
    servingSize: '1 can (90g)',
    category: 'Bone Mineralization',
    calories: 190,
    protein: 23,
    carbs: 0,
    fat: 11,
    calcium: 351,
    zinc: 1.3,
    vitaminD3: 190,
    clinicalRationale: 'Edible soft bones provide microcrystalline calcium hydroxyapatite identical to human bone tissue.',
    active: true,
  },
  {
    id: 'food-10',
    name: 'Steel Cut Oats with Seeds',
    servingSize: '1 bowl (50g dry)',
    category: 'Bedtime Anabolic',
    calories: 189,
    protein: 6.5,
    carbs: 33,
    fat: 3.5,
    calcium: 26,
    zinc: 1.8,
    vitaminD3: 0,
    clinicalRationale: 'Slow-releasing complex carbohydrates that prevent nocturnal hypoglycemia, which inhibits somatotropin secretion.',
    active: true,
  },
]

export const INITIAL_USERS: UserBiometricProfile[] = [
  {
    id: 'usr-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    gender: 'Male',
    age: 17,
    currentHeight: 172.4,
    predictedHeight: 177.8,
    potentialGain: 5.4,
    growthPlateStatus: 'Open (Decelerating)',
    tannerStage: 4,
    fatherHeight: 178.0,
    motherHeight: 164.5,
    midParentalTarget: 177.8,
    streakDays: 12,
    stretchesCompleted: 24,
    nutritionLoggedCount: 31,
    unlockedBadgesCount: 5,
    subscriptionTier: 'Pro Annual',
    joinDate: '2026-10-12',
    lastActive: '12 mins ago',
    recentActivity: 'Completed Dead Hang (60s)',
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    gender: 'Female',
    age: 15,
    currentHeight: 161.0,
    predictedHeight: 166.5,
    potentialGain: 5.5,
    growthPlateStatus: 'Open (Accelerated)',
    tannerStage: 3,
    fatherHeight: 180.5,
    motherHeight: 165.0,
    midParentalTarget: 166.3,
    streakDays: 18,
    stretchesCompleted: 36,
    nutritionLoggedCount: 45,
    unlockedBadgesCount: 7,
    subscriptionTier: 'Pro Monthly',
    joinDate: '2026-09-28',
    lastActive: '1 hour ago',
    recentActivity: 'Logged Greek Yogurt 0%',
  },
  {
    id: 'usr-3',
    name: 'Liam Chen',
    email: 'liam.chen@example.com',
    gender: 'Male',
    age: 19,
    currentHeight: 175.0,
    predictedHeight: 178.2,
    potentialGain: 3.2,
    growthPlateStatus: 'Terminal Fusion Window',
    tannerStage: 5,
    fatherHeight: 176.0,
    motherHeight: 162.0,
    midParentalTarget: 175.5,
    streakDays: 4,
    stretchesCompleted: 14,
    nutritionLoggedCount: 19,
    unlockedBadgesCount: 3,
    subscriptionTier: 'Pro Annual',
    joinDate: '2026-10-20',
    lastActive: '3 hours ago',
    recentActivity: 'Completed Wall Angel Retraction',
  },
  {
    id: 'usr-4',
    name: 'Sofia Alvarez',
    email: 'sofia.a@example.com',
    gender: 'Female',
    age: 16,
    currentHeight: 158.5,
    predictedHeight: 163.0,
    potentialGain: 4.5,
    growthPlateStatus: 'Open (Decelerating)',
    tannerStage: 4,
    fatherHeight: 174.0,
    motherHeight: 161.0,
    midParentalTarget: 161.0,
    streakDays: 2,
    stretchesCompleted: 8,
    nutritionLoggedCount: 12,
    unlockedBadgesCount: 2,
    subscriptionTier: 'Free',
    joinDate: '2026-10-29',
    lastActive: 'Yesterday',
    recentActivity: 'Logged 8h sleep window',
  },
  {
    id: 'usr-5',
    name: 'Jordan Miller',
    email: 'jordan.m@example.com',
    gender: 'Male',
    age: 21,
    currentHeight: 179.0,
    predictedHeight: 181.5,
    potentialGain: 2.5,
    growthPlateStatus: 'Fully Ossified',
    tannerStage: 5,
    fatherHeight: 182.0,
    motherHeight: 168.0,
    midParentalTarget: 181.5,
    streakDays: 9,
    stretchesCompleted: 42,
    nutritionLoggedCount: 22,
    unlockedBadgesCount: 4,
    subscriptionTier: 'Pro Monthly',
    joinDate: '2026-10-01',
    lastActive: '5 hours ago',
    recentActivity: 'Completed Pelvic Tilt Session',
  },
  {
    id: 'usr-6',
    name: 'Kevin O’Connor',
    email: 'kevin.oc@example.com',
    gender: 'Male',
    age: 14,
    currentHeight: 164.0,
    predictedHeight: 179.5,
    potentialGain: 15.5,
    growthPlateStatus: 'Open (Accelerated)',
    tannerStage: 2,
    fatherHeight: 184.0,
    motherHeight: 167.0,
    midParentalTarget: 182.0,
    streakDays: 1,
    stretchesCompleted: 2,
    nutritionLoggedCount: 3,
    unlockedBadgesCount: 1,
    subscriptionTier: 'Free',
    joinDate: '2026-11-01',
    lastActive: '20 mins ago',
    recentActivity: 'Completed 15-question diagnostic',
  },
]

export const INITIAL_AI_CHIPS: AiPromptChip[] = [
  {
    id: 'chip-1',
    label: '🦴 Growth Plate Status',
    category: 'Biometrics',
    prompt: 'Are my growth plates still open based on my age and velocity?',
    presetResponse: 'Based on your age and reported growth rate in the past 12 months, your epiphyseal plates are evaluated against pediatric ossification standards. Plate closure typically completes between 16-19 in males and 14-16 in females.',
    clicksCount: 3420,
    active: true,
    order: 1,
  },
  {
    id: 'chip-2',
    label: '🥛 Bedtime hGH Snack',
    category: 'Nutrition',
    prompt: 'What should I eat 60 minutes before bed to maximize human Growth Hormone pulse?',
    presetResponse: 'Slow-digesting micellar casein (like 150g Greek yogurt or low-fat cottage cheese) combined with zinc and magnesium prevents nocturnal hypoglycemia and supports the large pulsatile somatotropin release during slow-wave Stage 3/4 sleep.',
    clicksCount: 2890,
    active: true,
    order: 2,
  },
  {
    id: 'chip-3',
    label: '🧘 Spinal Disc Rehydration',
    category: 'Posture & Spine',
    prompt: 'How much height can I realistically restore from spinal decompression?',
    presetResponse: 'Peer-reviewed musculoskeletal studies confirm intervertebral discs compress by 1.0 to 2.5 cm over a single day due to axial gravity. Targeted decompression protocols (like 60s dead hangs and cobra extensions) rehydrate discs and recover this diurnal loss.',
    clicksCount: 4110,
    active: true,
    order: 3,
  },
  {
    id: 'chip-4',
    label: '🧬 Mid-Parental Target',
    category: 'Biometrics',
    prompt: 'Explain how my father and mother heights determine my genetic baseline.',
    presetResponse: 'The Tanner-Whitehouse formula calculates your mid-parental genetic set-point: (Father + Mother + 13 cm for males, or - 13 cm for females) / 2. This accounts for ~60-80% of stature variance, with the remaining 20-40% governed by epigenetic and environmental factors.',
    clicksCount: 2150,
    active: true,
    order: 4,
  },
  {
    id: 'chip-5',
    label: '💤 Sleep Stage 3/4 Pulse',
    category: 'Sleep & Hormones',
    prompt: 'Why does sleeping after midnight hurt my growth velocity?',
    presetResponse: 'Over 75% of daily pulsatile growth hormone is secreted during Slow-Wave Sleep (SWS). Melatonin and circadian rhythm dysregulation from late screen time delays SWS onset, blunting the peak anabolic secretion window.',
    clicksCount: 1940,
    active: true,
    order: 5,
  },
  {
    id: 'chip-6',
    label: '🏋️ Heavy Lifting Myth',
    category: 'Posture & Spine',
    prompt: 'Does weightlifting or resistance exercise stunt adolescent growth?',
    presetResponse: 'According to the American Academy of Pediatrics, properly supervised progressive resistance training does NOT damage growth plates; rather, it promotes bone mineral density and osteoblast stimulation. Only excessive unsupervised spinal axial compressive loads pose injury risk.',
    clicksCount: 1670,
    active: true,
    order: 6,
  },
]

// React hook for synchronized persistent state
export function useAdminData() {
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES)
  const [stretches, setStretches] = useState<SpinalStretch[]>(INITIAL_STRETCHES)
  const [categories, setCategories] = useState<WorkoutCategory[]>(INITIAL_CATEGORIES)
  const [categoryQuestions, setCategoryQuestions] = useState<CategoryQuestion[]>(INITIAL_CATEGORY_QUESTIONS)
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS)
  const [users, setUsers] = useState<UserBiometricProfile[]>(INITIAL_USERS)
  const [aiChips, setAiChips] = useState<AiPromptChip[]>(INITIAL_AI_CHIPS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedBadges = localStorage.getItem('gotall_admin_badges')
      const savedStretches = localStorage.getItem('gotall_admin_stretches')
      const savedCategories = localStorage.getItem('gotall_admin_categories')
      const savedCategoryQuestions = localStorage.getItem('gotall_admin_category_questions')
      const savedFoods = localStorage.getItem('gotall_admin_foods')
      const savedUsers = localStorage.getItem('gotall_admin_users')
      const savedAiChips = localStorage.getItem('gotall_admin_aichips')

      if (savedBadges) setBadges(JSON.parse(savedBadges))
      if (savedStretches) setStretches(JSON.parse(savedStretches))
      if (savedCategories) setCategories(JSON.parse(savedCategories))
      if (savedCategoryQuestions) setCategoryQuestions(JSON.parse(savedCategoryQuestions))
      if (savedFoods) setFoods(JSON.parse(savedFoods))
      if (savedUsers) setUsers(JSON.parse(savedUsers))
      if (savedAiChips) setAiChips(JSON.parse(savedAiChips))
    } catch (e) {
      console.warn('Failed reading from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Auto-save helpers
  const saveBadges = (newBadges: AchievementBadge[]) => {
    setBadges(newBadges)
    try {
      localStorage.setItem('gotall_admin_badges', JSON.stringify(newBadges))
    } catch (e) {}
  }

  const saveStretches = (newStretches: SpinalStretch[]) => {
    setStretches(newStretches)
    try {
      localStorage.setItem('gotall_admin_stretches', JSON.stringify(newStretches))
    } catch (e) {}
  }

  const saveCategories = (newCategories: WorkoutCategory[]) => {
    setCategories(newCategories)
    try {
      localStorage.setItem('gotall_admin_categories', JSON.stringify(newCategories))
    } catch (e) {}
  }

  const saveCategoryQuestions = (newQuestions: CategoryQuestion[]) => {
    setCategoryQuestions(newQuestions)
    try {
      localStorage.setItem('gotall_admin_category_questions', JSON.stringify(newQuestions))
    } catch (e) {}
  }

  const saveFoods = (newFoods: FoodItem[]) => {
    setFoods(newFoods)
    try {
      localStorage.setItem('gotall_admin_foods', JSON.stringify(newFoods))
    } catch (e) {}
  }

  const saveUsers = (newUsers: UserBiometricProfile[]) => {
    setUsers(newUsers)
    try {
      localStorage.setItem('gotall_admin_users', JSON.stringify(newUsers))
    } catch (e) {}
  }

  const saveAiChips = (newChips: AiPromptChip[]) => {
    setAiChips(newChips)
    try {
      localStorage.setItem('gotall_admin_aichips', JSON.stringify(newChips))
    } catch (e) {}
  }

  const resetToSeeds = () => {
    saveBadges(INITIAL_BADGES)
    saveStretches(INITIAL_STRETCHES)
    saveCategories(INITIAL_CATEGORIES)
    saveCategoryQuestions(INITIAL_CATEGORY_QUESTIONS)
    saveFoods(INITIAL_FOODS)
    saveUsers(INITIAL_USERS)
    saveAiChips(INITIAL_AI_CHIPS)
  }

  return {
    isLoaded,
    badges,
    setBadges: saveBadges,
    stretches,
    setStretches: saveStretches,
    categories,
    setCategories: saveCategories,
    categoryQuestions,
    setCategoryQuestions: saveCategoryQuestions,
    foods,
    setFoods: saveFoods,
    users,
    setUsers: saveUsers,
    aiChips,
    setAiChips: saveAiChips,
    resetToSeeds,
  }
}


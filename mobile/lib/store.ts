import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizData, calculateTarget } from './growth-calc';
import { supabase, isSupabaseConfigured } from './supabase';
import { classifyBiomechanicalArchetype, buildCalibrated6WeekProgram, BiomechanicalClassification } from './ai-program-generator';

export interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Bedtime Anabolic' | 'Snack';
  time: string;
}

export interface SleepLog {
  id: string;
  date: string;
  dayOfWeek: string;
  bedtime?: string;
  wakeupTime?: string;
  hours: number;
  quality: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google' | 'apple' | 'supabase';
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export interface StretchExercise {
  id: number;
  title: string;
  category: 'Height Growth' | 'Strength' | 'Posture';
  tag: string;
  targetZone: string;
  durationSeconds: number;
  intensity: 'Beginner' | 'Intermediate' | 'Advanced';
  clinicalBenefit: string;
  instructions: string[];
  contraindications?: string;
  media_url?: string;
  media_type?: 'video' | 'gif' | 'image';
}

export interface AchievementBadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  icon_url?: string;
  category: 'streak' | 'stretches' | 'nutrition' | 'sleep' | 'biometrics';
  targetMetric: string;
  targetValue: number;
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citation?: string;
  timestamp: string;
}

export interface DailyTodo {
  id: string;
  title: string;
  category: 'Habit' | 'Spinal' | 'Nutrition' | 'Recovery' | 'Custom';
  icon?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  isDefault?: boolean;
}

export const INITIAL_DAILY_TODOS: DailyTodo[] = [
  {
    id: 'todo-1',
    title: 'Drink 2.5L Water for Spinal Disc Hydration',
    category: 'Habit',
    icon: '💧',
    completed: false,
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'todo-2',
    title: 'Complete 15-Min Axial Spinal Decompression',
    category: 'Spinal',
    icon: '🧘',
    completed: false,
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'todo-3',
    title: 'Take Bone Matrix Nutrients (Vitamin D3 + Calcium)',
    category: 'Nutrition',
    icon: '💊',
    completed: false,
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'todo-4',
    title: 'Sleep 8.5 Hours (In bed before 10:30 PM for hGH Peak)',
    category: 'Recovery',
    icon: '🌙',
    completed: false,
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'todo-5',
    title: '5-Min Posture Reset (Scapular Retraction & Wall Check)',
    category: 'Spinal',
    icon: '⚡',
    completed: false,
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];

export const CLINICAL_STRETCHES: StretchExercise[] = [
  {
    id: 0,
    title: 'Dead Hang Disc Traction',
    category: 'Height Growth',
    tag: 'Axial Elongation',
    targetZone: 'Lumbar & Thoracic',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Creates negative intradiscal pressure using bodyweight, allowing synovial fluid to rehydrate compressed L1–L5 discs.',
    instructions: [
      'Grip overhead bar shoulder-width apart with an overhand grip.',
      'Allow feet to hang freely; keep core and shoulders relaxed.',
      'Breathe deeply and let gravity elongate your vertebral column.',
      'Disengage smoothly without jumping down abruptly.',
    ],
    contraindications: 'Shoulder impingement or acute wrist injury.',
    media_type: 'video',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 1,
    title: 'Cobra Pose (Bhujangasana)',
    category: 'Height Growth',
    tag: 'Spine Decompression',
    targetZone: 'Lumbar Lordosis',
    durationSeconds: 45,
    intensity: 'Beginner',
    clinicalBenefit: 'Promotes restorative lumbar lordosis and counteracts prolonged sedentary thoracic kyphosis.',
    instructions: [
      'Lie face down on mat with palms flat beneath shoulders.',
      'Engage glutes and gently press through palms to lift chest.',
      'Keep pelvis glued to mat and gaze forward.',
      'Hold position and inhale slowly into abdomen for 45s.',
    ],
    contraindications: 'Severe spondylolisthesis or active disc herniation.',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Cat-Cow Posture Flow',
    category: 'Posture',
    tag: 'Thoracic Mobility',
    targetZone: 'Thoracic Articulation',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Circulates synovial fluid across the 24 articulating vertebrae and improves thoracic extension.',
    instructions: [
      'Start on all fours with hands under shoulders, knees under hips.',
      'Inhale: Drop belly, lift chest and tailbone (Cow).',
      'Exhale: Arch spine toward ceiling, tucking chin (Cat).',
      'Cycle rhythmically with breath for 10-12 repetitions.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Pelvic Shift & Glute Bridge',
    category: 'Strength',
    tag: 'Lower Spine Release',
    targetZone: 'Pelvic Neutralization',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Rebalances anterior pelvic tilt to unlock 1.0–2.0 cm of obscured standing stature.',
    instructions: [
      'Lie supine with knees bent and feet flat on floor, hip-width apart.',
      'Press lower back flat into floor (posterior pelvic tilt).',
      'Drive through heels to lift hips in line with thighs.',
      'Hold peak squeeze for 3 seconds, lower slowly, and repeat.',
    ],
    media_type: 'video',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 4,
    title: 'Child’s Pose Extension',
    category: 'Height Growth',
    tag: 'Full Back Decompression',
    targetZone: 'Lumbar Paraspinal',
    durationSeconds: 60,
    intensity: 'Beginner',
    clinicalBenefit: 'Relaxes deep erector spinae musculature and opens posterior intervertebral disc spaces.',
    instructions: [
      'Kneel on floor with big toes touching, knees spread wide.',
      'Sit hips back onto heels and fold forward, resting forehead on mat.',
      'Crawl fingertips forward to actively stretch latissimus dorsi.',
      'Breathe deeply into posterior ribcage for 60 seconds.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    title: 'Wall Angel Scapular Retraction',
    category: 'Posture',
    tag: 'Cervical Alignment',
    targetZone: 'Cervical & Upper Spine',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Reverses forward head posture (text neck) which typically causes 1.5 cm stature shortening.',
    instructions: [
      'Stand with heels, glutes, upper back, and head against wall.',
      'Bring arms into 90-degree "goalpost" position against wall.',
      'Slowly slide hands upward overhead while maintaining contact.',
      'Return to 90 degrees; repeat smoothly for 12 reps.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: 'Standing Axial Reach',
    category: 'Posture',
    tag: 'Posture Alignment',
    targetZone: 'Full Axial Column',
    durationSeconds: 45,
    intensity: 'Beginner',
    clinicalBenefit: 'De-rotates ribcage and elongates posterior longitudinal ligament before sleep.',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Interlock fingers overhead with palms facing ceiling.',
      'Reach upward while rising onto balls of feet.',
      'Hold tall alignment for 5 breaths, lower, and repeat.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 7,
    title: 'Kneeling Psoas Release',
    category: 'Strength',
    tag: 'Vertebral Release',
    targetZone: 'Hip Flexor / Pelvis',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Lengthens hypertonic psoas muscles that pull the lumbar spine into exaggerated lordosis.',
    instructions: [
      'Step right foot forward into 90-degree lunge, resting left knee on mat.',
      'Tuck pelvis under and gently shift weight forward into left hip.',
      'Raise left arm overhead and lean gently to right.',
      'Hold 30s per side for a total of 60 seconds.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    title: 'Incline Dumbbell Form & Clavicle Stretch',
    category: 'Strength',
    tag: 'Pectoral Expansion',
    targetZone: 'Upper Chest & Clavicle',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Expands the upper thoracic rib cage and stimulates clavicular bone mineralization for broader posture.',
    instructions: [
      'Position torso on a 30-degree incline surface with dumbbells at shoulder height.',
      'Press upward in an arc, focusing on upper pectoral contraction.',
      'Lower slowly over 3 seconds to achieve a deep stretch across the sternum.',
      'Perform 4 sets with controlled breathing.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 9,
    title: 'Romanian Deadlift Spinal Hip Hinge',
    category: 'Strength',
    tag: 'Posterior Chain Density',
    targetZone: 'Erector Spinae & Hamstrings',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Strengthens the deep paraspinal muscle columns to keep the spinal column naturally upright against gravity.',
    instructions: [
      'Stand feet hip-width apart holding weight with shoulders retracted.',
      'Hinge at hips, driving pelvis backward while keeping back strictly flat.',
      'Lower bar to mid-shin level until hamstrings are fully engaged.',
      'Drive through heels to return to tall standing lock.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 10,
    title: 'Goblet Squat & Thoracic Wedge',
    category: 'Strength',
    tag: 'Axial Loading',
    targetZone: 'Pelvis & Femoral Plates',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Loads the lower extremity long bones to stimulate growth factors and anabolic hormone secretion.',
    instructions: [
      'Hold dumbbell vertically against chest with elbows pointing down.',
      'Squat deep between knees while maintaining an upright vertical chest.',
      'Hold bottom position for 1 second to stretch adductors and groin.',
      'Exhale and drive up powerfully.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 11,
    title: 'High-Knee Metabolic Mountain Climbers',
    category: 'Posture',
    tag: 'Caloric Burn',
    targetZone: 'Transverse Abdominis & Core',
    durationSeconds: 45,
    intensity: 'Intermediate',
    clinicalBenefit: 'Burns visceral abdominal fat while strengthening deep pelvic stabilizers to prevent anterior pelvic tilt.',
    instructions: [
      'Start in a push-up plank with wrists directly beneath shoulders.',
      'Drive right knee rapidly toward chest without raising hips.',
      'Alternate legs at an athletic, controlled cadence for 45 seconds.',
      'Keep core braced and spine neutral throughout.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 12,
    title: 'Hollow Body Core Compression',
    category: 'Posture',
    tag: 'Midsection Flattening',
    targetZone: 'Deep Core & Lumbar Stabilization',
    durationSeconds: 45,
    intensity: 'Beginner',
    clinicalBenefit: 'Reverses lumbar hyperextension and flattens lower abdomen, unlocking 1–2 cm of obscured standing stature.',
    instructions: [
      'Lie flat on back and press lower lumbar spine firmly into the floor.',
      'Raise arms overhead and lift shoulder blades and heels 6 inches off ground.',
      'Hold banana shape while breathing shallowly through rib cage.',
      'Ensure lower back never peels away from the surface.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 13,
    title: 'Wide-Grip Lat Extension & Rib Cage Expansion',
    category: 'Height Growth',
    tag: 'V-Taper Traction',
    targetZone: 'Latissimus Dorsi & Costal Cartilage',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Expands the lateral rib cage and widens upper torso V-taper, creating immediate height and shoulder presence.',
    instructions: [
      'Grip wide overhead bar with overhand grip wider than shoulders.',
      'Pull elbows down and backward toward back pockets, arching upper thoracic spine.',
      'Squeeze shoulder blades together at bottom for 2 seconds.',
      'Slowly release to full overhead lat stretch.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 14,
    title: 'Standing Arnold Overhead Lockout',
    category: 'Strength',
    tag: 'Scapular Plane Hypertrophy',
    targetZone: 'Deltoids & Trapezius',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Builds 3D shoulder caps while demanding vertical spine stabilization under overhead load.',
    instructions: [
      'Stand upright holding dumbbells at chest height with palms facing inward.',
      'Rotate palms outward as you press overhead in a smooth spiral motion.',
      'Lock out with bicep adjacent to ears and ribs pulled down.',
      'Lower slowly along the same rotational path.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 15,
    title: 'Hanging Decompression Knee Tucks',
    category: 'Height Growth',
    tag: 'Axial Traction & Core',
    targetZone: 'Lower Lumbar & Lower Abs',
    durationSeconds: 60,
    intensity: 'Intermediate',
    clinicalBenefit: 'Simultaneously decompresses lower lumbar discs while strengthening lower rectus abdominis.',
    instructions: [
      'Hang from bar with relaxed shoulders to initiate axial spine traction.',
      'Curl pelvis upward and draw knees smoothly toward chest.',
      'Pause for 1 second at top contraction.',
      'Lower legs slowly without swinging back and forth.',
    ],
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_BADGES: AchievementBadgeItem[] = [
  {
    id: 'badge-1',
    title: 'Spine Alignment Pioneer',
    description: 'Complete your first clinical spinal decompression session.',
    icon: '🧘',
    category: 'stretches',
    targetMetric: 'stretches_completed',
    targetValue: 1,
    xpReward: 50,
    tier: 'bronze',
  },
  {
    id: 'badge-2',
    title: '7-Day Disc Traction Streak',
    description: 'Maintain 7 consecutive days of intervertebral decompression.',
    icon: '🔥',
    category: 'streak',
    targetMetric: 'streak_days',
    targetValue: 7,
    xpReward: 200,
    tier: 'silver',
  },
  {
    id: 'badge-3',
    title: 'Somatotropin Pulse Synced',
    description: 'Log 8+ hours of sleep during the slow-wave peak anabolic window.',
    icon: '🌙',
    category: 'sleep',
    targetMetric: 'deep_sleep_hours',
    targetValue: 8,
    xpReward: 100,
    tier: 'bronze',
  },
  {
    id: 'badge-4',
    title: 'Protein Synthesis Maxima',
    description: 'Hit 100g+ daily protein requirement for skeletal chondrocytes.',
    icon: '🥩',
    category: 'nutrition',
    targetMetric: 'protein_target_hit',
    targetValue: 100,
    xpReward: 75,
    tier: 'bronze',
  },
  {
    id: 'badge-5',
    title: '14-Day Epiphyseal Master',
    description: '14 days of unbroken multi-factorial protocol adherence.',
    icon: '⚡',
    category: 'streak',
    targetMetric: 'streak_days',
    targetValue: 14,
    xpReward: 500,
    tier: 'gold',
  },
  {
    id: 'badge-6',
    title: '100 Decompressions Milestone',
    description: 'Perform 100 cumulative spinal decompression sessions.',
    icon: '🏆',
    category: 'stretches',
    targetMetric: 'stretches_completed',
    targetValue: 100,
    xpReward: 1000,
    tier: 'platinum',
  },
  {
    id: 'badge-7',
    title: 'Tanner Baseline Calibrated',
    description: 'Complete the comprehensive 15-factor biometric diagnostic.',
    icon: '🧬',
    category: 'biometrics',
    targetMetric: 'quiz_completed',
    targetValue: 1,
    xpReward: 150,
    tier: 'silver',
  },
  {
    id: 'badge-8',
    title: 'Hydration Disc Guard',
    description: 'Meet full daily water and bone-mineral electrolyte quotas for 5 days.',
    icon: '💧',
    category: 'nutrition',
    targetMetric: 'water_quota_met',
    targetValue: 5,
    xpReward: 250,
    tier: 'silver',
  },
];

export interface WorkoutCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  workoutIds: string[];
  active: boolean;
  order: number;
}

export interface CategoryQuestion {
  id: string;
  categoryId: string;
  questionText: string;
  subtitle: string;
  options: Array<{
    label: string;
    sublabel?: string;
    icon?: string;
    scoreBoost?: number;
  }>;
  active: boolean;
  order: number;
}

export const INITIAL_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'cat-1',
    name: 'Height Growth & Spinal Decompression',
    slug: 'height-growth',
    icon: '🌱',
    description: 'Axial gravity decompression and synovial fluid rehydration of L1–L5 intervertebral discs.',
    color: '#0284C7',
    workoutIds: ['0', '1', '4'],
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
    workoutIds: ['2', '5', '6'],
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
    workoutIds: ['3', '7'],
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
    workoutIds: ['0', '2', '6'],
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
    workoutIds: ['1', '4', '7'],
    active: true,
    order: 5,
  },
  {
    id: 'cat-6',
    name: 'Weight Gain & Muscle Density',
    slug: 'weight-gain',
    icon: '🥩',
    description: 'Progressive structural hypertrophy and caloric surplus optimization for ectomorph frames.',
    color: '#EA580C',
    workoutIds: ['8', '9', '10', '0'],
    active: true,
    order: 6,
  },
  {
    id: 'cat-7',
    name: 'Weight Loss & Metabolic Shred',
    slug: 'weight-loss',
    icon: '🔥',
    description: 'High-metabolic core circuits and visceral fat reduction to reveal lean upright posture.',
    color: '#DC2626',
    workoutIds: ['11', '12', '2', '3'],
    active: true,
    order: 7,
  },
  {
    id: 'cat-8',
    name: 'Bodybuilder & V-Taper Sculpt',
    slug: 'bodybuilder',
    icon: '🏆',
    description: 'Advanced muscular symmetry, wide lat flare, and progressive overload with spinal alignment.',
    color: '#7C3AED',
    workoutIds: ['13', '14', '15', '0'],
    active: true,
    order: 8,
  },
];

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
  {
    id: 'cq-5',
    categoryId: 'cat-6',
    questionText: 'What is your primary weight gain objective?',
    subtitle: 'Calibrates daily caloric surplus and skeletal amino acid density targets.',
    options: [
      { label: 'Lean Muscular Bulk (+3–5 kg)', sublabel: 'Athletic muscle with minimal fat gain', icon: '💪' },
      { label: 'Overcoming Fast Metabolism (+5–10 kg)', sublabel: 'Dense calorie protocols for hardgainers', icon: '⚡' },
      { label: 'Heavy Mass Building (+10+ kg)', sublabel: 'Substantial structural frame expansion', icon: '🏋️' },
    ],
    active: true,
    order: 5,
  },
  {
    id: 'cq-6',
    categoryId: 'cat-6',
    questionText: 'What describes your daily appetite & meal consistency?',
    subtitle: 'Determines whether liquid nutrition or frequent meals are needed to hit surplus.',
    options: [
      { label: 'Hardgainer (Get full very quickly)', sublabel: 'Needs liquid calorie density and shakes', icon: '🥤' },
      { label: 'Moderate (Eat 3 meals, hard to gain)', sublabel: 'Needs post-workout calorie booster', icon: '🍽️' },
      { label: 'Strong appetite (Can eat consistently)', sublabel: 'Focus on protein quality and heavy lifting', icon: '🥩' },
    ],
    active: true,
    order: 6,
  },
  {
    id: 'cq-7',
    categoryId: 'cat-7',
    questionText: 'What is your primary weight reduction focus?',
    subtitle: 'Tailors cardio intervals and core decompression pacing to preserve posture.',
    options: [
      { label: 'Belly fat reduction & posture reveal', sublabel: 'Eliminates abdominal weight pulling spine forward', icon: '🎯' },
      { label: 'Athletic recomp & waist slimming', sublabel: 'Reclaims narrow waist and height illusion', icon: '⏳' },
      { label: 'Total body transformation (-10+ kg)', sublabel: 'Comprehensive metabolic and mobility routine', icon: '🔥' },
    ],
    active: true,
    order: 7,
  },
  {
    id: 'cq-8',
    categoryId: 'cat-7',
    questionText: 'What is your biggest hurdle when maintaining a caloric deficit?',
    subtitle: 'Adjusts bedtime nutrition to protect nocturnal somatotropin secretion.',
    options: [
      { label: 'Late-night cravings & hunger', sublabel: 'We will optimize slow-digesting micellar casein', icon: '🌙' },
      { label: 'Afternoon energy crashes', sublabel: 'Balanced low-glycemic hydration strategies', icon: '🔋' },
      { label: 'Slow metabolism / plateau', sublabel: 'High-NEAT step targets and metabolic circuits', icon: '📈' },
    ],
    active: true,
    order: 8,
  },
  {
    id: 'cq-9',
    categoryId: 'cat-8',
    questionText: 'What is your resistance training experience level?',
    subtitle: 'Calibrates mechanical tension and progressive overload volume.',
    options: [
      { label: 'Beginner (<1 year lifting)', sublabel: 'Focus on compound form and spinal safety', icon: '🌱' },
      { label: 'Intermediate (1–3 years)', sublabel: 'Progressive overload with dedicated split', icon: '⚡' },
      { label: 'Advanced (3+ years)', sublabel: 'High-volume hypertrophy & micro-adjustments', icon: '🏆' },
    ],
    active: true,
    order: 9,
  },
  {
    id: 'cq-10',
    categoryId: 'cat-8',
    questionText: 'What is your primary aesthetic physique target?',
    subtitle: 'Aligns exercises to accentuate vertical V-taper ratios.',
    options: [
      { label: 'V-Taper (Wide lats & capped shoulders)', sublabel: 'Maximizes illusion of shoulder width & height', icon: '📐' },
      { label: 'Thick Chest & Spinal Extensors', sublabel: 'Upright clinical rib cage posture', icon: '🛡️' },
      { label: 'Full Body Symmetry & Power', sublabel: 'Balanced athletic hypertrophy', icon: '⚡' },
    ],
    active: true,
    order: 10,
  },
];

export const INITIAL_SLEEP_LOGS: SleepLog[] = [];

export function buildWeeklyPlanSchedule(
  exercises: StretchExercise[],
  daysCount: number
): { plan: Record<string, StretchExercise[]>; activeDay: string } {
  const dayNamesByCount: Record<number, string[]> = {
    3: ['Monday (Decompress)', 'Wednesday (Core Align)', 'Friday (Traction)'],
    4: ['Monday (Decompress)', 'Tuesday (Spine Core)', 'Thursday (Traction)', 'Saturday (Full Alignment)'],
    5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };

  const days = dayNamesByCount[daysCount] || dayNamesByCount[4];
  const plan: Record<string, StretchExercise[]> = {};

  const heightGrowth = exercises.filter((e) => e.category === 'Height Growth');
  const strength = exercises.filter((e) => e.category === 'Strength');
  const posture = exercises.filter((e) => e.category === 'Posture');

  days.forEach((dayName, dayIdx) => {
    const h1 = heightGrowth[(dayIdx * 2) % (heightGrowth.length || 1)] || exercises[0];
    const h2 = heightGrowth[(dayIdx * 2 + 1) % (heightGrowth.length || 1)] || exercises[1 % exercises.length];
    const s1 = strength[dayIdx % (strength.length || 1)] || exercises[2 % exercises.length];
    const p1 = posture[dayIdx % (posture.length || 1)] || exercises[3 % exercises.length];

    const dayRoster: StretchExercise[] = [];
    [h1, p1, s1, h2].forEach((item) => {
      if (item && !dayRoster.some((r) => r.id === item.id)) {
        dayRoster.push(item);
      }
    });

    plan[dayName] = dayRoster;
  });

  return { plan, activeDay: days[0] };
}

export interface ProgramWeekInfo {
  weekNumber: number;
  title: string;
  focus: string;
  scientificGoal: string;
  plan: Record<string, StretchExercise[]>;
}

export const PROGRAM_WEEK_METADATA: Array<{ title: string; focus: string; scientificGoal: string }> = [
  {
    title: 'Axial Decompression & Baseline Mobilization',
    focus: 'Thoracic & Lumbar Space Restoration',
    scientificGoal: 'Rehydrating intervertebral fibrocartilage discs after daily gravity compression.',
  },
  {
    title: 'Thoracic Expansion & Lordosis Correction',
    focus: 'Spinal Kyphosis & Ribcage Alignment',
    scientificGoal: 'Opening thoracic curvature and correcting anterior head posture to reclaim 1-2 cm of true vertical height.',
  },
  {
    title: 'Deep Core Stabilization & Pelvic Neutrality',
    focus: 'Transverse Abdominis & Sacral Traction',
    scientificGoal: 'Eliminating excessive anterior pelvic tilt to lock in upright spinal verticality.',
  },
  {
    title: 'Epiphyseal Micro-Traction & Joint Mobilization',
    focus: 'Distal Femur & Proximal Tibia Tension',
    scientificGoal: 'Stimulating chondrocyte proliferation at the lower limb growth plates through controlled elongation.',
  },
  {
    title: 'Advanced Longitudinal Traction & Kinetic Symmetry',
    focus: 'Full Axial Spinal & Lower Extremity Elongation',
    scientificGoal: 'Deep fascia decompression across the complete posterior kinetic chain for enhanced overnight growth hormone response.',
  },
  {
    title: 'Kinetic Chain Integration & Permanent Maintenance',
    focus: 'Neuromuscular Lock-In & Postural Anchoring',
    scientificGoal: 'Consolidating cumulative vertical structural gains into permanent biomechanical posture memory.',
  },
];

export function buildMultiWeekProgramSchedule(
  exercises: StretchExercise[],
  daysCount: number,
  totalWeeks = 6
): Record<number, ProgramWeekInfo> {
  const result: Record<number, ProgramWeekInfo> = {};
  const pool = exercises.length > 0 ? exercises : CLINICAL_STRETCHES;

  for (let w = 1; w <= totalWeeks; w++) {
    const meta = PROGRAM_WEEK_METADATA[(w - 1) % PROGRAM_WEEK_METADATA.length];
    // Rotate and shift exercise pool to create distinct progressive routines each week
    const shifted = pool.map((_, i) => pool[(i + (w - 1) * 2) % pool.length]);
    const { plan } = buildWeeklyPlanSchedule(shifted, daysCount);
    result[w] = {
      weekNumber: w,
      title: `Week ${w}: ${meta.title}`,
      focus: meta.focus,
      scientificGoal: meta.scientificGoal,
      plan,
    };
  }

  return result;
}

const initialSchedule = buildWeeklyPlanSchedule(CLINICAL_STRETCHES, 4);
const initialMultiWeekPlan = buildMultiWeekProgramSchedule(CLINICAL_STRETCHES, 4, 6);

interface AppState {
  quizData: QuizData | null;
  isPremium: boolean;
  subscriptionTier: string;
  setSubscriptionTier: (tier: string) => void;
  streakDays: number;
  completedStretches: number[];
  meals: LoggedMeal[];
  badges: AchievementBadgeItem[];
  unlockedBadgeIds: string[];
  newlyUnlockedBadge: AchievementBadgeItem | null;
  chatMessages: ChatMessage[];
  paymentOrderId: string | null;

  // Weekly Auto-Scheduler state
  workoutDaysPerWeek: number;
  activePlanDay: string;
  weeklyPlan: Record<string, StretchExercise[]>;

  // Daily Protocol To-Dos State & Actions
  todos: DailyTodo[];
  toggleTodo: (id: string) => void;
  addTodo: (todo: { title: string; category?: DailyTodo['category']; icon?: string }) => void;
  deleteTodo: (id: string) => void;
  resetDailyTodos: () => void;

  // Multi-Week Program Progression & Gating
  currentProgramWeek: number;
  selectedViewingWeek: number;
  completedWeeks: number[];
  totalProgramWeeks: number;
  multiWeekPlan: Record<number, ProgramWeekInfo>;
  setSelectedViewingWeek: (week: number) => void;
  advanceToNextWeek: () => void;
  completeCurrentWeek: () => void;

  // AI Program Personalization & Disclaimer State
  isProgramCalibrated: boolean;
  programCalibrationDate: string | null;
  biomechanicalProfile: BiomechanicalClassification | null;
  hasAcceptedHealthDisclaimer: boolean;
  setHasAcceptedHealthDisclaimer: (accepted: boolean) => void;
  calibratePersonalizedProgram: (diagnosticOverride?: any) => Promise<void>;

  // Categories & Question Templates
  categories: WorkoutCategory[];
  categoryQuestions: CategoryQuestion[];

  // Sleep tracking state
  sleepLogs: SleepLog[];
  sleepTargetHours: number;

  // Authentication state
  user: UserProfile | null;
  pendingRegistration: { name: string; email: string; password: string } | null;

  // App Walkthrough Guided Tour
  hasSeenAppTour: boolean;

  // AI Advisor Quota State (24h rolling window from first question)
  aiQuestionsUsedToday: number;
  lastAiQuestionDate: string;
  aiWindowStart: number | null;
  incrementAiQuestionsUsed: () => void;
  getAiQuota: () => {
    limit: number;
    used: number;
    remaining: number;
    resetCountdown: string;
    planName: string;
    isExhausted: boolean;
  };

  // App Hydration State
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  // Actions
  setQuizData: (data: QuizData) => void;
  setPremium: (status: boolean) => void;
  setPaymentOrderId: (orderId: string | null) => void;
  setPendingRegistration: (data: { name: string; email: string; password: string } | null) => void;
  completeSubscriptionAndCreateAccount: (paymentId: string, planName: string) => Promise<boolean>;
  setHasSeenAppTour: (seen: boolean) => void;
  toggleStretch: (index: number) => void;
  markStretchComplete: (index: number) => void;
  addMeal: (meal: Omit<LoggedMeal, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addSleepLog: (log: Omit<SleepLog, 'id' | 'timestamp'>) => void;
  deleteSleepLog: (id: string) => void;
  setSleepTargetHours: (hrs: number) => void;
  setUser: (user: UserProfile | null) => void;
  signOut: () => void;
  unlockBadge: (badgeId: string) => void;
  clearNewlyUnlockedBadge: () => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  checkBadges: () => void;
  resetAllData: () => void;
  deleteAccount: () => Promise<void>;
  downloadAllUserData: () => string;

  // Category Actions
  setCategories: (categories: WorkoutCategory[]) => void;
  setCategoryQuestions: (questions: CategoryQuestion[]) => void;

  // Weekly Plan Actions
  setWorkoutDaysPerWeek: (days: number) => void;
  setActivePlanDay: (day: string) => void;
  generateWeeklyPlan: (daysPerWeek?: number) => Promise<void>;
  livePresetMeals: any[];
  fetchLiveContent: () => Promise<void>;

  // Live catalog from Supabase (admin-managed)
  liveCatalogStretches: StretchExercise[];
  liveCatalogBadges: AchievementBadgeItem[];
  liveCatalogCategories: WorkoutCategory[];
  setLiveCatalog: (
    stretches: StretchExercise[],
    badges: AchievementBadgeItem[],
    categories: WorkoutCategory[]
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      quizData: null,
      isPremium: false,
      subscriptionTier: 'Free',
      streakDays: 0,
      completedStretches: [],
      paymentOrderId: null,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      // Weekly plan initial values
      workoutDaysPerWeek: 4,
      activePlanDay: initialSchedule.activeDay,
      weeklyPlan: initialSchedule.plan,

      // Multi-Week Program Progression initial values
      currentProgramWeek: 1,
      selectedViewingWeek: 1,
      completedWeeks: [],
      totalProgramWeeks: 4,
      multiWeekPlan: initialMultiWeekPlan,
      setSelectedViewingWeek: (week: number) => set({ selectedViewingWeek: week }),
      advanceToNextWeek: () => {
        const current = get().currentProgramWeek;
        const maxWeeks = get().totalProgramWeeks || 4;
        const completed = get().completedWeeks;
        const next = Math.min(maxWeeks, current + 1);
        const newCompleted = completed.includes(current) ? completed : [...completed, current];
        set({
          currentProgramWeek: next,
          selectedViewingWeek: next,
          completedWeeks: newCompleted,
        });
      },
      completeCurrentWeek: () => {
        const current = get().currentProgramWeek;
        const completed = get().completedWeeks;
        const newCompleted = completed.includes(current) ? completed : [...completed, current];
        const next = Math.min(6, current + 1);
        set({
          completedWeeks: newCompleted,
          currentProgramWeek: next,
          selectedViewingWeek: next,
        });
      },

      // AI Program Personalization & Disclaimer State
      isProgramCalibrated: false,
      programCalibrationDate: null,
      biomechanicalProfile: null,
      hasAcceptedHealthDisclaimer: false,
      setHasAcceptedHealthDisclaimer: (accepted: boolean) => set({ hasAcceptedHealthDisclaimer: accepted }),
      calibratePersonalizedProgram: async (diagnosticOverride?: any) => {
        const s = get();
        const quiz = diagnosticOverride || s.quizData;
        const diagnosticInput = {
          age: quiz?.age || 16,
          gender: quiz?.gender || 'male',
          currentHeight: quiz?.currentHeight || 172,
          sittingHours: quiz?.sittingHours || '6-8 hours/day',
          postureConcern: quiz?.motivation || 'General posture alignment and decompression',
          spinalFatigue: 'Moderate midday spinal compression',
          workoutDaysPerWeek: s.workoutDaysPerWeek || 4,
        };

        const classification = await classifyBiomechanicalArchetype(diagnosticInput);

        let pool = s.liveCatalogStretches.length > 0 ? s.liveCatalogStretches : CLINICAL_STRETCHES;
        if (isSupabaseConfigured() && s.liveCatalogStretches.length === 0) {
          try {
            const { data } = await supabase.from('stretches').select('*').eq('active', true).order('sort_order', { ascending: true });
            if (data && data.length > 0) {
              pool = data.map((item: any, idx: number) => ({
                id: item.id ?? idx,
                title: item.title,
                category: (item.category as any) || 'Height Growth',
                tag: item.tag || 'Clinical Traction',
                targetZone: item.target_zone || 'Lumbar & Thoracic',
                durationSeconds: item.duration_seconds || 60,
                intensity: item.intensity || 'Beginner',
                clinicalBenefit: item.clinical_benefit || 'Promotes spinal decompression and fluid rehydration.',
                instructions: Array.isArray(item.instructions) ? item.instructions : ['Align spine and breathe deeply.'],
                contraindications: item.contraindications || undefined,
                media_url: item.media_url || undefined,
                media_type: item.media_type || undefined,
              }));
            }
          } catch (e) {}
        }

        const days = s.workoutDaysPerWeek || 4;
        const calibratedProgram = buildCalibrated6WeekProgram(classification, pool, days);
        const week1Plan = calibratedProgram[1]?.plan || {};
        const firstDay = Object.keys(week1Plan)[0] || 'Monday';

        set({
          isProgramCalibrated: true,
          programCalibrationDate: new Date().toISOString(),
          biomechanicalProfile: classification,
          multiWeekPlan: calibratedProgram,
          weeklyPlan: week1Plan,
          activePlanDay: firstDay,
          currentProgramWeek: 1,
          selectedViewingWeek: 1,
          completedWeeks: [],
        });
      },

      // Categories and Category Questions
      categories: INITIAL_CATEGORIES,
      categoryQuestions: INITIAL_CATEGORY_QUESTIONS,
      livePresetMeals: [],

      // Live catalog (admin-managed, populated by fetchLiveContent)
      liveCatalogStretches: [],
      liveCatalogBadges: [],
      liveCatalogCategories: [],

      // Sleep tracking state (fresh starter state)
      sleepLogs: [],
      sleepTargetHours: 8.5,

      // Daily Protocol To-Dos State
      todos: INITIAL_DAILY_TODOS,
      toggleTodo: (id: string) => {
        set((state) => {
          const updated = state.todos.map((t) => {
            if (t.id === id) {
              const nextCompleted = !t.completed;
              return {
                ...t,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined,
              };
            }
            return t;
          });
          return { todos: updated };
        });
      },
      addTodo: ({ title, category = 'Custom', icon = '✨' }) => {
        const newTodo: DailyTodo = {
          id: `todo-${Date.now()}`,
          title,
          category,
          icon,
          completed: false,
          createdAt: new Date().toISOString(),
          isDefault: false,
        };
        set((state) => ({ todos: [newTodo, ...state.todos] }));
      },
      deleteTodo: (id: string) => {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
      },
      resetDailyTodos: () => {
        set((state) => ({
          todos: state.todos.map((t) => ({ ...t, completed: false, completedAt: undefined })),
        }));
      },

      // Authentication state
      user: null,
      pendingRegistration: null,

      // Guided Tour state
      hasSeenAppTour: false,

      // AI Advisor Quota state (24h rolling window from first use)
      aiQuestionsUsedToday: 0,
      lastAiQuestionDate: new Date().toISOString().split('T')[0],
      aiWindowStart: null,

      // Initial clean meals log (ready for real user logging)
      meals: [],

      badges: INITIAL_BADGES,
      unlockedBadgeIds: [],
      newlyUnlockedBadge: null,

      chatMessages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          text: 'Hello! I am your GoTall Clinical Growth Advisor. All guidance is calibrated to peer-reviewed pediatric growth curves and spinal biomechanics. Tap any quick topic below or type your question.',
          citation: 'Ref: Tanner-Whitehouse III & AAP Pediatric Endocrine Guidelines',
          timestamp: 'Just now',
        },
      ],

      setQuizData: (data) => set({ quizData: data }),
      setPremium: (status) => set({ isPremium: status, subscriptionTier: status ? 'Pro Monthly' : 'Free' }),
      setSubscriptionTier: (tier) => {
        const isPrem = tier !== 'Free';
        set({ subscriptionTier: tier, isPremium: isPrem });
        const user = get().user;
        if (user?.id && isSupabaseConfigured()) {
          void supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              is_premium: isPrem,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
      },
      setPaymentOrderId: (orderId) => set({ paymentOrderId: orderId }),
      setHasSeenAppTour: (seen) => set({ hasSeenAppTour: seen }),

      toggleStretch: (index) => {
        const { completedStretches } = get();
        const exists = completedStretches.includes(index);
        const updated = exists
          ? completedStretches.filter((i) => i !== index)
          : [...completedStretches, index];

        set({ completedStretches: updated });
        get().checkBadges();
      },

      markStretchComplete: (index) => {
        const { completedStretches } = get();
        if (!completedStretches.includes(index)) {
          set({ completedStretches: [...completedStretches, index] });
          get().checkBadges();
        }
      },

      addMeal: (mealData) => {
        const newMeal: LoggedMeal = {
          ...mealData,
          id: `meal-${Date.now()}`,
        };
        set((state) => ({ meals: [newMeal, ...state.meals] }));
        get().checkBadges();
      },

      deleteMeal: (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
      },

      addSleepLog: (log) => {
        const newLog: SleepLog = {
          ...log,
          id: `sleep-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          sleepLogs: [newLog, ...state.sleepLogs],
        }));
        get().checkBadges();
      },

      deleteSleepLog: (id) => {
        set((state) => ({
          sleepLogs: state.sleepLogs.filter((l) => l.id !== id),
        }));
      },

      setSleepTargetHours: (hrs) => {
        set({ sleepTargetHours: hrs });
      },

      setUser: (user) => {
        set({ user });
      },

      setPendingRegistration: (data) => {
        set({ pendingRegistration: data });
      },

      completeSubscriptionAndCreateAccount: async (paymentId: string, planName: string) => {
        const { pendingRegistration, quizData } = get();
        const email = pendingRegistration?.email || 'patient@gotall.app';
        const name = pendingRegistration?.name || email.split('@')[0];
        const password = pendingRegistration?.password || 'GoTallSecure2026';

        let userId = `user-${Date.now()}`;

        if (isSupabaseConfigured()) {
          try {
            // Register in Supabase Auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { display_name: name },
              },
            });

            if (signUpData?.user?.id) {
              userId = signUpData.user.id;
            } else if (signUpError) {
              // If already registered, sign in to link session
              const { data: signInData } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signInData?.user?.id) {
                userId = signInData.user.id;
              }
            }

            // Sync user profile in Supabase
            await supabase.from('profiles').upsert({
              id: userId,
              user_id: userId,
              email,
              name,
              gender: quizData?.gender === 'female' ? 'Female' : 'Male',
              age: quizData?.age || 17,
              current_height: quizData?.currentHeight || 172.4,
              subscription_tier: planName.includes('Annual') ? 'Pro Annual' : 'Pro Monthly',
              is_premium: true,
            });

            // Log payment
            await supabase.from('payments').insert({
              user_id: userId,
              revenuecat_original_transaction_id: paymentId,
              plan_name: planName,
              amount_paise: planName.includes('Annual') ? 149900 : planName.includes('Quarterly') ? 59900 : 29900,
              currency: 'INR',
              status: 'success',
            });
          } catch (e) {
            console.warn('Supabase account provisioning error:', e);
          }
        }

        const newUser: UserProfile = {
          id: userId,
          email,
          name,
          provider: 'email',
          isLoggedIn: true,
        };

        set({
          user: newUser,
          isPremium: true,
          paymentOrderId: paymentId,
          pendingRegistration: null,
        });

        return true;
      },

      signOut: () => {
        if (isSupabaseConfigured()) {
          supabase.auth.signOut().catch(() => {});
        }
        set({ user: null, isPremium: false, pendingRegistration: null });
      },

      setCategories: (categories) => {
        set({ categories });
      },

      setCategoryQuestions: (categoryQuestions) => {
        set({ categoryQuestions });
      },

      setLiveCatalog: (stretches, badges, categories) => {
        set({
          liveCatalogStretches: stretches,
          liveCatalogBadges: badges,
          liveCatalogCategories: categories,
        });
      },

      unlockBadge: (badgeId) => {
        const { unlockedBadgeIds, badges } = get();
        if (!unlockedBadgeIds.includes(badgeId)) {
          const badge = badges.find((b) => b.id === badgeId);
          set({
            unlockedBadgeIds: [...unlockedBadgeIds, badgeId],
            newlyUnlockedBadge: badge || null,
          });
        }
      },

      clearNewlyUnlockedBadge: () => set({ newlyUnlockedBadge: null }),

      addChatMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}`,
          timestamp: 'Just now',
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
      },

      incrementAiQuestionsUsed: () => {
        const now = Date.now();
        const s = get();
        const windowDuration = 24 * 60 * 60 * 1000;
        const windowExpired = !s.aiWindowStart || (now - s.aiWindowStart >= windowDuration);

        if (windowExpired) {
          // Rolling 24-hour window starts from the exact moment of first use
          set({
            aiWindowStart: now,
            aiQuestionsUsedToday: 1,
            lastAiQuestionDate: new Date(now).toISOString().split('T')[0],
          });
        } else {
          set({ aiQuestionsUsedToday: s.aiQuestionsUsedToday + 1 });
        }
      },

      getAiQuota: () => {
        const s = get();
        const now = Date.now();
        const windowDuration = 24 * 60 * 60 * 1000;
        const hasActiveWindow = s.aiWindowStart !== null && (now - s.aiWindowStart < windowDuration);

        // If window has elapsed, count is 0 until next question
        const used = hasActiveWindow ? s.aiQuestionsUsedToday : 0;
        const limit = 5;
        const remaining = Math.max(0, limit - used);
        const planName = s.isPremium ? 'Pro Clinical' : 'Free';

        let resetCountdown = 'Ready';
        if (hasActiveWindow && s.aiWindowStart) {
          const diffMs = Math.max(0, (s.aiWindowStart + windowDuration) - now);
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          resetCountdown = `${hours}h ${minutes}m`;
        }

        return {
          limit,
          used,
          remaining,
          resetCountdown,
          planName,
          isExhausted: remaining <= 0,
        };
      },

      checkBadges: () => {
        const state = get();
        const totalProtein = state.meals.reduce((sum, m) => sum + m.protein, 0);
        const stretchesCount = state.completedStretches.length;
        const streak = state.streakDays;
        const mealsCount = state.meals.length;
        const maxSleepHours = state.sleepLogs.reduce((max, l) => Math.max(max, l.hours), 0);

        // 1. Dynamic evaluation across all configured/synced badges from Supabase
        state.badges.forEach((b) => {
          if (state.unlockedBadgeIds.includes(b.id)) return;

          let shouldUnlock = false;
          const metric = (b.targetMetric || '').toLowerCase();
          const target = b.targetValue || 1;

          if (metric.includes('protein')) {
            shouldUnlock = totalProtein >= target;
          } else if (metric.includes('stretch') || metric.includes('workout')) {
            shouldUnlock = stretchesCount >= target;
          } else if (metric.includes('streak')) {
            shouldUnlock = streak >= target;
          } else if (metric.includes('sleep')) {
            shouldUnlock = maxSleepHours >= target;
          } else if (metric.includes('nutrition') || metric.includes('meal')) {
            shouldUnlock = mealsCount >= target;
          }

          if (shouldUnlock) {
            state.unlockBadge(b.id);
          }
        });

        // 2. Hardcoded fallback checks for default initial badges
        if (totalProtein >= 100 && !state.unlockedBadgeIds.includes('badge-4')) {
          state.unlockBadge('badge-4');
        }
        if (stretchesCount >= 1 && !state.unlockedBadgeIds.includes('badge-1')) {
          state.unlockBadge('badge-1');
        }
        if (streak >= 7 && !state.unlockedBadgeIds.includes('badge-2')) {
          state.unlockBadge('badge-2');
        }
        if (maxSleepHours >= 8.0 && !state.unlockedBadgeIds.includes('badge-3')) {
          state.unlockBadge('badge-3');
        }
      },

      setWorkoutDaysPerWeek: (days) => {
        set({ workoutDaysPerWeek: days });
        get().generateWeeklyPlan(days);
      },

      setActivePlanDay: (day) => {
        set({ activePlanDay: day });
      },

      generateWeeklyPlan: async (daysPerWeek) => {
        const currentDays = daysPerWeek ?? get().workoutDaysPerWeek ?? 4;
        const { liveCatalogStretches } = get();
        let pool = liveCatalogStretches.length > 0 ? liveCatalogStretches : [...CLINICAL_STRETCHES];

        if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase
              .from('stretches')
              .select('*')
              .eq('active', true);

            if (!error && data && data.length > 0) {
              pool = data.map((item: any, idx: number) => ({
                id: item.id ?? idx,
                title: item.title,
                category: (item.category as any) || 'Height Growth',
                tag: item.tag || 'Clinical Traction',
                targetZone: item.target_zone || 'Lumbar & Thoracic',
                durationSeconds: item.duration_seconds || 60,
                intensity: item.intensity || 'Beginner',
                clinicalBenefit: item.clinical_benefit || 'Promotes spinal decompression and fluid rehydration.',
                instructions: Array.isArray(item.instructions) ? item.instructions : ['Align spine and breathe deeply.'],
                contraindications: item.contraindications || undefined,
                media_url: item.media_url || undefined,
                media_type: item.media_type || undefined,
              }));
            }
          } catch (e) {
            // Graceful fallback to CLINICAL_STRETCHES
          }
        }

        const s = get();
        if (s.isProgramCalibrated && s.biomechanicalProfile) {
          const multiPlan = buildCalibrated6WeekProgram(s.biomechanicalProfile, pool, currentDays);
          const weekPlan = multiPlan[s.selectedViewingWeek || 1]?.plan || {};
          const activeDay = Object.keys(weekPlan).includes(s.activePlanDay)
            ? s.activePlanDay
            : Object.keys(weekPlan)[0] || 'Monday';
          set({
            weeklyPlan: weekPlan,
            multiWeekPlan: multiPlan,
            workoutDaysPerWeek: currentDays,
            activePlanDay: activeDay,
          });
          return;
        }

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const { plan, activeDay } = buildWeeklyPlanSchedule(shuffled, currentDays);
        const multiPlan = buildMultiWeekProgramSchedule(pool, currentDays, 6);

        set({
          weeklyPlan: plan,
          multiWeekPlan: multiPlan,
          workoutDaysPerWeek: currentDays,
          activePlanDay: activeDay,
        });
      },

      fetchLiveContent: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const [stretchesRes, catRes, qRes, badgeRes, mealsRes] = await Promise.allSettled([
            supabase.from('stretches').select('*').eq('active', true).order('sort_order', { ascending: true }),
            supabase.from('workout_categories').select('*').order('sort_order', { ascending: true }),
            supabase.from('category_questions').select('*').eq('active', true),
            supabase.from('achievements').select('*').order('created_at', { ascending: true }),
            supabase.from('meals').select('*').is('user_id', null).eq('active', true).order('name', { ascending: true }),
          ]);

          // 1. Stretches / Exercises
          let mappedStretches: StretchExercise[] = [];
          if (stretchesRes.status === 'fulfilled' && stretchesRes.value.data && stretchesRes.value.data.length > 0) {
            mappedStretches = stretchesRes.value.data.map((d: any, idx: number) => ({
              id: Number(d.id) || idx + 1,
              title: d.title,
              category: (d.category as any) || 'Height Growth',
              tag: d.tag || 'Spine',
              targetZone: d.target_area || d.target_zone || 'Thoracic Spine',
              durationSeconds: Number(d.duration_seconds) || 60,
              intensity: d.intensity || 'Beginner',
              clinicalBenefit: Array.isArray(d.benefits)
                ? d.benefits[0]
                : (d.clinical_benefit || d.benefits || 'Promotes spinal decompression and fluid rehydration.'),
              instructions: Array.isArray(d.instructions)
                ? d.instructions
                : [d.instructions || 'Follow posture guide'],
              contraindications: d.contraindications || undefined,
              media_url: d.media_url,
              media_type: d.media_type || 'image',
            }));

            const currentDays = get().workoutDaysPerWeek || 4;
            const { plan, activeDay } = buildWeeklyPlanSchedule(mappedStretches, currentDays);
            const multiPlan = buildMultiWeekProgramSchedule(mappedStretches, currentDays, 6);
            set({
              weeklyPlan: plan,
              multiWeekPlan: multiPlan,
              activePlanDay: activeDay,
            });
          }

          // 2. Workout Categories
          let mappedCats: WorkoutCategory[] = [];
          if (catRes.status === 'fulfilled' && catRes.value.data && catRes.value.data.length > 0) {
            mappedCats = catRes.value.data.map((c: any, idx: number) => ({
              id: String(c.id),
              name: c.name || 'Category',
              slug: c.slug || `category-${idx + 1}`,
              icon: c.icon || '🌱',
              description: c.description || '',
              color: c.color || c.accent_color || '#0284C7',
              workoutIds: Array.isArray(c.workout_ids) ? c.workout_ids : [],
              active: c.active !== false,
              order: Number(c.sort_order ?? c.order) || idx + 1,
            }));
            set({ categories: mappedCats });
          }

          // 3. Category Questions
          if (qRes.status === 'fulfilled' && qRes.value.data && qRes.value.data.length > 0) {
            const mappedQuestions: CategoryQuestion[] = qRes.value.data.map((q: any, idx: number) => ({
              id: String(q.id),
              categoryId: String(q.category_id || q.categoryId),
              questionText: q.question_text || q.questionText || '',
              subtitle: q.subtitle || '',
              options: Array.isArray(q.options) ? q.options : [],
              active: q.active !== false,
              order: Number(q.sort_order ?? q.order) || idx + 1,
            }));
            set({ categoryQuestions: mappedQuestions });
          }

          // 4. Badges / Achievements
          let mappedBadges: AchievementBadgeItem[] = [];
          if (badgeRes.status === 'fulfilled' && Array.isArray(badgeRes.value.data)) {
            mappedBadges = badgeRes.value.data.map((b: any) => ({
              id: b.id,
              title: b.title,
              description: b.description,
              icon: b.icon || 'Sparkles',
              icon_url: b.icon_url || b.media_url,
              category: b.category || 'stretches',
              targetMetric: b.target_metric || 'stretches_completed',
              targetValue: Number(b.target_value) || 1,
              xpReward: Number(b.xp_reward) || 50,
              tier: b.tier || 'bronze',
            }));
            set({ badges: mappedBadges });
          }

          // 5. Preset Meals — map snake_case DB fields to the shape FoodLogModal expects
          if (mealsRes.status === 'fulfilled' && mealsRes.value.data && mealsRes.value.data.length > 0) {
            const mappedMeals = mealsRes.value.data.map((m: any) => ({
              id: String(m.id),
              name: m.name,
              serving_size: m.serving_size || '1 serving',
              category: m.category || 'High Protein',
              calories: Number(m.calories) || 0,
              protein: Number(m.protein) || 0,
              carbs: Number(m.carbs) || 0,
              fat: Number(m.fat) || 0,
              calcium: Number(m.calcium ?? 0),
              zinc: Number(m.zinc ?? 0),
              vitaminD3: Number(m.vitamin_d3 ?? 0),
              clinicalRationale: m.clinical_rationale || '',
              active: m.active !== false,
            }));
            set({ livePresetMeals: mappedMeals });
          }

          // 6. Populate live catalog — used by stretches tab instead of CLINICAL_STRETCHES.
          //    Falls back to CLINICAL_STRETCHES when Supabase returns nothing.
          get().setLiveCatalog(
            mappedStretches.length > 0 ? mappedStretches : CLINICAL_STRETCHES,
            badgeRes.status === 'fulfilled' && Array.isArray(badgeRes.value.data)
              ? mappedBadges
              : INITIAL_BADGES,
            mappedCats.length > 0 ? mappedCats : INITIAL_CATEGORIES,
          );
          // Rebuild the weekly plan from admin-managed live stretches
          await get().generateWeeklyPlan();
        } catch (err) {
          console.warn('[Supabase live content fetch warning]:', err);
          // On total failure, make sure the catalog is still populated with defaults
          const s = get();
          if (s.liveCatalogStretches.length === 0) {
            get().setLiveCatalog(CLINICAL_STRETCHES, INITIAL_BADGES, INITIAL_CATEGORIES);
          }
        }
      },

      resetAllData: () => {
        set({
          quizData: null,
          isPremium: false,
          streakDays: 0,
          completedStretches: [],
          meals: [],
          sleepLogs: [],
          user: null,
          unlockedBadgeIds: [],
          newlyUnlockedBadge: null,
          paymentOrderId: null,
          pendingRegistration: null,
          workoutDaysPerWeek: 4,
          weeklyPlan: initialSchedule.plan,
          activePlanDay: initialSchedule.activeDay,
          currentProgramWeek: 1,
          selectedViewingWeek: 1,
          completedWeeks: [],
          multiWeekPlan: initialMultiWeekPlan,
          isProgramCalibrated: false,
          programCalibrationDate: null,
          biomechanicalProfile: null,
          hasAcceptedHealthDisclaimer: false,
          aiQuestionsUsedToday: 0,
          lastAiQuestionDate: new Date().toISOString().split('T')[0],
          aiWindowStart: null,
          todos: INITIAL_DAILY_TODOS,
        });
      },

      deleteAccount: async () => {
        try {
          if (isSupabaseConfigured()) {
            await (supabase.rpc('delete_user_account') as any);
            await supabase.auth.signOut();
          }
        } catch (e) {
          // Graceful handling
        }
        await AsyncStorage.clear().catch(() => {});
        set({
          quizData: null,
          isPremium: false,
          streakDays: 0,
          completedStretches: [],
          meals: [],
          sleepLogs: [],
          user: null,
          unlockedBadgeIds: [],
          newlyUnlockedBadge: null,
          paymentOrderId: null,
          pendingRegistration: null,
          hasSeenAppTour: false,
          workoutDaysPerWeek: 4,
          weeklyPlan: initialSchedule.plan,
          activePlanDay: initialSchedule.activeDay,
          currentProgramWeek: 1,
          selectedViewingWeek: 1,
          completedWeeks: [],
          multiWeekPlan: initialMultiWeekPlan,
          isProgramCalibrated: false,
          programCalibrationDate: null,
          biomechanicalProfile: null,
          hasAcceptedHealthDisclaimer: false,
          aiQuestionsUsedToday: 0,
          lastAiQuestionDate: new Date().toISOString().split('T')[0],
          aiWindowStart: null,
          todos: INITIAL_DAILY_TODOS,
        });
      },

      downloadAllUserData: () => {
        const s = get();
        const exportPayload = {
          exportDate: new Date().toISOString(),
          appName: 'GoTall Biometric Growth & Posture Suite',
          schemaVersion: '1.2.0',
          account: s.user || { status: 'Guest User' },
          biometrics: s.quizData,
          calculatedProjection: s.quizData ? calculateTarget(s.quizData) : null,
          routineAndStreaks: {
            streakDays: s.streakDays,
            completedStretchesCount: s.completedStretches.length,
            completedStretchIds: s.completedStretches,
            workoutDaysPerWeek: s.workoutDaysPerWeek,
            weeklyPlan: s.weeklyPlan,
          },
          nutritionLogs: {
            loggedMealsCount: s.meals.length,
            meals: s.meals,
          },
          sleepLogs: {
            targetHours: s.sleepTargetHours,
            history: s.sleepLogs,
          },
          gamification: {
            unlockedBadgeIds: s.unlockedBadgeIds,
            totalBadgesCount: s.badges.length,
          },
          categories: s.categories,
        };
        return JSON.stringify(exportPayload, null, 2);
      },
    }),
    {
      name: 'gotall_user_store_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quizData: state.quizData,
        isPremium: state.isPremium,
        subscriptionTier: state.subscriptionTier,
        streakDays: state.streakDays,
        completedStretches: state.completedStretches,
        meals: state.meals,
        unlockedBadgeIds: state.unlockedBadgeIds,
        paymentOrderId: state.paymentOrderId,
        workoutDaysPerWeek: state.workoutDaysPerWeek,
        activePlanDay: state.activePlanDay,
        weeklyPlan: state.weeklyPlan,
        currentProgramWeek: state.currentProgramWeek,
        selectedViewingWeek: state.selectedViewingWeek,
        completedWeeks: state.completedWeeks,
        multiWeekPlan: state.multiWeekPlan,
        isProgramCalibrated: state.isProgramCalibrated,
        programCalibrationDate: state.programCalibrationDate,
        biomechanicalProfile: state.biomechanicalProfile,
        hasAcceptedHealthDisclaimer: state.hasAcceptedHealthDisclaimer,
        sleepLogs: state.sleepLogs,
        sleepTargetHours: state.sleepTargetHours,
        todos: state.todos,
        user: state.user,
        categories: state.categories,
        categoryQuestions: state.categoryQuestions,
        hasSeenAppTour: state.hasSeenAppTour,
        aiQuestionsUsedToday: state.aiQuestionsUsedToday,
        lastAiQuestionDate: state.lastAiQuestionDate,
        aiWindowStart: state.aiWindowStart,
        liveCatalogStretches: state.liveCatalogStretches,
        livePresetMeals: state.livePresetMeals,
        liveCatalogBadges: state.liveCatalogBadges,
        badges: state.badges,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

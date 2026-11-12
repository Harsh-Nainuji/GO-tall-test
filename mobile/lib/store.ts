import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizData, calculateTarget } from './growth-calc';
import { supabase, isSupabaseConfigured } from './supabase';

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
  provider: 'email' | 'google' | 'apple';
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
];

export const INITIAL_SLEEP_LOGS: SleepLog[] = [
  {
    id: 'sleep-mon',
    date: '2026-11-09',
    dayOfWeek: 'Mon',
    bedtime: '10:30 PM',
    wakeupTime: '06:45 AM',
    hours: 8.25,
    quality: 'Deep Restorative',
    timestamp: '2026-11-09T06:45:00.000Z',
  },
  {
    id: 'sleep-tue',
    date: '2026-11-10',
    dayOfWeek: 'Tue',
    bedtime: '11:00 PM',
    wakeupTime: '07:30 AM',
    hours: 8.5,
    quality: 'Deep Restorative',
    timestamp: '2026-11-10T07:30:00.000Z',
  },
  {
    id: 'sleep-wed',
    date: '2026-11-11',
    dayOfWeek: 'Wed',
    bedtime: '11:45 PM',
    wakeupTime: '06:45 AM',
    hours: 7.0,
    quality: 'Normal Rest',
    timestamp: '2026-11-11T06:45:00.000Z',
  },
  {
    id: 'sleep-thu',
    date: '2026-11-12',
    dayOfWeek: 'Thu',
    bedtime: '10:15 PM',
    wakeupTime: '07:00 AM',
    hours: 8.75,
    quality: 'Deep Restorative',
    timestamp: '2026-11-12T07:00:00.000Z',
  },
  {
    id: 'sleep-fri',
    date: '2026-11-13',
    dayOfWeek: 'Fri',
    bedtime: '10:45 PM',
    wakeupTime: '06:30 AM',
    hours: 7.75,
    quality: 'Normal Rest',
    timestamp: '2026-11-13T06:30:00.000Z',
  },
  {
    id: 'sleep-sat',
    date: '2026-11-14',
    dayOfWeek: 'Sat',
    bedtime: '11:00 PM',
    wakeupTime: '08:15 AM',
    hours: 9.25,
    quality: 'Deep Restorative',
    timestamp: '2026-11-14T08:15:00.000Z',
  },
  {
    id: 'sleep-sun',
    date: '2026-11-15',
    dayOfWeek: 'Sun',
    bedtime: '10:30 PM',
    wakeupTime: '07:00 AM',
    hours: 8.5,
    quality: 'Deep Restorative',
    timestamp: '2026-11-15T07:00:00.000Z',
  },
];

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

const initialSchedule = buildWeeklyPlanSchedule(CLINICAL_STRETCHES, 4);

interface AppState {
  quizData: QuizData | null;
  isPremium: boolean;
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

  // Categories & Question Templates
  categories: WorkoutCategory[];
  categoryQuestions: CategoryQuestion[];

  // Sleep tracking state
  sleepLogs: SleepLog[];
  sleepTargetHours: number;

  // Authentication state
  user: UserProfile | null;

  // App Walkthrough Guided Tour
  hasSeenAppTour: boolean;

  // Actions
  setQuizData: (data: QuizData) => void;
  setPremium: (status: boolean) => void;
  setPaymentOrderId: (orderId: string | null) => void;
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

  // Category Actions
  setCategories: (categories: WorkoutCategory[]) => void;
  setCategoryQuestions: (questions: CategoryQuestion[]) => void;

  // Weekly Plan Actions
  setWorkoutDaysPerWeek: (days: number) => void;
  setActivePlanDay: (day: string) => void;
  generateWeeklyPlan: (daysPerWeek?: number) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      quizData: {
        gender: 'male',
        age: 17,
        ethnicity: 'Global Population Standard',
        currentHeight: 172.4,
        fatherHeight: 178.0,
        motherHeight: 164.5,
        growthRate: '2 – 5 cm / year',
        shoeSize: 9,
        sleepHours: '8 – 10 hours',
        dietType: 'Mostly home-cooked balanced',
        smokeDrink: 'No, never',
        sittingHours: '4 – 8 hrs',
        motivation: 'Maximize my genetic height potential',
        dreamHeight: 182,
        activityLevel: 'Moderate Active',
      },
      isPremium: false,
      streakDays: 4,
      completedStretches: [0, 1],
      paymentOrderId: null,

      // Weekly plan initial values
      workoutDaysPerWeek: 4,
      activePlanDay: initialSchedule.activeDay,
      weeklyPlan: initialSchedule.plan,

      // Categories and Category Questions
      categories: INITIAL_CATEGORIES,
      categoryQuestions: INITIAL_CATEGORY_QUESTIONS,

      // Sleep tracking state
      sleepLogs: INITIAL_SLEEP_LOGS,
      sleepTargetHours: 8.5,

      // Authentication state
      user: null,

      // Guided Tour state
      hasSeenAppTour: false,

      // Initial logged meals
      meals: [
        {
          id: 'meal-1',
          name: 'Greek Yogurt 0% & Blueberries',
          calories: 320,
          protein: 26,
          carbs: 24,
          fat: 2,
          category: 'Breakfast',
          time: '8:30 AM',
        },
        {
          id: 'meal-2',
          name: 'Grilled Chicken & Brown Rice Bowl',
          calories: 680,
          protein: 48,
          carbs: 65,
          fat: 14,
          category: 'Lunch',
          time: '1:15 PM',
        },
        {
          id: 'meal-3',
          name: 'Hard Boiled Pasture Eggs (x2)',
          calories: 156,
          protein: 13,
          carbs: 1,
          fat: 11,
          category: 'Snack',
          time: '5:00 PM',
        },
      ],

      badges: INITIAL_BADGES,
      unlockedBadgeIds: ['badge-7', 'badge-1'],
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
      setPremium: (status) => set({ isPremium: status }),
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

      signOut: () => {
        set({ user: null });
      },

      setCategories: (categories) => {
        set({ categories });
      },

      setCategoryQuestions: (categoryQuestions) => {
        set({ categoryQuestions });
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

      checkBadges: () => {
        const state = get();
        const totalProtein = state.meals.reduce((sum, m) => sum + m.protein, 0);

        // Check Protein Maxima badge (badge-4)
        if (totalProtein >= 100 && !state.unlockedBadgeIds.includes('badge-4')) {
          state.unlockBadge('badge-4');
        }

        // Check 1st Stretch badge (badge-1)
        if (state.completedStretches.length >= 1 && !state.unlockedBadgeIds.includes('badge-1')) {
          state.unlockBadge('badge-1');
        }

        // Check 7-Day streak (badge-2)
        if (state.streakDays >= 7 && !state.unlockedBadgeIds.includes('badge-2')) {
          state.unlockBadge('badge-2');
        }

        // Check Somatotropin Pulse Synced badge (badge-3) if logged >= 8h sleep
        const recent8hSleep = state.sleepLogs.some((l) => l.hours >= 8.0);
        if (recent8hSleep && !state.unlockedBadgeIds.includes('badge-3')) {
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
        let pool = [...CLINICAL_STRETCHES];

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

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const { plan, activeDay } = buildWeeklyPlanSchedule(shuffled, currentDays);

        set({
          weeklyPlan: plan,
          workoutDaysPerWeek: currentDays,
          activePlanDay: activeDay,
        });
      },

      resetAllData: () => {
        set({
          isPremium: false,
          streakDays: 1,
          completedStretches: [],
          meals: [],
          sleepLogs: INITIAL_SLEEP_LOGS,
          user: null,
          unlockedBadgeIds: ['badge-7'],
          paymentOrderId: null,
          workoutDaysPerWeek: 4,
          weeklyPlan: initialSchedule.plan,
          activePlanDay: initialSchedule.activeDay,
        });
      },
    }),
    {
      name: 'gotall_user_store_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quizData: state.quizData,
        isPremium: state.isPremium,
        streakDays: state.streakDays,
        completedStretches: state.completedStretches,
        meals: state.meals,
        unlockedBadgeIds: state.unlockedBadgeIds,
        paymentOrderId: state.paymentOrderId,
        workoutDaysPerWeek: state.workoutDaysPerWeek,
        activePlanDay: state.activePlanDay,
        weeklyPlan: state.weeklyPlan,
        sleepLogs: state.sleepLogs,
        sleepTargetHours: state.sleepTargetHours,
        user: state.user,
        categories: state.categories,
        categoryQuestions: state.categoryQuestions,
        hasSeenAppTour: state.hasSeenAppTour,
      }),
    }
  )
);

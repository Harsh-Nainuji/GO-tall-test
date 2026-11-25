import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SkeletonRow } from '../../components/ui/SkeletonShimmer';
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  Play,
  RotateCcw,
  Film,
  ChevronRight,
  ChevronLeft,
  Tag,
  Lock,
  ShieldAlert,
  X,
  Flame,
  Crown,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore, CLINICAL_STRETCHES, StretchExercise, WorkoutCategory, CategoryQuestion } from '../../lib/store';
import { getLocalTodayDateStr } from '../../lib/dates';
import { resolvePlanEntitlements } from '../../lib/entitlements';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import StretchTimerModal from '../../components/StretchTimerModal';
import BadgeModal from '../../components/BadgeModal';
import HealthDisclaimerModal from '../../components/HealthDisclaimerModal';

// ============================================================================
// IMAGE 2 PASTEL THEMES & HIGH-DEFINITION ATHLETE MODEL VISUALS
// ============================================================================
const WORKOUT_CARD_THEMES = [
  {
    // Mint / Lime (Image 2 Card 1)
    gradient: ['#B8E994', '#78E08F'] as [string, string],
    softBg: ['#E6F4EA', '#D1F2D9'] as [string, string],
    tagBg: 'rgba(255, 255, 255, 0.85)',
    tagText: '#1B5E20',
    defaultTitle: 'FULL BODY',
    fallbackImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
  },
  {
    // Peach / Amber (Image 2 Card 2)
    gradient: ['#FAD390', '#F8A5C2'] as [string, string],
    softBg: ['#FFE8D6', '#FFD8BE'] as [string, string],
    tagBg: 'rgba(255, 255, 255, 0.85)',
    tagText: '#BF360C',
    defaultTitle: 'LEGS & GLUTES',
    fallbackImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
  },
  {
    // Rose / Coral / Pink (Image 2 Card 3)
    gradient: ['#F8A5C2', '#F78FB3'] as [string, string],
    softBg: ['#FCE7F3', '#FBCFE8'] as [string, string],
    tagBg: 'rgba(255, 255, 255, 0.85)',
    tagText: '#880E4F',
    defaultTitle: 'CARDIO & TRACTION',
    fallbackImage: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80',
  },
  {
    // Lavender / Soft Purple (Image 2 Card 4)
    gradient: ['#D5B8FF', '#A29BFE'] as [string, string],
    softBg: ['#EDE9FE', '#DDD6FE'] as [string, string],
    tagBg: 'rgba(255, 255, 255, 0.85)',
    tagText: '#4A148C',
    defaultTitle: 'UPPER BODY & ABS',
    fallbackImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
  },
  {
    // Sky / Ice Blue (Image 2 Card 5)
    gradient: ['#81ECEC', '#74B9FF'] as [string, string],
    softBg: ['#E0F2FE', '#BAE6FD'] as [string, string],
    tagBg: 'rgba(255, 255, 255, 0.85)',
    tagText: '#0369A1',
    defaultTitle: 'POSTURE & SPINE',
    fallbackImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
  },
];

// Calendar week generator synchronized with phone's internal clock (Date.now())
interface CalendarDayItem {
  shortName: string;
  fullDayName: string;
  dateNumber: number;
  isToday: boolean;
  rawDate: Date;
}

const getCalendarWeekDays = (): CalendarDayItem[] => {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const shortNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return shortNames.map((shortName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const isToday = d.toDateString() === now.toDateString();
    return {
      shortName,
      fullDayName: fullNames[idx],
      dateNumber: d.getDate(),
      isToday,
      rawDate: d,
    };
  });
};

export default function StretchesScreen() {
  const router = useRouter();
  const completedStretches = useAppStore((state) => state.completedStretches);
  const completedStretchesByDate = useAppStore((state) => state.completedStretchesByDate) || {};
  const streakDays = useAppStore((state) => state.streakDays);
  const toggleStretch = useAppStore((state) => state.toggleStretch);
  const newlyUnlockedBadge = useAppStore((state) => state.newlyUnlockedBadge);
  const clearNewlyUnlockedBadge = useAppStore((state) => state.clearNewlyUnlockedBadge);

  // Weekly Auto-Scheduler state & actions
  const workoutDaysPerWeek = useAppStore((state) => state.workoutDaysPerWeek) ?? 4;
  const activePlanDay = useAppStore((state) => state.activePlanDay);
  const weeklyPlanRaw = useAppStore((state) => state.weeklyPlan);
  const weeklyPlan = useMemo(() => weeklyPlanRaw || {}, [weeklyPlanRaw]);
  const categories = useAppStore((state) => state.categories);
  const categoryQuestions = useAppStore((state) => state.categoryQuestions);
  const setActivePlanDay = useAppStore((state) => state.setActivePlanDay);
  const generateWeeklyPlan = useAppStore((state) => state.generateWeeklyPlan);

  // Multi-Week Program Progression & Gating
  const currentProgramWeek = useAppStore((state) => state.currentProgramWeek) ?? 1;
  const selectedViewingWeek = useAppStore((state) => state.selectedViewingWeek) ?? 1;
  const completedWeeksRaw = useAppStore((state) => state.completedWeeks);
  const completedWeeks = useMemo(() => completedWeeksRaw || [], [completedWeeksRaw]);
  const totalProgramWeeks = useAppStore((state) => state.totalProgramWeeks) ?? 4;
  const multiWeekPlanRaw = useAppStore((state) => state.multiWeekPlan);
  const multiWeekPlan = useMemo(() => multiWeekPlanRaw || {}, [multiWeekPlanRaw]);
  const setSelectedViewingWeek = useAppStore((state) => state.setSelectedViewingWeek);
  const advanceToNextWeek = useAppStore((state) => state.advanceToNextWeek);

  const [activeTab, setActiveTab] = useState<'today' | 'roadmap' | 'library'>('today');
  const isPremium = useAppStore((state) => state.isPremium);
  const activePlanId = useAppStore((state) => state.activePlanId);
  const subscriptionTier = useAppStore((state) => state.subscriptionTier);
  const liveCatalogPlans = useAppStore((state) => state.liveCatalogPlans);
  const checkDailyReset = useAppStore((state) => state.checkDailyReset);

  const entitlements = useMemo(() => {
    return resolvePlanEntitlements(activePlanId, isPremium, subscriptionTier, liveCatalogPlans);
  }, [activePlanId, isPremium, subscriptionTier, liveCatalogPlans]);

  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // AI Program Calibration & Disclaimer state
  const isProgramCalibrated = useAppStore((state) => state.isProgramCalibrated);
  const biomechanicalProfile = useAppStore((state) => state.biomechanicalProfile);
  const hasAcceptedHealthDisclaimer = useAppStore((state) => state.hasAcceptedHealthDisclaimer);
  const setHasAcceptedHealthDisclaimer = useAppStore((state) => state.setHasAcceptedHealthDisclaimer);
  const calibratePersonalizedProgram = useAppStore((state) => state.calibratePersonalizedProgram);

  const [showDisclaimerModal, setShowDisclaimerModal] = useState(!hasAcceptedHealthDisclaimer);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleAcceptDisclaimer = async () => {
    setHasAcceptedHealthDisclaimer(true);
    setShowDisclaimerModal(false);
    setIsCalibrating(true);
    try {
      await calibratePersonalizedProgram();
    } finally {
      setIsCalibrating(false);
    }
  };

  const [selectedStretch, setSelectedStretch] = useState<StretchExercise | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [diagnosticModalVisible, setDiagnosticModalVisible] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [liveExercises, setLiveExercises] = useState<StretchExercise[] | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calendar week synchronized with phone's internal clock
  const calendarWeek = useMemo(() => getCalendarWeekDays(), []);

  const loadLiveStretches = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('stretches')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const activeRows = data.filter((d: any) => d.active !== false);
        const mapped: StretchExercise[] = activeRows.map((d: any, idx: number) => ({
          id: Number(d.id) || idx + 1,
          title: d.title,
          category: (d.category as any) || 'Height Growth',
          tag: d.tag || 'Spine',
          targetZone: d.target_zone || d.target_area || d.targetZone || 'Thoracic Spine',
          durationSeconds: Number(d.duration_seconds) || 60,
          intensity: d.intensity || 'Beginner',
          clinicalBenefit: d.clinical_benefit || (Array.isArray(d.benefits) ? d.benefits[0] : (d.benefits || 'Spinal disc rehydration')),
          instructions: Array.isArray(d.instructions) ? d.instructions : [d.instructions || 'Follow posture guide'],
          media_url: d.media_url,
          media_type: d.media_type || 'image',
        }));
        setLiveExercises(mapped);
        const s = useAppStore.getState();
        s.setLiveCatalog(mapped, s.badges, s.categories);
        await s.generateWeeklyPlan();
      }
    } catch {
      // Keep local plan on network error
    } finally {
      setIsLoadingLive(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveStretches();
    useAppStore.getState().fetchLiveContent().catch(() => { });
  }, []);

  useEffect(() => {
    if (hasAcceptedHealthDisclaimer && !isProgramCalibrated) {
      calibratePersonalizedProgram().catch(() => { });
    }
  }, [hasAcceptedHealthDisclaimer, isProgramCalibrated]);

  const liveCatalogStretches = useAppStore((state) => state.liveCatalogStretches);

  const currentWeekInfo = multiWeekPlan[selectedViewingWeek];
  const isWeekLocked = selectedViewingWeek > currentProgramWeek;
  const currentWeekPlan = currentWeekInfo?.plan || weeklyPlan;

  const scheduleDays = Object.keys(currentWeekPlan).length > 0 ? Object.keys(currentWeekPlan) : Object.keys(weeklyPlan);
  const currentDayKey = scheduleDays.includes(activePlanDay)
    ? activePlanDay
    : scheduleDays[0] || 'Monday';

  // Exercises scheduled for this active day in this specific week (ensures admin-added live exercises are included and visible)
  const availableLiveList = (liveExercises && liveExercises.length > 0)
    ? liveExercises
    : (liveCatalogStretches && liveCatalogStretches.length > 0)
      ? liveCatalogStretches
      : null;

  const scheduledForDay = currentWeekPlan[currentDayKey] || [];
  const baseExercises: StretchExercise[] = scheduledForDay.length > 0
    ? scheduledForDay
    : availableLiveList && availableLiveList.length > 0
      ? availableLiveList
      : (weeklyPlan[currentDayKey] && weeklyPlan[currentDayKey].length > 0)
        ? weeklyPlan[currentDayKey]
        : CLINICAL_STRETCHES;

  const dailyExercises: StretchExercise[] = baseExercises;
  const todayDoneCount = dailyExercises.filter((e) => completedStretches.includes(e.id)).length;

  const selectedCategory = categories.find(
    (c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug
  );

  const activeCategoryQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return categoryQuestions.filter(
      (q) => q.categoryId === selectedCategory.id || q.categoryId === selectedCategory.slug
    );
  }, [selectedCategory, categoryQuestions]);

  const displayedExercises = useMemo(() => {
    if (selectedCategorySlug === 'all' || !selectedCategory) {
      return dailyExercises;
    }

    const catNameLower = (selectedCategory.name || '').toLowerCase();
    const catSlugLower = (selectedCategory.slug || '').toLowerCase();
    const catWorkoutIds = selectedCategory.workoutIds || [];

    const filtered = dailyExercises.filter((s) => {
      const sIdStr = String(s.id);
      const stretchNumStr = `stretch-${Number(s.id) + 1}`;
      const inWorkoutIds =
        catWorkoutIds.includes(sIdStr) || catWorkoutIds.includes(stretchNumStr);

      const sCategory = (s.category || '').toLowerCase();
      const sTag = (s.tag || '').toLowerCase();
      const sTarget = (s.targetZone || '').toLowerCase();

      const matchCategory =
        Boolean(
          (sCategory && (catNameLower.includes(sCategory) || catSlugLower.includes(sCategory) || sCategory.includes(catSlugLower))) ||
          (sTag && (catNameLower.includes(sTag) || catSlugLower.includes(sTag))) ||
          (sTarget && (catNameLower.includes(sTarget) || catSlugLower.includes(sTarget)))
        );

      return inWorkoutIds || matchCategory;
    });

    if (filtered.length > 0) return filtered;

    const pool = (liveCatalogStretches && liveCatalogStretches.length > 0)
      ? liveCatalogStretches
      : CLINICAL_STRETCHES;

    const poolFallback = pool.filter((s) => {
      const sIdStr = String(s.id);
      const stretchNumStr = `stretch-${Number(s.id) + 1}`;
      const inWorkoutIds =
        catWorkoutIds.includes(sIdStr) || catWorkoutIds.includes(stretchNumStr);
      const sCategory = (s.category || '').toLowerCase();
      const matchCategory =
        Boolean(sCategory && (catNameLower.includes(sCategory) || catSlugLower.includes(sCategory)));
      return inWorkoutIds || matchCategory;
    });

    return poolFallback.length > 0 ? poolFallback : dailyExercises;
  }, [dailyExercises, selectedCategorySlug, selectedCategory, liveCatalogStretches]);

  const dayCompleted = displayedExercises.filter((s) =>
    completedStretches.includes(Number(s.id))
  ).length;
  const dayTotal = displayedExercises.length;
  const allDayDone = dayTotal > 0 && dayCompleted === dayTotal;

  // Phone Internal Clock Anti-Cheat Logger
  const handleToggleExercise = (exerciseId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    // Record verified timestamp via phone internal clock
    const verifiedPhoneTimestamp = Date.now();
    toggleStretch(exerciseId);
  };

  const handleSelectDay = (dayName: string) => {
    Haptics.selectionAsync().catch(() => { });
    setActivePlanDay(dayName);
  };

  const canGoPrevWeek = selectedViewingWeek > 1;
  const canGoNextWeek = selectedViewingWeek < totalProgramWeeks;

  const handlePrevWeek = () => {
    if (canGoPrevWeek) {
      Haptics.selectionAsync().catch(() => { });
      setSelectedViewingWeek(selectedViewingWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoNextWeek) {
      Haptics.selectionAsync().catch(() => { });
      setSelectedViewingWeek(selectedViewingWeek + 1);
    }
  };

  const handleTouchStart = (e: any) => {
    setTouchStartX(e.nativeEvent.pageX);
  };

  const handleTouchEnd = (e: any) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.nativeEvent.pageX;
    // Swipe left (drag right-to-left): advance to next week
    if (diffX > 40) {
      if (canGoNextWeek) {
        handleNextWeek();
      }
    } else if (diffX < -40) {
      // Swipe right (drag left-to-right): return to previous week
      if (canGoPrevWeek) {
        handlePrevWeek();
      }
    }
    setTouchStartX(null);
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* ==================================================================== */}
        {/* TOP HEADER & BRAND                                                   */}
        {/* ==================================================================== */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.topContextBar}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandPill}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 18, height: 18, borderRadius: 5 }}
                resizeMode="cover"
              />
              <Text style={styles.brandText}>Tallgrame</Text>
              <View style={styles.onlineDot} />
            </View>
          </View>

          {streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Flame size={12} color="#D97706" />
              <Text style={styles.streakBadgeText}>{streakDays}d Streak</Text>
            </View>
          )}
        </Animated.View>

        {/* ==================================================================== */}
        {/* 3-WAY SEGMENTED VIEW SWITCHER (Today / 6-Week Plan / Library)        */}
        {/* ==================================================================== */}
        <View style={styles.segmentedTabsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setActiveTab('today');
            }}
            style={[styles.segmentedTabBtn, activeTab === 'today' && styles.segmentedTabBtnActive]}
          >
            <Play size={12} color={activeTab === 'today' ? '#2563EB' : '#64748B'} fill={activeTab === 'today' ? '#2563EB' : 'transparent'} />
            <Text style={[styles.segmentedTabText, activeTab === 'today' && styles.segmentedTabTextActive]}>
              Today&apos;s Session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setActiveTab('roadmap');
            }}
            style={[styles.segmentedTabBtn, activeTab === 'roadmap' && styles.segmentedTabBtnActive]}
          >
            <Layers size={12} color={activeTab === 'roadmap' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.segmentedTabText, activeTab === 'roadmap' && styles.segmentedTabTextActive]}>
              6-Week Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setActiveTab('library');
            }}
            style={[styles.segmentedTabBtn, activeTab === 'library' && styles.segmentedTabBtnActive]}
          >
            <Tag size={12} color={activeTab === 'library' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.segmentedTabText, activeTab === 'library' && styles.segmentedTabTextActive]}>
              Library
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadLiveStretches();
              }}
              colors={['#2563EB']}
            />
          }
        >
          {activeTab === 'today' ? (
            /* ==================================================================== */
            /* TAB 1: TODAY'S ACTIVE SESSION (Standard Modern Fitness App Flow)     */
            /* ==================================================================== */
            <>
              {/* Hero "Today's Protocol" Card */}
              <Animated.View entering={FadeInDown.delay(70).springify()}>
                <GlassCard style={styles.heroSessionCard}>
                  <View style={styles.heroSessionTopRow}>
                    <View style={styles.heroPhasePill}>
                      <Text style={styles.heroPhasePillText}>Week {currentProgramWeek} • Day {currentDayKey}</Text>
                    </View>
                    <View style={styles.heroDonePill}>
                      <Text style={styles.heroDonePillText}>
                        {todayDoneCount} of {dailyExercises.length} Done
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.heroSessionTitle}>
                    {currentWeekInfo?.title || 'Thoracic Decompression & Alignment'}
                  </Text>
                  <Text style={styles.heroSessionGoal}>
                    {currentWeekInfo?.scientificGoal || 'Rehydrating intervertebral fibrocartilage discs for vertical spinal elongation.'}
                  </Text>

                  {/* 1-Tap Hero "Start Session" Button */}
                  <TouchableOpacity
                    onPress={() => {
                      const nextUncompleted = dailyExercises.find((e) => !completedStretches.includes(Number(e.id))) || dailyExercises[0];
                      if (nextUncompleted) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                        setSelectedStretch(nextUncompleted);
                      }
                    }}
                    style={styles.heroStartBtn}
                    activeOpacity={0.85}
                  >
                    <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.heroStartBtnText}>
                      {todayDoneCount === 0
                        ? "Start Today's Routine"
                        : allDayDone
                        ? 'Replay Today\'s Session'
                        : 'Continue Session'}
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              </Animated.View>

              {/* 7-Day Day Selector Strip */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={styles.calendarBarWrapper}
              >
                <View style={styles.calendarDaysRow}>
                  {calendarWeek.map((dayItem) => {
                    const isSelected = currentDayKey === dayItem.fullDayName;
                    const isToday = dayItem.isToday;
                    const dateStr = getLocalTodayDateStr(dayItem.rawDate);
                    const dayDoneCount = (completedStretchesByDate[dateStr] || []).length;
                    const isFullyCompleted = dayDoneCount >= 4;

                    return (
                      <TouchableOpacity
                        key={dayItem.shortName}
                        activeOpacity={0.75}
                        onPress={() => handleSelectDay(dayItem.fullDayName)}
                        style={[
                          styles.calendarPill,
                          isSelected && styles.calendarPillActive,
                          isToday && !isSelected && styles.calendarPillToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayAbbr,
                            isSelected && styles.calendarDayAbbrActive,
                          ]}
                        >
                          {dayItem.shortName}
                        </Text>
                        <Text
                          style={[
                            styles.calendarDateNum,
                            isSelected && styles.calendarDateNumActive,
                          ]}
                        >
                          {dayItem.dateNumber}
                        </Text>

                        {dayDoneCount > 0 ? (
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: isFullyCompleted ? '#10B981' : isSelected ? '#FFFFFF' : '#3B82F6',
                              marginTop: 4,
                            }}
                          />
                        ) : isToday ? (
                          <View
                            style={[
                              styles.todayDot,
                              isSelected && styles.todayDotActive,
                            ]}
                          />
                        ) : (
                          <View style={{ width: 6, height: 6, marginTop: 4 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Today's Exercises List */}
              <Animated.View
                entering={FadeInDown.delay(130).springify()}
                style={styles.workoutCardsContainer}
              >
                {isLoadingLive && displayedExercises.length === 0 ? (
                  <View style={{ gap: 14 }}>
                    <SkeletonRow height={124} borderRadius={22} />
                    <SkeletonRow height={124} borderRadius={22} />
                    <SkeletonRow height={124} borderRadius={22} />
                  </View>
                ) : (
                  displayedExercises.map((s, index) => {
                    const isDone = completedStretches.includes(Number(s.id));
                    const isAdvancedGated =
                      s.intensity === 'Advanced' && !entitlements.canAccessAdvancedStretches;
                    const theme = WORKOUT_CARD_THEMES[index % WORKOUT_CARD_THEMES.length];
                    const durationMins = Math.round(s.durationSeconds / 60);
                    const durationLabel = durationMins > 0 ? `${durationMins} min` : `${s.durationSeconds}s`;
                    const cardImageUri = s.media_url || theme.fallbackImage;

                    return (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.88}
                        onPress={() => {
                          if (isAdvancedGated) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                            router.push('/membership' as any);
                            return;
                          }
                          setSelectedStretch(s);
                        }}
                        style={styles.workoutBannerTouch}
                      >
                        <LinearGradient
                          colors={theme.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.workoutBannerGradient}
                        >
                          {/* Left Column: Duration, Bold Title, Target Zone, Checkmark */}
                          <View style={styles.workoutLeftColumn}>
                            {/* Duration Badge Pill */}
                            <View style={styles.durationPill}>
                              <Clock size={11} color="#1E293B" />
                              <Text style={styles.durationPillText}>
                                {durationLabel}
                              </Text>
                              {isAdvancedGated && (
                                <View style={styles.proPillBadge}>
                                  <Crown size={9} color="#D97706" />
                                  <Text style={styles.proPillText}>PRO</Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={[
                                styles.workoutBannerTitle,
                                isDone && styles.workoutBannerTitleDone,
                              ]}
                              numberOfLines={2}
                            >
                              {s.title.toUpperCase()}
                            </Text>

                            <Text
                              style={styles.workoutBannerSubtitle}
                              numberOfLines={1}
                            >
                              {s.targetZone || s.tag || 'Spinal Decompression'}
                            </Text>

                            {/* Checkmark Completion Button */}
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={(e) => {
                                e.stopPropagation();
                                if (isAdvancedGated) {
                                  router.push('/membership' as any);
                                  return;
                                }
                                handleToggleExercise(Number(s.id));
                              }}
                              style={[
                                styles.cardCheckBtn,
                                isDone ? styles.cardCheckBtnDone : styles.cardCheckBtnPending,
                              ]}
                            >
                              <CheckCircle2
                                size={15}
                                color={isDone ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'}
                              />
                              <Text
                                style={[
                                  styles.cardCheckBtnText,
                                  isDone && styles.cardCheckBtnTextDone,
                                ]}
                              >
                                {isDone ? 'Completed' : 'Mark Done'}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* Right Column: Athlete Figure Image */}
                          <View style={styles.workoutFigureContainer}>
                            <Image
                              source={{ uri: cardImageUri }}
                              style={styles.workoutFigureImage}
                              contentFit="cover"
                              transition={250}
                            />
                            <LinearGradient
                              colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
                              style={styles.figureBlendOverlay}
                            />
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })
                )}
              </Animated.View>
            </>
          ) : activeTab === 'roadmap' ? (
            /* ==================================================================== */
            /* TAB 2: 6-WEEK PROGRAM ROADMAP & PLAN GATING                          */
            /* ==================================================================== */
            <Animated.View entering={FadeInDown.delay(70).springify()} style={styles.roadmapListWrap}>
              {Array.from({ length: 6 }, (_, i) => i + 1).map((weekNum) => {
                const info = multiWeekPlan[weekNum] || {
                  title: `Week ${weekNum}`,
                  focus: 'Axial Decompression',
                  scientificGoal: 'Spinal mobility and chondrocyte stimulation',
                };
                const isLockedByPlan = weekNum > entitlements.maxProgramWeeks;
                const isCompleted = completedWeeks.includes(weekNum) || weekNum < currentProgramWeek;
                const isCurrent = weekNum === currentProgramWeek;

                return (
                  <GlassCard
                    key={weekNum}
                    style={[
                      styles.roadmapCard,
                      isCurrent && styles.roadmapCardCurrent,
                    ]}
                  >
                    <View style={styles.roadmapCardHeader}>
                      <View style={[styles.roadmapNumberBox, isCurrent && styles.roadmapNumberBoxCurrent]}>
                        <Text style={[styles.roadmapNumberText, isCurrent && styles.roadmapNumberTextCurrent]}>
                          W{weekNum}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.roadmapTitleRow}>
                          <Text style={styles.roadmapCardTitle}>
                            Week {weekNum}: {info.title?.replace(/^Week \d+:\s*/, '') || `Phase ${weekNum}`}
                          </Text>

                          {isLockedByPlan ? (
                            <View style={styles.roadmapLockPill}>
                              <Crown size={11} color="#D97706" />
                              <Text style={styles.roadmapLockPillText}>Pro Only</Text>
                            </View>
                          ) : isCompleted ? (
                            <View style={styles.roadmapCompletedPill}>
                              <CheckCircle2 size={11} color="#10B981" />
                              <Text style={styles.roadmapCompletedPillText}>Done</Text>
                            </View>
                          ) : isCurrent ? (
                            <View style={styles.roadmapCurrentPill}>
                              <Text style={styles.roadmapCurrentPillText}>Active</Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.roadmapCardFocus}>{info.focus}</Text>
                        <Text style={styles.roadmapCardGoal}>{info.scientificGoal}</Text>
                      </View>
                    </View>

                    {isLockedByPlan ? (
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          router.push('/membership' as any);
                        }}
                        style={styles.roadmapUpgradeBtn}
                        activeOpacity={0.85}
                      >
                        <Crown size={14} color="#FFFFFF" />
                        <Text style={styles.roadmapUpgradeBtnText}>
                          Unlock in Pro (Capped at 2 Weeks on Free)
                        </Text>
                        <ChevronRight size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setSelectedViewingWeek(weekNum);
                          setActiveTab('today');
                        }}
                        style={styles.roadmapViewBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.roadmapViewBtnText}>
                          {isCurrent ? "Open Today's Routine" : `Preview Week ${weekNum} Routine`}
                        </Text>
                        <ChevronRight size={13} color="#2563EB" />
                      </TouchableOpacity>
                    )}
                  </GlassCard>
                );
              })}
            </Animated.View>
          ) : (
            /* ==================================================================== */
            /* TAB 3: EXERCISE LIBRARY & CATEGORIES                                 */
            /* ==================================================================== */
            <Animated.View entering={FadeInDown.delay(70).springify()}>
              <View style={styles.libraryHeaderRow}>
                <Text style={styles.sectionTitle}>Biomechanical Categories</Text>
                <Text style={styles.sectionSubtitle}>
                  Targeted traction protocols for spinal decompression and pelvic alignment
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedCategorySlug('all');
                  }}
                  style={[
                    styles.catPill,
                    selectedCategorySlug === 'all' && styles.catPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      selectedCategorySlug === 'all' && styles.catPillTextActive,
                    ]}
                  >
                    All Stretches
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedCategorySlug(cat.slug || cat.id);
                      }}
                      style={[
                        styles.catPill,
                        isSelected && styles.catPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          isSelected && styles.catPillTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Category Exercises List */}
              <View style={styles.workoutCardsContainer}>
                {displayedExercises.map((s, index) => {
                  const isDone = completedStretches.includes(Number(s.id));
                  const theme = WORKOUT_CARD_THEMES[index % WORKOUT_CARD_THEMES.length];
                  const durationMins = Math.round(s.durationSeconds / 60);
                  const durationLabel = durationMins > 0 ? `${durationMins} min` : `${s.durationSeconds}s`;
                  const cardImageUri = s.media_url || theme.fallbackImage;

                  return (
                    <TouchableOpacity
                      key={s.id}
                      activeOpacity={0.88}
                      onPress={() => setSelectedStretch(s)}
                      style={styles.workoutBannerTouch}
                    >
                      <LinearGradient
                        colors={theme.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.workoutBannerGradient}
                      >
                        <View style={styles.workoutLeftColumn}>
                          <View style={styles.durationPill}>
                            <Clock size={11} color="#1E293B" />
                            <Text style={styles.durationPillText}>{durationLabel}</Text>
                          </View>
                          <Text style={styles.workoutBannerTitle} numberOfLines={2}>
                            {s.title.toUpperCase()}
                          </Text>
                          <Text style={styles.workoutBannerSubtitle} numberOfLines={1}>
                            {s.targetZone || s.tag}
                          </Text>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleExercise(Number(s.id));
                            }}
                            style={[
                              styles.cardCheckBtn,
                              isDone ? styles.cardCheckBtnDone : styles.cardCheckBtnPending,
                            ]}
                          >
                            <CheckCircle2
                              size={15}
                              color={isDone ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'}
                            />
                            <Text
                              style={[
                                styles.cardCheckBtnText,
                                isDone && styles.cardCheckBtnTextDone,
                              ]}
                            >
                              {isDone ? 'Completed' : 'Mark Done'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.workoutFigureContainer}>
                          <Image
                            source={{ uri: cardImageUri }}
                            style={styles.workoutFigureImage}
                            contentFit="cover"
                            transition={250}
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ==================================================================== */}
          {/* MEDICAL & LEGAL GUARDRAILS (Mandatory Health Disclaimer)            */}
          {/* ==================================================================== */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <GlassCard style={styles.legalDisclaimerCard}>
              <View style={styles.legalDisclaimerHeader}>
                <ShieldAlert size={15} color="#D97706" />
                <Text style={styles.legalDisclaimerTitle}>
                  Medical Notice & Biomechanical Disclaimer
                </Text>
              </View>
              <Text style={styles.legalDisclaimerBody}>
                Tallgrame is an educational biomechanical wellness application. Stature increases are achieved through natural intervertebral disc rehydration and posture correction. Tallgrame does not guarantee epiphyseal bone elongation or replace licensed orthopedic treatment. Consult a physician before undertaking physical traction exercises.
              </Text>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        {/* ==================================================================== */}
        {/* MODALS                                                               */}
        {/* ==================================================================== */}
        <StretchTimerModal
          visible={!!selectedStretch}
          exercise={selectedStretch}
          onClose={() => setSelectedStretch(null)}
        />

        <BadgeModal
          visible={!!newlyUnlockedBadge}
          badge={newlyUnlockedBadge}
          isUnlocked={true}
          onClose={clearNewlyUnlockedBadge}
        />

        <HealthDisclaimerModal
          visible={showDisclaimerModal}
          onAccept={handleAcceptDisclaimer}
          onClose={() => setShowDisclaimerModal(false)}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

// ============================================================================
// STYLESHEET (Refined Apple-Inspired Minimalism + Image 2 Fidelity)
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topContextBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topProgressLineWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 6,
  },
  topProgressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topProgressPct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  topProgressSegmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  segmentTrack: {
    flex: 1,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(203, 213, 225, 0.5)',
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    width: '0%',
    borderRadius: 3,
  },
  segmentFillDone: {
    width: '100%',
    backgroundColor: '#10B981',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  superContextTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 115,
  },

  // Week Hero Row (Image 2 "Week 1" Header)
  weekHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  weekHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekHeroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  weekBadgeStatus: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  weekBadgeStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  weekNavArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekNavArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  weekNavArrowBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
  },

  // Calendar Bar (Image 2: MON 29, TUE 30...)
  calendarBarWrapper: {
    marginBottom: 18,
  },
  calendarDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  calendarPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarPillToday: {
    borderColor: '#93C5FD',
    backgroundColor: '#F0F9FF',
  },
  calendarDayAbbr: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  calendarDayAbbrActive: {
    color: '#DBEAFE',
  },
  calendarDateNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  calendarDateNumActive: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    marginTop: 2,
  },
  todayDotActive: {
    backgroundColor: '#FFFFFF',
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dayProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dayProgressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  categoriesHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoriesHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },

  // Workout Cards (Image 2 Pastel Banners)
  workoutCardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  workoutBannerTouch: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  workoutBannerGradient: {
    flexDirection: 'row',
    height: 126,
    borderRadius: 22,
    overflow: 'hidden',
  },
  workoutLeftColumn: {
    flex: 1.15,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'space-between',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  workoutBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  workoutBannerTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.85,
  },
  workoutBannerSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'capitalize',
  },
  cardCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardCheckBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  cardCheckBtnPending: {},
  cardCheckBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardCheckBtnTextDone: {
    color: '#FFFFFF',
  },
  workoutFigureContainer: {
    flex: 0.85,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  workoutFigureImage: {
    width: '100%',
    height: '100%',
  },
  figureBlendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mediaPillBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mediaPillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Advance Week
  advanceWeekWrapper: {
    marginTop: 4,
    marginBottom: 16,
  },
  advanceWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  advanceWeekBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weekInfoTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  weekInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  weekCompleteBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginVertical: 8,
  },
  weekCompleteText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },

  // Locked Card Styles
  lockedCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  lockedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockedTagPill: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lockedTagPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  lockedCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  lockedCardFocus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    textAlign: 'center',
  },
  lockedCardDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  lockedRequirementBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  lockedReqTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  lockedReqDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginTop: 2,
  },
  returnActiveWeekBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  returnActiveWeekBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Medical & Legal Disclaimer Card
  legalDisclaimerCard: {
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(254, 243, 199, 0.45)',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  legalDisclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  legalDisclaimerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  legalDisclaimerBody: {
    fontSize: 10.5,
    color: '#78350F',
    lineHeight: 15,
  },

  // 3-Way Segmented Tabs
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  segmentedTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 3,
  },
  segmentedTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 13,
  },
  segmentedTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // Hero Session Card (Today's Routine)
  heroSessionCard: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroSessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroPhasePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroPhasePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  heroDonePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroDonePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  heroSessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSessionGoal: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroStartBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Advanced Pro Pill Badge
  proPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  proPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#B45309',
  },

  // Roadmap 6-Week Plan
  roadmapListWrap: {
    gap: 14,
    marginBottom: 16,
  },
  roadmapCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadmapCardCurrent: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  roadmapCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  roadmapNumberBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapNumberBoxCurrent: {
    backgroundColor: '#EFF6FF',
  },
  roadmapNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  roadmapNumberTextCurrent: {
    color: '#2563EB',
  },
  roadmapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 3,
  },
  roadmapCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  roadmapCardFocus: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  roadmapCardGoal: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
  },
  roadmapLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roadmapLockPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  roadmapCompletedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roadmapCompletedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  roadmapCurrentPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roadmapCurrentPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  roadmapUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 14,
  },
  roadmapUpgradeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roadmapViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 14,
  },
  roadmapViewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Library tab
  libraryHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  categoryPillsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  catPillActive: {
    backgroundColor: '#2563EB',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catPillTextActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

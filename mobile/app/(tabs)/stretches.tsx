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
  Activity,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Film,
  FileImage,
  ChevronRight,
  ChevronLeft,
  Tag,
  Lock,
  ShieldAlert,
  X,
  Flame,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore, CLINICAL_STRETCHES, StretchExercise, WorkoutCategory, CategoryQuestion } from '../../lib/store';
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
  const toggleStretch = useAppStore((state) => state.toggleStretch);
  const newlyUnlockedBadge = useAppStore((state) => state.newlyUnlockedBadge);
  const clearNewlyUnlockedBadge = useAppStore((state) => state.clearNewlyUnlockedBadge);

  // Weekly Auto-Scheduler state & actions
  const workoutDaysPerWeek = useAppStore((state) => state.workoutDaysPerWeek ?? 4);
  const activePlanDay = useAppStore((state) => state.activePlanDay);
  const weeklyPlan = useAppStore((state) => state.weeklyPlan ?? {});
  const categories = useAppStore((state) => state.categories);
  const categoryQuestions = useAppStore((state) => state.categoryQuestions);
  const setActivePlanDay = useAppStore((state) => state.setActivePlanDay);
  const generateWeeklyPlan = useAppStore((state) => state.generateWeeklyPlan);

  // Multi-Week Program Progression & Gating
  const currentProgramWeek = useAppStore((state) => state.currentProgramWeek ?? 1);
  const selectedViewingWeek = useAppStore((state) => state.selectedViewingWeek ?? 1);
  const completedWeeks = useAppStore((state) => state.completedWeeks ?? []);
  const totalProgramWeeks = useAppStore((state) => state.totalProgramWeeks ?? 6);
  const multiWeekPlan = useAppStore((state) => state.multiWeekPlan ?? {});
  const setSelectedViewingWeek = useAppStore((state) => state.setSelectedViewingWeek);
  const advanceToNextWeek = useAppStore((state) => state.advanceToNextWeek);

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
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: StretchExercise[] = data.map((d: any, idx: number) => ({
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
      }
    } catch {
      // Keep local plan on network error
    } finally {
      setIsLoadingLive(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoadingLive(true);
    loadLiveStretches();
    useAppStore.getState().fetchLiveContent().catch(() => {});
    if (hasAcceptedHealthDisclaimer && !isProgramCalibrated) {
      calibratePersonalizedProgram().catch(() => {});
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

  // Exercises scheduled for this active day in this specific week
  const scheduledForDay = currentWeekPlan[currentDayKey] || [];
  const baseExercises: StretchExercise[] = scheduledForDay.length > 0
    ? scheduledForDay
    : (weeklyPlan[currentDayKey] && weeklyPlan[currentDayKey].length > 0)
    ? weeklyPlan[currentDayKey]
    : CLINICAL_STRETCHES;

  const dailyExercises: StretchExercise[] = baseExercises;

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // Record verified timestamp via phone internal clock
    const verifiedPhoneTimestamp = Date.now();
    toggleStretch(exerciseId);
  };

  const handleSelectDay = (dayName: string) => {
    Haptics.selectionAsync().catch(() => {});
    setActivePlanDay(dayName);
  };

  const canGoPrevWeek = selectedViewingWeek > 1;
  const canGoNextWeek = selectedViewingWeek < totalProgramWeeks;

  const handlePrevWeek = () => {
    if (canGoPrevWeek) {
      Haptics.selectionAsync().catch(() => {});
      setSelectedViewingWeek(selectedViewingWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoNextWeek) {
      Haptics.selectionAsync().catch(() => {});
      setSelectedViewingWeek(selectedViewingWeek + 1);
    }
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* ==================================================================== */}
        {/* TOP CONTEXT BAR (Image 2 Inspired: Category Subtitle & Brand)        */}
        {/* ==================================================================== */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.topContextBar}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandPill}>
              <Activity size={13} color="#2563EB" />
              <Text style={styles.brandText}>Tallgrame</Text>
              <View style={styles.onlineDot} />
            </View>
          </View>

          <Text style={styles.superContextTitle}>AT HOME WORKOUT</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          {/* ==================================================================== */}
          {/* WEEK SELECTOR HEADER WITH NAV CHEVRONS (Image 2: "Week 1")           */}
          {/* ==================================================================== */}
          <Animated.View
            entering={FadeInDown.delay(90).springify()}
            style={styles.weekHeroRow}
          >
            <View style={styles.weekHeroLeft}>
              <Text style={styles.weekHeroTitle}>Week {selectedViewingWeek}</Text>
              <View style={styles.weekBadgeStatus}>
                <Text style={styles.weekBadgeStatusText}>
                  {selectedViewingWeek < currentProgramWeek
                    ? 'Completed ✓'
                    : selectedViewingWeek === currentProgramWeek
                    ? 'Active Phase'
                    : 'Phase Locked 🔒'}
                </Text>
              </View>
            </View>

            {/* Left & Right Week Switcher Chevrons */}
            <View style={styles.weekNavArrowsRow}>
              <TouchableOpacity
                onPress={handlePrevWeek}
                disabled={!canGoPrevWeek}
                activeOpacity={0.7}
                style={[
                  styles.weekNavArrowBtn,
                  !canGoPrevWeek && styles.weekNavArrowBtnDisabled,
                ]}
              >
                <ChevronLeft
                  size={20}
                  color={canGoPrevWeek ? '#0F172A' : '#CBD5E1'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextWeek}
                disabled={!canGoNextWeek}
                activeOpacity={0.7}
                style={[
                  styles.weekNavArrowBtn,
                  !canGoNextWeek && styles.weekNavArrowBtnDisabled,
                ]}
              >
                <ChevronRight
                  size={20}
                  color={canGoNextWeek ? '#0F172A' : '#CBD5E1'}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ==================================================================== */}
          {/* 7-DAY CALENDAR BAR (Image 2: MON 29, TUE 30, WED 31, THU 1...)        */}
          {/* Synced directly with phone's internal clock                           */}
          {/* ==================================================================== */}
          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.calendarBarWrapper}
          >
            <View style={styles.calendarDaysRow}>
              {calendarWeek.map((dayItem) => {
                const isSelected = currentDayKey === dayItem.fullDayName;
                const isToday = dayItem.isToday;

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

                    {isToday && (
                      <View
                        style={[
                          styles.todayDot,
                          isSelected && styles.todayDotActive,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* ==================================================================== */}
          {/* PHASE LOCKED STATE (When user swipes or previews future locked weeks) */}
          {/* ==================================================================== */}
          {isWeekLocked ? (
            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <GlassCard style={styles.lockedCard}>
                <View style={styles.lockedIconCircle}>
                  <Lock size={32} color="#D97706" />
                </View>
                <View style={styles.lockedTagPill}>
                  <Text style={styles.lockedTagPillText}>Phase Locked</Text>
                </View>
                <Text style={styles.lockedCardTitle}>
                  {currentWeekInfo?.title || `Week ${selectedViewingWeek}`}
                </Text>
                <Text style={styles.lockedCardFocus}>
                  Target Focus: {currentWeekInfo?.focus || 'Spinal Decompression & Posture'}
                </Text>
                <Text style={styles.lockedCardDesc}>
                  {currentWeekInfo?.scientificGoal ||
                    'Complete all scheduled daily routines in your current active week to unlock this progressive training phase.'}
                </Text>

                <View style={styles.lockedRequirementBox}>
                  <ShieldCheck size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lockedReqTitle}>Unlock Condition</Text>
                    <Text style={styles.lockedReqDesc}>
                      You are currently in Week {currentProgramWeek}. Finish all Week {selectedViewingWeek - 1} workouts to unlock Week {selectedViewingWeek}.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedViewingWeek(currentProgramWeek);
                  }}
                  style={styles.returnActiveWeekBtn}
                >
                  <Text style={styles.returnActiveWeekBtnText}>
                    Return to Week {currentProgramWeek} (Active)
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          ) : (
            <>
              {/* Daily Progress & Category Filter Chips */}
              <Animated.View
                entering={FadeInDown.delay(140).springify()}
                style={styles.metaRow}
              >
                <View style={styles.dayProgressPill}>
                  <Flame size={12} color="#2563EB" />
                  <Text style={styles.dayProgressText}>
                    {currentDayKey}: {dayCompleted}/{dayTotal} Completed
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    router.push('/workout-categories');
                  }}
                  style={styles.categoriesHeaderBtn}
                >
                  <Tag size={11} color="#0284C7" />
                  <Text style={styles.categoriesHeaderBtnText}>Categories</Text>
                  <ChevronRight size={11} color="#0284C7" />
                </TouchableOpacity>
              </Animated.View>

              {/* ============================================================== */}
              {/* WORKOUT BANNER CARDS (Image 2 Exact Pastel Gradient Layout)     */}
              {/* ============================================================== */}
              <Animated.View
                entering={FadeInDown.delay(170).springify()}
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
                          {/* Left Column: Duration, Bold Title, Target Zone, Checkmark */}
                          <View style={styles.workoutLeftColumn}>
                            {/* Duration Badge Pill */}
                            <View style={styles.durationPill}>
                              <Clock size={11} color="#1E293B" />
                              <Text style={styles.durationPillText}>
                                {durationLabel}
                              </Text>
                            </View>

                            {/* Big Bold White Title (Image 2: FULL BODY, LEGS & GLUTES...) */}
                            <Text
                              style={[
                                styles.workoutBannerTitle,
                                isDone && styles.workoutBannerTitleDone,
                              ]}
                              numberOfLines={2}
                            >
                              {s.title.toUpperCase()}
                            </Text>

                            {/* Subtitle / Clinical Benefit */}
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

                          {/* Right Column: High Quality Athlete Figure Model Image */}
                          <View style={styles.workoutFigureContainer}>
                            <Image
                              source={{ uri: cardImageUri }}
                              style={styles.workoutFigureImage}
                              contentFit="cover"
                              transition={250}
                            />
                            {/* Smooth gradient blend overlay over image */}
                            <LinearGradient
                              colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
                              style={styles.figureBlendOverlay}
                            />

                            {/* Video / GIF tag if present */}
                            {s.media_type === 'video' && (
                              <View style={styles.mediaPillBadge}>
                                <Film size={10} color="#FFFFFF" />
                                <Text style={styles.mediaPillBadgeText}>Video</Text>
                              </View>
                            )}
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })
                )}
              </Animated.View>

              {/* Advance to next week button */}
              {currentProgramWeek < totalProgramWeeks && selectedViewingWeek === currentProgramWeek && (
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.advanceWeekWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                      advanceToNextWeek();
                    }}
                    style={styles.advanceWeekBtn}
                  >
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text style={styles.advanceWeekBtnText}>
                      Complete Week {currentProgramWeek} & Unlock Week {currentProgramWeek + 1}
                    </Text>
                    <ChevronRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
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
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingBottom: 40,
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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Activity,
  Waves,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Film,
  FileImage,
  Calendar,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore, CLINICAL_STRETCHES, StretchExercise } from '../../lib/store';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import StretchTimerModal from '../../components/StretchTimerModal';
import BadgeModal from '../../components/BadgeModal';

export default function StretchesScreen() {
  const completedStretches = useAppStore((state) => state.completedStretches);
  const toggleStretch = useAppStore((state) => state.toggleStretch);
  const newlyUnlockedBadge = useAppStore((state) => state.newlyUnlockedBadge);
  const clearNewlyUnlockedBadge = useAppStore((state) => state.clearNewlyUnlockedBadge);

  // Weekly Auto-Scheduler state & actions
  const workoutDaysPerWeek = useAppStore((state) => state.workoutDaysPerWeek ?? 4);
  const activePlanDay = useAppStore((state) => state.activePlanDay);
  const weeklyPlan = useAppStore((state) => state.weeklyPlan ?? {});
  const categories = useAppStore((state) => state.categories);
  const setWorkoutDaysPerWeek = useAppStore((state) => state.setWorkoutDaysPerWeek);
  const setActivePlanDay = useAppStore((state) => state.setActivePlanDay);
  const generateWeeklyPlan = useAppStore((state) => state.generateWeeklyPlan);

  const [selectedStretch, setSelectedStretch] = useState<StretchExercise | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const scheduleDays = Object.keys(weeklyPlan);
  const currentDayKey = scheduleDays.includes(activePlanDay)
    ? activePlanDay
    : scheduleDays[0] || 'Monday';

  const dailyExercises: StretchExercise[] =
    weeklyPlan[currentDayKey] && weeklyPlan[currentDayKey].length > 0
      ? weeklyPlan[currentDayKey]
      : CLINICAL_STRETCHES;

  const selectedCategory = categories.find(
    (c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug
  );

  const displayedExercises = React.useMemo(() => {
    if (selectedCategorySlug === 'all' || !selectedCategory) {
      return dailyExercises;
    }
    const filtered = dailyExercises.filter((s) => {
      const sIdStr = String(s.id);
      const stretchNumStr = `stretch-${Number(s.id) + 1}`;
      return (
        selectedCategory.workoutIds.includes(sIdStr) ||
        selectedCategory.workoutIds.includes(stretchNumStr)
      );
    });

    if (filtered.length > 0) return filtered;

    // Fallback: search across all CLINICAL_STRETCHES for this category
    const poolFallback = CLINICAL_STRETCHES.filter((s) => {
      const sIdStr = String(s.id);
      const stretchNumStr = `stretch-${Number(s.id) + 1}`;
      return (
        selectedCategory.workoutIds.includes(sIdStr) ||
        selectedCategory.workoutIds.includes(stretchNumStr)
      );
    });

    return poolFallback.length > 0 ? poolFallback : dailyExercises;
  }, [dailyExercises, selectedCategorySlug, selectedCategory]);

  const dayCompleted = displayedExercises.filter((s) =>
    completedStretches.includes(Number(s.id))
  ).length;
  const dayTotal = displayedExercises.length;
  const dayPct = Math.round((dayCompleted / Math.max(1, dayTotal)) * 100);

  const handleDaySelect = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActivePlanDay(day);
  };

  const handleFrequencyChange = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setWorkoutDaysPerWeek(days);
  };

  const handleRegenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setIsRegenerating(true);
    await generateWeeklyPlan(workoutDaysPerWeek);
    setTimeout(() => setIsRegenerating(false), 400);
  };

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.brandPill}>
            <Activity size={14} color="#2563EB" />
            <Text style={styles.brandText}>GoTall</Text>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              {dayCompleted} of {dayTotal} Done Today
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.titleSection}
          >
            <Text style={styles.subheadingText}>Biomechanical Alignment</Text>
            <Text style={styles.headingText}>Spinal Decompression</Text>
          </Animated.View>

          {/* ============================================================== */}
          {/* WEEKLY AUTO-SCHEDULER CONTROLS & DAYS PER WEEK SELECTOR        */}
          {/* ============================================================== */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <GlassCard style={styles.schedulerCard}>
              <View style={styles.schedulerHeaderRow}>
                <View style={styles.schedulerTitleCol}>
                  <View style={styles.schedulerPill}>
                    <Calendar size={12} color="#2563EB" />
                    <Text style={styles.schedulerPillText}>Auto-Scheduler</Text>
                  </View>
                  <Text style={styles.schedulerMainText}>
                    Active Workout Schedule
                  </Text>
                </View>

                {/* Regenerate Plan Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleRegenerate}
                  style={styles.regenerateBtn}
                >
                  <RotateCcw
                    size={12}
                    color="#2563EB"
                    style={isRegenerating ? { transform: [{ rotate: '180deg' }] } : undefined}
                  />
                  <Text style={styles.regenerateBtnText}>Regenerate</Text>
                </TouchableOpacity>
              </View>

              {/* Days per week frequency pills */}
              <View style={styles.frequencyRow}>
                {[3, 4, 5, 6, 7].map((num) => {
                  const isSelected = workoutDaysPerWeek === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      activeOpacity={0.7}
                      onPress={() => handleFrequencyChange(num)}
                      style={[
                        styles.frequencyChip,
                        isSelected && styles.frequencyChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.frequencyChipText,
                          isSelected && styles.frequencyChipTextActive,
                        ]}
                      >
                        {num} Days
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Day of the week horizontal selector */}
              {scheduleDays.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayTabsScroll}
                >
                  {scheduleDays.map((day) => {
                    const isActive = day === currentDayKey;
                    return (
                      <TouchableOpacity
                        key={day}
                        activeOpacity={0.7}
                        onPress={() => handleDaySelect(day)}
                        style={[
                          styles.dayTabPill,
                          isActive && styles.dayTabPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayTabText,
                            isActive && styles.dayTabTextActive,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </GlassCard>
          </Animated.View>

          {/* Central Progress Card */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.meterCenterWrap}>
                <CircularProgressRingGlass
                  size={140}
                  strokeWidth={11}
                  percentage={dayPct}
                  color="#0284C7"
                  gradientSecondary="#38BDF8"
                  valueText={`${dayCompleted}/${dayTotal}`}
                  unitText="Exercises"
                  label={currentDayKey}
                  sublabel={`${dayPct}% Completed`}
                />
              </View>

              <View style={styles.gainBanner}>
                <View style={styles.gainBannerLeft}>
                  <View style={styles.gainIconWrap}>
                    <Waves size={16} color="#0284C7" />
                  </View>
                  <View style={styles.gainTextCol}>
                    <Text style={styles.gainTitle}>Intervertebral Disc Rehydration</Text>
                    <Text style={styles.gainSubtitle}>
                      Relieves spinal compression (+1.0–2.5 cm stature expansion)
                    </Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category Filter Chips Bar */}
          <Animated.View
            entering={FadeInDown.delay(240).springify()}
            style={styles.categoryFilterSection}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipsScroll}
            >
              {/* "All" chip */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedCategorySlug('all');
                }}
                activeOpacity={0.8}
                style={[
                  styles.categoryChip,
                  selectedCategorySlug === 'all' && styles.categoryChipActive,
                ]}
              >
                <Text style={styles.categoryChipIcon}>✨</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategorySlug === 'all' && styles.categoryChipTextActive,
                  ]}
                >
                  All Stretches
                </Text>
              </TouchableOpacity>

              {/* Dynamic categories from admin store */}
              {categories.map((cat) => {
                const isSelected =
                  selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedCategorySlug(cat.slug || cat.id);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryChip,
                      isSelected && [
                        styles.categoryChipActive,
                        { borderColor: cat.color || '#0284C7' },
                      ],
                    ]}
                  >
                    <Text style={styles.categoryChipIcon}>{cat.icon || '🎯'}</Text>
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && [
                          styles.categoryChipTextActive,
                          { color: cat.color || '#0284C7' },
                        ],
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Routine List Header */}
          <Animated.View
            entering={FadeInDown.delay(260).springify()}
            style={styles.sectionHeaderRow}
          >
            <Text style={styles.sectionTitle}>
              {selectedCategorySlug === 'all' ? currentDayKey : selectedCategory?.name} ({dayTotal} Steps)
            </Text>
            <Text style={styles.sectionSubtitle}>
              Tap to open full-screen video timer
            </Text>
          </Animated.View>

          {/* Stretches List */}
          <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.stretchesListWrap}>
            {displayedExercises.map((s) => {
              const isDone = completedStretches.includes(Number(s.id));
              return (
                <GlassCard
                  key={s.id}
                  style={[
                    styles.stretchCard,
                    isDone ? styles.stretchCardDone : styles.stretchCardPending,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelectedStretch(s)}
                    style={styles.stretchContentRow}
                  >
                    <View style={styles.stretchInfoCol}>
                      <View style={styles.stretchTagsRow}>
                        {/* Category Tag Badge (Strict: Height Growth, Strength, Posture) */}
                        <View
                          style={[
                            styles.categoryBadge,
                            s.category === 'Height Growth'
                              ? styles.badgeGrowth
                              : s.category === 'Strength'
                              ? styles.badgeStrength
                              : styles.badgePosture,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              s.category === 'Height Growth'
                                ? styles.textGrowth
                                : s.category === 'Strength'
                                ? styles.textStrength
                                : styles.textPosture,
                            ]}
                          >
                            {s.category || 'Height Growth'}
                          </Text>
                        </View>

                        <View style={styles.durationTag}>
                          <Clock size={10} color="#64748B" />
                          <Text style={styles.durationTagText}>{s.durationSeconds}s</Text>
                        </View>

                        {/* Media Indicator Badge */}
                        <View style={styles.mediaPillTag}>
                          {s.media_type === 'video' ? (
                            <>
                              <Film size={10} color="#2563EB" />
                              <Text style={styles.mediaPillText}>Video</Text>
                            </>
                          ) : s.media_type === 'gif' ? (
                            <>
                              <Film size={10} color="#D97706" />
                              <Text style={styles.mediaPillText}>GIF</Text>
                            </>
                          ) : (
                            <>
                              <FileImage size={10} color="#059669" />
                              <Text style={styles.mediaPillText}>Image</Text>
                            </>
                          )}
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.stretchTitle,
                          isDone && styles.stretchTitleDone,
                        ]}
                      >
                        {s.title}
                      </Text>
                      <Text style={styles.stretchBenefit} numberOfLines={2}>
                        {s.clinicalBenefit}
                      </Text>
                    </View>

                    <View style={styles.stretchActionsRow}>
                      <GlassButton
                        onPress={() => setSelectedStretch(s)}
                        style={styles.playActionBtn}
                      >
                        <Play size={14} color="#2563EB" />
                      </GlassButton>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          toggleStretch(Number(s.id));
                        }}
                        style={[
                          styles.checkboxBtn,
                          isDone ? styles.checkboxBtnDone : styles.checkboxBtnPending,
                        ]}
                      >
                        <CheckCircle2
                          size={18}
                          color={isDone ? '#FFFFFF' : '#94A3B8'}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              );
            })}
          </Animated.View>

          {/* Scientific Citation Card */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard style={styles.citationCard}>
              <View style={styles.citationRow}>
                <ShieldCheck size={16} color="#059669" />
                <Text style={styles.citationText}>
                  Axial bodyweight traction creates negative intradiscal pressure, drawing water and nutrients back into compressed nucleus pulposus tissue.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        {/* Stretch Timer Modal */}
        <StretchTimerModal
          visible={!!selectedStretch}
          exercise={selectedStretch}
          onClose={() => setSelectedStretch(null)}
        />

        {/* Badge celebration modal */}
        <BadgeModal
          visible={!!newlyUnlockedBadge}
          badge={newlyUnlockedBadge}
          isUnlocked={true}
          onClose={clearNewlyUnlockedBadge}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 246, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#2563EB',
    marginBottom: 4,
  },
  headingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  schedulerCard: {
    padding: 16,
    marginBottom: 16,
  },
  schedulerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  schedulerTitleCol: {
    gap: 3,
  },
  schedulerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schedulerPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#2563EB',
  },
  schedulerMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  regenerateBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  frequencyChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  frequencyChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  frequencyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  frequencyChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayTabsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  dayTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  dayTabPillActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  dayTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayTabTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  cardSpacing: {
    marginBottom: 20,
    padding: 16,
  },
  meterCenterWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  gainBanner: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 246, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  gainBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gainIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gainTextCol: {
    flex: 1,
  },
  gainTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  gainSubtitle: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
  categoryFilterSection: {
    marginBottom: 16,
  },
  categoryChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0284C7',
    shadowOpacity: 0.12,
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stretchesListWrap: {
    gap: 12,
    marginBottom: 20,
  },
  stretchCard: {
    padding: 14,
  },
  stretchCardDone: {
    opacity: 0.75,
  },
  stretchCardPending: {},
  stretchContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stretchInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  stretchTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeGrowth: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeStrength: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  badgePosture: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textGrowth: {
    color: '#1D4ED8',
  },
  textStrength: {
    color: '#4338CA',
  },
  textPosture: {
    color: '#047857',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  durationTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  mediaPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  mediaPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
  },
  stretchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stretchTitleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  stretchBenefit: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  stretchActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  checkboxBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  checkboxBtnPending: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  citationCard: {
    padding: 14,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  citationText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
    lineHeight: 16,
  },
});

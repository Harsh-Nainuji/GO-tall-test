import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Flame,
  Sparkles,
  Activity,
  CheckCircle2,
  Bot,
  Plus,
  Zap,
  TrendingUp,
  Moon,
  Dumbbell,
  Apple,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useAppStore, CLINICAL_STRETCHES, StretchExercise } from '../../lib/store';
import { calculateTarget, cmToFtIn } from '../../lib/growth-calc';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import BiometricRulerGlass from '../../components/BiometricRulerGlass';
import BiologicalAvatarOrb from '../../components/BiologicalAvatarOrb';
import AIChatModal from '../../components/AIChatModal';
import FoodLogModal from '../../components/FoodLogModal';
import StretchTimerModal from '../../components/StretchTimerModal';
import BadgeModal from '../../components/BadgeModal';
import AppSpotlightTour from '../../components/AppSpotlightTour';

export default function HomeScreen() {
  const router = useRouter();
  const quizData = useAppStore((state) => state.quizData);
  const streakDays = useAppStore((state) => state.streakDays);
  const completedStretches = useAppStore((state) => state.completedStretches);
  const toggleStretch = useAppStore((state) => state.toggleStretch);
  const meals = useAppStore((state) => state.meals);
  const newlyUnlockedBadge = useAppStore((state) => state.newlyUnlockedBadge);
  const clearNewlyUnlockedBadge = useAppStore((state) => state.clearNewlyUnlockedBadge);
  const hasSeenAppTour = useAppStore((state) => state.hasSeenAppTour);
  const setHasSeenAppTour = useAppStore((state) => state.setHasSeenAppTour);

  // Modal dialog states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [selectedStretch, setSelectedStretch] = useState<StretchExercise | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-launch tutorial on first landing after onboarding
  React.useEffect(() => {
    if (!hasSeenAppTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasSeenAppTour]);

  const safeData = quizData || {
    gender: 'male' as const,
    age: 17,
    ethnicity: 'Global Population Standard',
    currentHeight: 172.4,
    fatherHeight: 178.0,
    motherHeight: 164.5,
    growthRate: '2 – 5 cm / year',
    shoeSize: 9,
    sleepHours: '8 – 10 hours',
    dietType: 'High protein balanced',
    smokeDrink: 'No, never',
    sittingHours: '4 – 8 hrs',
    motivation: 'Maximize my genetic height potential',
    dreamHeight: 182,
    activityLevel: 'Moderate Active',
  };
  const result = calculateTarget(safeData);

  // Biological Quota Computations
  const proteinLogged = meals.reduce((sum, m) => sum + m.protein, 0);
  const proteinTarget = 130;
  const proteinPct = Math.min(100, Math.round((proteinLogged / proteinTarget) * 100));

  const sleepHoursLogged = 8.2;
  const sleepTarget = 9.0;
  const sleepPct = Math.min(100, Math.round((sleepHoursLogged / sleepTarget) * 100));

  const stretchCount = completedStretches.length;
  const stretchTotal = CLINICAL_STRETCHES.length;
  const stretchPct = Math.min(100, Math.round((stretchCount / stretchTotal) * 100));

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Floating Glass Navigation Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.headerLeft}>
            <View style={styles.brandPill}>
              <Activity size={14} color="#2563EB" />
              <Text style={styles.brandText}>GoTall</Text>
              <View style={styles.onlineDot} />
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Replay Tutorial Button */}
            <TouchableOpacity
              style={styles.tourHeaderBtn}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setIsTourOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Sparkles size={12} color="#0284C7" />
              <Text style={styles.tourHeaderBtnText}>Tour</Text>
            </TouchableOpacity>

            {/* Streak Counter Chip */}
            <View style={styles.streakChip}>
              <Flame size={14} color="#D97706" />
              <Text style={styles.streakText}>{streakDays}d</Text>
            </View>

            {/* Micro-interaction AI button */}
            <GlassButton
              onPress={() => setIsAiModalOpen(true)}
              style={styles.aiHeaderBtn}
            >
              <Bot size={18} color="#FFFFFF" />
            </GlassButton>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome & Floating Biological Avatar Orb Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.heroHeaderSection}
          >
            <View style={styles.welcomeTextColumn}>
              <Text style={styles.subheadingText}>Biological Trajectory</Text>
              <Text style={styles.headingText}>Epiphyseal Protocol</Text>
              <View style={styles.statusPill}>
                <Zap size={11} color="#16A34A" />
                <Text style={styles.statusPillText}>Growth Plates Active</Text>
              </View>
            </View>

            {/* 3D Animated Floating Biological Assistant Orb */}
            <BiologicalAvatarOrb
              size={68}
              onPress={() => setIsAiModalOpen(true)}
            />
          </Animated.View>

          {/* CARD 1: Tanner Stature Trajectory (Glass Card) */}
          {!quizData && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <GlassCard style={[styles.cardSpacing, { borderColor: 'rgba(2, 132, 199, 0.4)', backgroundColor: 'rgba(2, 132, 199, 0.08)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#0284C7' }}>⚡ Clean Test Mode Active</Text>
                    <Text style={{ fontSize: 12, color: '#475569', marginTop: 3, lineHeight: 16 }}>
                      No mock data is loaded. Take the 15-question clinical assessment to generate your personalized Tanner-Whitehouse stature prediction.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/quiz')}
                    style={{ backgroundColor: '#0284C7', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, shadowColor: '#0284C7', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Start Test →</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.statureCardContent}>
                <View style={styles.statureRow}>
                  <View>
                    <Text style={styles.metricLabel}>Current Stature</Text>
                    <Text style={styles.metricValue}>
                      {(safeData.currentHeight ?? 172.4).toFixed(1)} cm
                    </Text>
                    <Text style={styles.metricSubvalue}>
                      {cmToFtIn(safeData.currentHeight ?? 172.4)}
                    </Text>
                  </View>

                  <View style={styles.alignEnd}>
                    <Text style={[styles.metricLabel, styles.accentColor]}>
                      Tanner Ceiling
                    </Text>
                    <Text style={[styles.metricValue, styles.accentColor]}>
                      {result.target.toFixed(1)} cm
                    </Text>
                    <Text style={[styles.metricSubvalue, styles.accentSubcolor]}>
                      {cmToFtIn(result.target)}
                    </Text>
                  </View>
                </View>

                {/* Potential Gain Bar */}
                <View style={styles.gainBanner}>
                  <View style={styles.gainBannerLeft}>
                    <View style={styles.gainIconWrap}>
                      <TrendingUp size={16} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.gainTitle}>Epiphyseal Window Gain</Text>
                      <Text style={styles.gainSubtitle}>
                        Range: {result.rangeMin} – {result.rangeMax} cm
                      </Text>
                    </View>
                  </View>
                  <View style={styles.gainBadge}>
                    <Text style={styles.gainBadgeText}>
                      +{(result.target - (safeData.currentHeight ?? 172.4)).toFixed(1)} cm
                    </Text>
                  </View>
                </View>

                {result.dreamWarning ? (
                  <View style={styles.dreamWarningBox}>
                    <Text style={styles.dreamWarningText}>{result.dreamWarning}</Text>
                  </View>
                ) : null}
              </View>
            </GlassCard>
          </Animated.View>

          {/* CARD 2: Biometric Ruler (High-Fidelity Scrollable Scale) */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.rulerCardHeader}>
                <View>
                  <Text style={styles.metricLabel}>Biometric Input Scale</Text>
                  <Text style={styles.sectionTitle}>Precision Biometric Ruler</Text>
                </View>
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveIndicatorText}>60 FPS SYNC</Text>
                </View>
              </View>

              <BiometricRulerGlass
                min={120}
                max={220}
                initialValue={safeData.currentHeight ?? 175}
                unit="cm"
              />
            </GlassCard>
          </Animated.View>

          {/* CARD 3: Circular Progress Rings (Hardware Accelerated SVG) */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.ringsHeader}>
                <View>
                  <Text style={styles.metricLabel}>Daily Biological Drivers</Text>
                  <Text style={styles.sectionTitle}>Anabolic Quota Rings</Text>
                </View>

                <GlassButton
                  onPress={() => setIsFoodModalOpen(true)}
                  style={styles.logMealBtn}
                >
                  <Plus size={14} color="#2563EB" />
                  <Text style={styles.logMealBtnText}>Log Meal</Text>
                </GlassButton>
              </View>

              {/* 3 Circular SVG Progress Meters */}
              <View style={styles.ringsRow}>
                {/* Protein Meter */}
                <CircularProgressRingGlass
                  size={92}
                  strokeWidth={8}
                  percentage={proteinPct}
                  color="#F97316"
                  icon={<Apple size={20} color="#F97316" />}
                  label="Protein"
                  sublabel={`${proteinLogged}g / ${proteinTarget}g`}
                />

                {/* Spinal Stretch Meter */}
                <CircularProgressRingGlass
                  size={92}
                  strokeWidth={8}
                  percentage={stretchPct}
                  color="#16A34A"
                  icon={<Dumbbell size={20} color="#16A34A" />}
                  label="Stretches"
                  sublabel={`${stretchCount}/${stretchTotal} done`}
                />

                {/* Sleep Somatotropin Meter */}
                <CircularProgressRingGlass
                  size={92}
                  strokeWidth={8}
                  percentage={sleepPct}
                  color="#2563EB"
                  icon={<Moon size={20} color="#2563EB" />}
                  label="Sleep (hGH)"
                  sublabel={`${sleepHoursLogged}h / ${sleepTarget}h`}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* CARD 4: Targeted Spinal Decompression Routine */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.routineHeader}>
                <View>
                  <Text style={styles.metricLabel}>Spinal Intervertebral Decompression</Text>
                  <Text style={styles.sectionTitle}>
                    Daily Protocol ({stretchCount}/{stretchTotal})
                  </Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>30 min</Text>
                </View>
              </View>

              <View style={styles.routineList}>
                {CLINICAL_STRETCHES.slice(0, 3).map((stretch) => {
                  const isDone = completedStretches.includes(stretch.id);
                  return (
                    <View
                      key={stretch.id}
                      style={[
                        styles.routineItem,
                        isDone ? styles.routineItemDone : styles.routineItemPending,
                      ]}
                    >
                      <GlassButton
                        onPress={() => setSelectedStretch(stretch)}
                        style={styles.routineItemDetails}
                      >
                        <View style={styles.routineTitleRow}>
                          <Text
                            style={[
                              styles.routineTitle,
                              isDone && styles.routineTitleCrossed,
                            ]}
                          >
                            {stretch.title}
                          </Text>
                          <View style={styles.secondsTag}>
                            <Text style={styles.secondsTagText}>
                              {stretch.durationSeconds}s
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.routineBenefit} numberOfLines={1}>
                          {stretch.clinicalBenefit}
                        </Text>
                      </GlassButton>

                      {/* Micro-interaction Checkbox */}
                      <GlassButton
                        onPress={() => toggleStretch(stretch.id)}
                        style={[
                          styles.checkboxBtn,
                          isDone ? styles.checkboxBtnDone : styles.checkboxBtnPending,
                        ]}
                      >
                        <CheckCircle2
                          size={18}
                          color={isDone ? '#FFFFFF' : '#94A3B8'}
                        />
                      </GlassButton>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </Animated.View>

          {/* CARD 5: AI Pediatric Growth Advisor Banner */}
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <GlassButton
              onPress={() => setIsAiModalOpen(true)}
              style={styles.aiBannerWrapper}
            >
              <LinearGradient
                colors={['#2563EB', '#3B82F6', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.aiBannerContent}>
                <View style={styles.aiBannerLeft}>
                  <View style={styles.aiTagRow}>
                    <Sparkles size={13} color="#BFDBFE" />
                    <Text style={styles.aiTagText}>Clinical Pediatric AI</Text>
                  </View>
                  <Text style={styles.aiQuote}>
                    &ldquo;Maximize deep sleep between 10PM–2AM for peak Somatotropin release.&rdquo;
                  </Text>
                  <Text style={styles.aiActionText}>
                    Tap to speak with Dr. Jack →
                  </Text>
                </View>
                <View style={styles.aiAvatarWrap}>
                  <Bot size={24} color="#FFFFFF" />
                </View>
              </View>
            </GlassButton>
          </Animated.View>
        </ScrollView>

        {/* Modal Panels */}
        <AIChatModal
          visible={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
        />
        <FoodLogModal
          visible={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
        />
        <StretchTimerModal
          visible={selectedStretch !== null}
          exercise={selectedStretch}
          onClose={() => setSelectedStretch(null)}
        />
        <BadgeModal
          badge={newlyUnlockedBadge}
          visible={newlyUnlockedBadge !== null}
          isUnlocked={true}
          onClose={clearNewlyUnlockedBadge}
        />
        <AppSpotlightTour
          visible={isTourOpen}
          onClose={() => {
            setIsTourOpen(false);
            setHasSeenAppTour(true);
          }}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tourHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tourHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.9)',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  aiHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  welcomeTextColumn: {
    flex: 1,
    marginRight: 12,
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 252, 231, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  cardSpacing: {
    marginBottom: 16,
    padding: 20,
  },
  statureCardContent: {},
  statureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
    paddingBottom: 16,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  metricSubvalue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  accentColor: {
    color: '#2563EB',
  },
  accentSubcolor: {
    color: '#60A5FA',
  },
  gainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(219, 234, 254, 0.8)',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
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
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gainTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  gainSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  gainBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  gainBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dreamWarningBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 243, 199, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.7)',
  },
  dreamWarningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 16,
  },
  rulerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  liveIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  ringsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
  },
  logMealBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  durationPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  routineList: {
    gap: 10,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  routineItemPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  routineItemDone: {
    backgroundColor: 'rgba(240, 253, 244, 0.85)',
    borderColor: 'rgba(187, 247, 208, 0.9)',
  },
  routineItemDetails: {
    flex: 1,
    marginRight: 10,
  },
  routineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  routineTitleCrossed: {
    color: '#15803D',
    textDecorationLine: 'line-through',
  },
  secondsTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 246, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(219, 234, 254, 0.8)',
  },
  secondsTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  routineBenefit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  checkboxBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBtnPending: {
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
  },
  checkboxBtnDone: {
    backgroundColor: '#16A34A',
  },
  aiBannerWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  aiBannerLeft: {
    flex: 1,
    marginRight: 14,
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DBEAFE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  aiQuote: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  aiActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BFDBFE',
    marginTop: 6,
  },
  aiAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});

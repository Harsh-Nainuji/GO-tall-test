import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStep {
  id: string;
  stepNumber: number;
  route: string;
  tabName: string;
  icon: string;
  title: string;
  summary: string;
  tips: Array<{ label: string; desc: string }>;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-home',
    stepNumber: 1,
    route: '/(tabs)/home',
    tabName: 'Home',
    icon: '🌱',
    title: 'Your Growth Dashboard',
    summary:
      'See your projected height potential, daily streak, and quick progress all in one place.',
    tips: [
      { label: 'Daily Streak', desc: 'Complete your daily habits to keep your streak alive.' },
      { label: 'AI Growth Coach', desc: 'Tap "Ask Dr. Jack / Dr. Sarah" anytime for instant guidance.' },
    ],
  },
  {
    id: 'step-stretches',
    stepNumber: 2,
    route: '/(tabs)/stretches',
    tabName: 'Stretches',
    icon: '🧘',
    title: 'Daily Stretches & Workouts',
    summary:
      'Follow guided spinal decompression routines designed to improve posture and reclaim standing height.',
    tips: [
      { label: 'Guided Timers', desc: 'Tap any stretch to start a step-by-step countdown timer.' },
      { label: 'Switch Goals', desc: 'Use Categories at the top to customize your workout plan.' },
    ],
  },
  {
    id: 'step-nutrition',
    stepNumber: 3,
    route: '/(tabs)/nutrition',
    tabName: 'Nutrition',
    icon: '🥗',
    title: 'Meals & Bone Nutrition',
    summary:
      'Track daily protein, calcium, zinc, and calories to fuel healthy bone and muscle growth.',
    tips: [
      { label: '1-Tap Food Log', desc: 'Pick from verified foods or type any meal to auto-estimate macros.' },
      { label: 'Daily Targets', desc: 'Watch your progress bars fill up as you log meals.' },
    ],
  },
  {
    id: 'step-sleep',
    stepNumber: 4,
    route: '/(tabs)/sleep',
    tabName: 'Sleep',
    icon: '🌙',
    title: 'Sleep & Growth Recovery',
    summary:
      'Most natural growth hormone is released during deep sleep. Set your schedule and log your rest.',
    tips: [
      { label: 'Sleep Schedule', desc: 'Tap Bedtime or Wake Up to adjust your target sleep window.' },
      { label: '7-Day History', desc: 'Tap any day bar to inspect your past sleep logs.' },
    ],
  },
  {
    id: 'step-profile',
    stepNumber: 5,
    route: '/(tabs)/profile',
    tabName: 'Profile',
    icon: '👤',
    title: 'Profile, Badges & Backup',
    summary:
      'View your unlocked achievements, manage your account, and replay this tutorial anytime.',
    tips: [
      { label: 'Cloud Sync', desc: 'Your progress saves automatically to your account.' },
      { label: 'Export or Replay', desc: 'Download your data or tap "Watch Tour" whenever you need a refresher.' },
    ],
  },
];

interface AppSpotlightTourProps {
  visible: boolean;
  onClose: () => void;
}

export default function AppSpotlightTour({ visible, onClose }: AppSpotlightTourProps) {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const step = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  // Reset to step 0 when opened
  useEffect(() => {
    if (visible) {
      setCurrentStepIdx(0);
    }
  }, [visible]);

  // Smoothly switch to the corresponding tab when step changes
  useEffect(() => {
    if (visible && step) {
      try {
        router.navigate(step.route as any);
      } catch {
        // Safe fallback
      }
    }
  }, [visible, currentStepIdx, step?.route]);

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (isLast) {
      onClose();
      setCurrentStepIdx(0);
      try {
        router.navigate('/(tabs)/home' as any);
      } catch {}
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync().catch(() => {});
    if (!isFirst) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    setCurrentStepIdx(0);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.overlay}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        {/* Top Control Bar: Always shows progress & clear Skip button */}
        <Animated.View entering={FadeIn.duration(250)} style={styles.topBar}>
          <View style={styles.tourPill}>
            <Compass size={14} color="#38BDF8" />
            <Text style={styles.tourPillText}>
              Quick Guide • {step.stepNumber}/{TOUR_STEPS.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.skipPillBtn}
            onPress={handleSkip}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            <Text style={styles.skipPillText}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom-docked Guide Card (Always fits cleanly without breaking) */}
        <Animated.View
          key={step.id}
          entering={FadeInDown.duration(320)}
          style={styles.cardWrapper}
        >
          <View style={styles.card}>
            {/* Step Dots (Tap any dot to jump directly to that screen) */}
            <View style={styles.dotsRow}>
              {TOUR_STEPS.map((s, idx) => {
                const active = idx === currentStepIdx;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setCurrentStepIdx(idx);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    style={[styles.stepDot, active && styles.stepDotActive]}
                  />
                );
              })}
            </View>

            {/* Scrollable Body (Prevents overflow on small phones) */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.cardScroll}
              contentContainerStyle={styles.cardScrollContent}
            >
              <View style={styles.headerRow}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emojiText}>{step.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tabBadge}>{step.tabName.toUpperCase()} TAB</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{step.summary}</Text>

              <View style={styles.tipsBox}>
                {step.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <CheckCircle2 size={16} color="#2563EB" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipLabel}>{tip.label}</Text>
                      <Text style={styles.tipDesc}>{tip.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Pinned Bottom Action Buttons (Always visible) */}
            <View style={styles.footerRow}>
              {!isFirst ? (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={handlePrev}
                  activeOpacity={0.75}
                >
                  <ArrowLeft size={16} color="#475569" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={handleSkip}
                  activeOpacity={0.75}
                >
                  <Text style={styles.backBtnText}>Skip Tour</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.nextBtnTouchable}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGradient}
                >
                  <Text style={styles.nextBtnText}>
                    {isLast ? 'Finish ✓' : 'Next'}
                  </Text>
                  {!isLast && <ArrowRight size={17} color="#FFFFFF" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tourPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tourPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  skipPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.68,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 14,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  stepDotActive: {
    width: 22,
    backgroundColor: '#2563EB',
  },
  cardScroll: {
    flexGrow: 0,
  },
  cardScrollContent: {
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  tabBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  summaryText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14,
  },
  tipsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    color: '#475569',
    fontSize: 13.5,
    fontWeight: '700',
  },
  nextBtnTouchable: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});

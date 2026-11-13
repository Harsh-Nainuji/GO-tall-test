import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Flame,
  Activity,
  Moon,
  Apple,
  Bot,
  CheckCircle2,
  HelpCircle,
  Compass,
  Layers,
  Zap,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStep {
  id: string;
  stepNumber: number;
  route: string;
  tabName: string;
  badge: string;
  icon: string;
  title: string;
  subtitle: string;
  whatItDoes: string;
  keyHighlights: Array<{ label: string; desc: string }>;
  whyItMatters: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-home',
    stepNumber: 1,
    route: '/(tabs)/home',
    tabName: 'Home Screen',
    badge: 'Stature Engine & Command Center',
    icon: '🌱',
    title: 'Biological Stature & Daily Streak',
    subtitle: 'Tanner-Whitehouse Model & Growth Velocity',
    whatItDoes:
      'Calculates your true maximum genetic potential using your biological age, sex, and parental genetics. Tracks your daily protocol streak to build unstoppable momentum.',
    keyHighlights: [
      { label: 'Genetic Ceiling', desc: 'Real-time calculation of remaining potential before growth plates fuse.' },
      { label: 'Daily Streak Counter', desc: 'Rewards daily adherence to keep growth stimuli continuous.' },
      { label: 'AI Growth Advisor', desc: '1-tap access to 24/7 pediatric AI advisor with citations.' },
    ],
    whyItMatters:
      'Gives you a clear biological target and keeps you accountable every single morning.',
  },
  {
    id: 'step-stretches',
    stepNumber: 2,
    route: '/(tabs)/stretches',
    tabName: 'Stretches Screen',
    badge: 'Spinal Decompression & Categories',
    icon: '🧘',
    title: 'Weekly Auto-Scheduler & Workouts',
    subtitle: 'Synovial Fluid & Disc Rehydration',
    whatItDoes:
      'Generates custom 3 to 7 day workout plans that decompress L1–L5 vertebrae, relaxing erector spinae muscles to reclaim 1.0 to 2.5 cm of standing height.',
    keyHighlights: [
      { label: '🏷️ Categories Option', desc: 'Tap top-right to switch between Height Growth, Weight Gain, Weight Loss, or Bodybuilder.' },
      { label: 'Auto-Scheduler', desc: 'Customizable 3–7 day weekly routine with 1-tap regenerate.' },
      { label: '60s Video Timer', desc: 'Interactive player with video cues, instructions, and haptic feedback.' },
    ],
    whyItMatters:
      'Diurnal gravity compresses your intervertebral discs daily. Targeted traction reverses this compression.',
  },
  {
    id: 'step-nutrition',
    stepNumber: 3,
    route: '/(tabs)/nutrition',
    tabName: 'Nutrition Screen',
    badge: 'Bone Matrix & Chondrocyte Nutrition',
    icon: '🥗',
    title: 'Skeletal Macros & AI Estimator',
    subtitle: 'Protein, Calcium, Zinc & Vitamin D3',
    whatItDoes:
      'Monitors your daily nutrition targets with verified clinical foods, micronutrient progress bars, and an AI macro estimator for any custom meal.',
    keyHighlights: [
      { label: '✨ AI Macro Estimator', desc: 'Type any meal (e.g. "Paneer paratha") and tap Auto-Estimate with AI for instant macros.' },
      { label: 'Clinical Food Library', desc: '1-tap logging for verified bone-building foods (yogurt, salmon, milk, eggs).' },
      { label: 'Micronutrient Tracking', desc: 'Real-time tracking of Calcium, Zinc, and Vitamin D3 for bone ossification.' },
    ],
    whyItMatters:
      'Epiphyseal cartilage cells cannot multiply without adequate protein nitrogen retention and bone mineral cofactors.',
  },
  {
    id: 'step-sleep',
    stepNumber: 4,
    route: '/(tabs)/sleep',
    tabName: 'Sleep Screen',
    badge: 'Somatotropin Hormonal Wave',
    icon: '🌙',
    title: 'Slow-Wave Deep Sleep Tracking',
    subtitle: 'Nocturnal hGH Secretion Window',
    whatItDoes:
      'Calculates your sleep duration and checks your rest against the critical 10 PM – 2 AM Human Growth Hormone wave using basic arithmetic.',
    keyHighlights: [
      { label: 'Arithmetic Duration', desc: 'Log bed/wake times or direct hours — automatically calculates total rest.' },
      { label: 'Somatotropin Window', desc: 'Detects if you slept through the peak 10 PM to 2 AM deep slow-wave anabolic window.' },
      { label: 'Weekly Sleep Graph', desc: 'Visualizes sleep consistency across Monday to Sunday against your 8.5h target.' },
    ],
    whyItMatters:
      'Over 75% of your daily pulsatile Growth Hormone (somatotropin) is secreted during Stage 3/4 deep sleep.',
  },
  {
    id: 'step-profile',
    stepNumber: 5,
    route: '/(tabs)/profile',
    tabName: 'Profile Screen',
    badge: 'Cloud Sync, Export & Account Control',
    icon: '👤',
    title: 'Growth Profile, Badges & Data Export',
    subtitle: 'Gamification Milestones & Privacy',
    whatItDoes:
      'Manage your personal biological baselines, unlocked achievement badges, cloud account sync, single-click data download, and account deletion.',
    keyHighlights: [
      { label: 'Cloud Account Sync', desc: 'Sign in with Google, Apple, or email to sync your data across devices.' },
      { label: '1-Click Data Download', desc: 'Export your complete biometric history, meals, sleep, and routines in JSON format.' },
      { label: 'Permanent Account Deletion', desc: 'GDPR/CCPA right-to-be-forgotten deletion removes all data from app & database.' },
    ],
    whyItMatters:
      'Ensures your data is backed up securely and gives you complete privacy and data ownership.',
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

  // Whenever step changes and tour is visible, navigate to that tab
  useEffect(() => {
    if (visible && step) {
      try {
        router.push(step.route as any);
      } catch (e) {
        // Safe navigation fallback
      }
    }
  }, [visible, currentStepIdx, step]);

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (isLast) {
      onClose();
      setCurrentStepIdx(0);
      try {
        router.push('/(tabs)/home' as any);
      } catch (e) {}
    } else {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync().catch(() => {});
    if (!isFirst) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
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

        {/* Top Floating Control Bar */}
        <View style={styles.topBar}>
          <View style={styles.tourPill}>
            <Compass size={14} color="#38BDF8" />
            <Text style={styles.tourPillText}>Interactive Multi-Screen Tour</Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleSkip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Current Screen Indicator Beacon */}
        <View style={styles.beaconArea}>
          <View style={styles.beaconOuterGlow}>
            <View style={styles.beaconInnerTarget}>
              <Text style={styles.beaconEmoji}>{step.icon}</Text>
            </View>
          </View>
          <View style={styles.beaconPointersRow}>
            <View style={styles.beaconLine} />
            <Text style={styles.beaconLabel}>
              TAB {step.stepNumber} OF {TOUR_STEPS.length}: {step.tabName.toUpperCase()}
            </Text>
            <View style={styles.beaconLine} />
          </View>
        </View>

        {/* Explanatory Glass Card Modal */}
        <Animated.View
          key={step.id}
          entering={FadeInDown.duration(280)}
          style={styles.cardContainer}
        >
          <GlassCard style={styles.explanationCard}>
            {/* Step header */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{step.badge}</Text>
              </View>
              <Text style={styles.stepCounterText}>
                Screen {step.stepNumber} of {TOUR_STEPS.length}
              </Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {/* What this page does */}
            <View style={styles.explainBlock}>
              <View style={styles.explainLabelRow}>
                <View style={styles.dotIndicator} />
                <Text style={styles.explainLabel}>WHAT THIS SCREEN DOES</Text>
              </View>
              <Text style={styles.explainBody}>{step.whatItDoes}</Text>
            </View>

            {/* Key features spotlight */}
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsHeader}>KEY FEATURES ON THIS PAGE:</Text>
              {step.keyHighlights.map((feat, idx) => (
                <View key={idx} style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.highlightLabel}>{feat.label}</Text>
                    <Text style={styles.highlightDesc}>{feat.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Why it matters section */}
            <View style={[styles.explainBlock, styles.whyBlock]}>
              <View style={styles.explainLabelRow}>
                <CheckCircle2 size={13} color="#059669" />
                <Text style={[styles.explainLabel, { color: '#059669' }]}>
                  WHY IT MATTERS FOR YOUR STATURE
                </Text>
              </View>
              <Text style={styles.explainBody}>{step.whyItMatters}</Text>
            </View>

            {/* Navigation buttons */}
            <View style={styles.footerRow}>
              {!isFirst ? (
                <TouchableOpacity
                  style={styles.prevBtn}
                  onPress={handlePrev}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={16} color="#475569" />
                  <Text style={styles.prevBtnText}>Previous</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipBtnText}>Skip Tour</Text>
                </TouchableOpacity>
              )}

              <View style={styles.nextBtnWrap}>
                <GlassButton onPress={handleNext}>
                  <View style={styles.nextBtnInner}>
                    <Text style={styles.nextBtnText}>
                      {isLast ? 'Finish Tour ✓' : `Go to Tab ${step.stepNumber + 1}`}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </View>
                </GlassButton>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 24 : 12,
  },
  tourPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.4)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tourPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  beaconOuterGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  beaconInnerTarget: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconEmoji: {
    fontSize: 24,
  },
  beaconPointersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  beaconLine: {
    width: 24,
    height: 1.5,
    backgroundColor: '#38BDF8',
  },
  beaconLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardContainer: {
    width: '100%',
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  explanationCard: {
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeWrap: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stepCounterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginBottom: 10,
  },
  explainBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  whyBlock: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  explainLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  explainLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.5,
  },
  explainBody: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 16,
  },
  highlightsContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  highlightsHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  highlightDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0284C7',
    marginTop: 5,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  highlightDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  prevBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  skipBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  nextBtnWrap: {
    flex: 1,
  },
  nextBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

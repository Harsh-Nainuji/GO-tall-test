import React, { useState } from 'react';
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
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStep {
  id: string;
  stepNumber: number;
  badge: string;
  icon: string;
  title: string;
  subtitle: string;
  whatItDoes: string;
  whyItMatters: string;
  highlightZone: 'ceiling' | 'streak' | 'stretches' | 'sleep' | 'nutrition' | 'advisor';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-ceiling',
    stepNumber: 1,
    badge: 'Biological Engine',
    icon: '🎯',
    title: 'Your Genetic Height Ceiling',
    subtitle: 'Tanner-Whitehouse III Stature Predictor',
    whatItDoes:
      'Calculates your true maximum genetic potential using your biological age, sex, and parental mid-stature genetics. No synthetic claims — this is your natural biological ceiling.',
    whyItMatters:
      'Tells you exactly how many centimeters you have left to gain before your epiphyseal growth plates close.',
    highlightZone: 'ceiling',
  },
  {
    id: 'step-streak',
    stepNumber: 2,
    badge: 'Consistency Habit',
    icon: '🔥',
    title: 'Daily Protocol Streak',
    subtitle: 'Epiphyseal Stimulus Continuity',
    whatItDoes:
      'Counts your unbroken daily days of protocol adherence. Every day you log stretches, nutrition, or sleep, your streak increases.',
    whyItMatters:
      'Cartilage cells multiply best with continuous daily stimulation. Missing days lets daytime gravity re-compress your posture.',
    highlightZone: 'streak',
  },
  {
    id: 'step-stretches',
    stepNumber: 3,
    badge: 'Spinal Traction Station',
    icon: '🧘',
    title: 'Daily Spinal Decompression',
    subtitle: 'Synovial Fluid & Disc Rehydration',
    whatItDoes:
      'Targeted routines that decompress your L1–L5 vertebrae, relaxing erector spinae muscles and pulling fluid back into discs to unlock 1.0 to 2.5 cm of standing height.',
    whyItMatters:
      'Tap any exercise to launch the full-screen video timer with step-by-step instructions and video guidance.',
    highlightZone: 'stretches',
  },
  {
    id: 'step-sleep',
    stepNumber: 4,
    badge: 'Anabolic Hormonal Window',
    icon: '🌙',
    title: 'Somatotropin (hGH) Sleep Tracking',
    subtitle: 'Deep Slow-Wave Peak Sync',
    whatItDoes:
      'Calculates your sleep duration and checks how much you slept during the peak 10 PM – 2 AM Human Growth Hormone wave using pure math (no AI needed).',
    whyItMatters:
      '80% of daily growth hormone pulses occur during deep sleep. Log either your bedtime/wake-up times or direct hours.',
    highlightZone: 'sleep',
  },
  {
    id: 'step-nutrition',
    stepNumber: 5,
    badge: 'Bone Matrix Nutrition',
    icon: '🥩',
    title: 'Skeletal Nutrition & Minerals',
    subtitle: 'Chondrocyte Fuel Tracking',
    whatItDoes:
      'Track your daily protein, calcium, and zinc intake. Includes high-protein foods, bone mineralization sources, and bedtime anabolic snacks.',
    whyItMatters:
      'New bone tissue cannot ossify without sufficient amino acids and minerals. 1-tap logging makes it effortless.',
    highlightZone: 'nutrition',
  },
  {
    id: 'step-advisor',
    stepNumber: 6,
    badge: '24/7 Clinical Intelligence',
    icon: '🤖',
    title: 'Clinical Growth AI Advisor',
    subtitle: 'Peer-Reviewed Pediatric Guidance',
    whatItDoes:
      'Have questions about puberty, growth spurts, workout form, or nutrition? Chat directly with your AI advisor trained on pediatric endocrine science.',
    whyItMatters:
      'Get honest, science-backed answers anytime without internet misinformation or synthetic promises.',
    highlightZone: 'advisor',
  },
];

interface AppSpotlightTourProps {
  visible: boolean;
  onClose: () => void;
}

export default function AppSpotlightTour({ visible, onClose }: AppSpotlightTourProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const step = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (isLast) {
      onClose();
      setCurrentStepIdx(0);
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
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        {/* Top Floating Control Bar */}
        <View style={styles.topBar}>
          <View style={styles.tourPill}>
            <Sparkles size={14} color="#38BDF8" />
            <Text style={styles.tourPillText}>App Walkthrough Tutorial</Text>
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

        {/* Spotlight Visual Cutout / Beacon */}
        <View style={styles.beaconArea}>
          <View style={styles.beaconOuterGlow}>
            <View style={styles.beaconInnerTarget}>
              <Text style={styles.beaconEmoji}>{step.icon}</Text>
            </View>
          </View>
          <View style={styles.beaconPointersRow}>
            <View style={styles.beaconLine} />
            <Text style={styles.beaconLabel}>
              HIGHLIGHTING: {step.title.toUpperCase()}
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
                Step {step.stepNumber} of {TOUR_STEPS.length}
              </Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {/* What it does section */}
            <View style={styles.explainBlock}>
              <View style={styles.explainLabelRow}>
                <View style={styles.dotIndicator} />
                <Text style={styles.explainLabel}>WHAT DOES THIS DO?</Text>
              </View>
              <Text style={styles.explainBody}>{step.whatItDoes}</Text>
            </View>

            {/* Why it matters section */}
            <View style={[styles.explainBlock, styles.whyBlock]}>
              <View style={styles.explainLabelRow}>
                <CheckCircle2 size={13} color="#059669" />
                <Text style={[styles.explainLabel, { color: '#059669' }]}>
                  WHY IT MATTERS FOR YOUR HEIGHT
                </Text>
              </View>
              <Text style={styles.explainBody}>{step.whyItMatters}</Text>
            </View>

            {/* Replay Notice */}
            <View style={styles.replayHintRow}>
              <HelpCircle size={13} color="#0284C7" />
              <Text style={styles.replayHintText}>
                You can replay this tutorial anytime via the 🎬 Tour button in the header.
              </Text>
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
                  <Text style={styles.prevBtnText}>Back</Text>
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
                      {isLast ? 'Complete Tour ✓' : 'Next Step'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 20 : 10,
  },
  tourPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tourPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  beaconOuterGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  beaconInnerTarget: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconEmoji: {
    fontSize: 30,
  },
  beaconPointersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  beaconLine: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.6)',
  },
  beaconLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  cardContainer: {
    width: '100%',
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  explanationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeWrap: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  explainBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  whyBlock: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  explainLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  explainLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  explainBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  replayHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  replayHintText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  prevBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  nextBtnWrap: {
    flex: 1,
  },
  nextBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

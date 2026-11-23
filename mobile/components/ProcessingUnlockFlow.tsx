import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Fingerprint,
  Lock,
  Dna,
} from 'lucide-react-native';
import GlassCard from './GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProcessingUnlockFlowProps {
  onUnlocked: () => void;
  predictedGainCm?: number;
  gender?: 'male' | 'female';
}

const MILESTONES = [
  'Calibrating Sexual Dimorphic Offset...',
  'Computing Tanner-Whitehouse III Mid-Parental Ceiling...',
  'Simulating Epiphyseal Chondrocyte Proliferation Velocity...',
  'Analyzing Diurnal Intervertebral Decompression Reserve...',
  'Biometric Stature Engine Ready!',
];

export default function ProcessingUnlockFlow({
  onUnlocked,
  predictedGainCm = 3.6,
  gender = 'male',
}: ProcessingUnlockFlowProps) {
  const [phase, setPhase] = useState<'processing' | 'unlock'>('processing');
  const [percent, setPercent] = useState(0);
  const [statusText, setStatusText] = useState(MILESTONES[0]);
  const [isHolding, setIsHolding] = useState(false);

  // Animations
  const scanRingScale = useSharedValue(1);
  const holdProgress = useSharedValue(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFemale = gender === 'female';
  const primaryColor = isFemale ? '#B28EF0' : '#1D4ED8';
  const glowColor = isFemale ? 'rgba(178, 142, 240, 0.4)' : 'rgba(29, 78, 216, 0.4)';

  // Phase 1: 0% to 100% processing simulation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        setStatusText(MILESTONES[4]);
        clearInterval(interval);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => {
          setPhase('unlock');
        }, 600);
      } else {
        setPercent(current);
        const stageIdx = Math.floor((current / 100) * 4);
        setStatusText(MILESTONES[stageIdx] || MILESTONES[3]);
        if (current % 20 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Fingerprint pulse animation loop
  useEffect(() => {
    if (phase === 'unlock') {
      scanRingScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 900, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [phase]);

  // Handle Long Press PressIn
  const handlePressIn = () => {
    setIsHolding(true);
    holdProgress.value = withTiming(1, { duration: 900, easing: Easing.linear });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    holdTimerRef.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setIsHolding(false);
      onUnlocked();
    }, 900);
  };

  // Handle PressOut (if released early)
  const handlePressOut = () => {
    setIsHolding(false);
    holdProgress.value = withTiming(0, { duration: 200 });
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanRingScale.value }],
  }));

  const fillAnimStyle = useAnimatedStyle(() => ({
    height: `${holdProgress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {phase === 'processing' ? (
        /* ========================================================================= */
        /* PHASE 1: 0 to 100% PROCESSING SCREEN                                      */
        /* ========================================================================= */
        <Animated.View entering={FadeIn} style={styles.centerBox}>
          <View style={[styles.dnaIconWrap, { borderColor: primaryColor }]}>
            <Dna size={32} color={primaryColor} />
          </View>

          <Text style={styles.processingTitle}>Synthesizing Stature Engine</Text>

          {/* Big Bold Percentage (0% -> 100%) */}
          <Text style={[styles.bigPercentText, { color: primaryColor }]}>
            {percent}%
          </Text>

          {/* Smooth Progress Bar */}
          <View style={styles.trackBar}>
            <View
              style={[
                styles.fillBar,
                { width: `${percent}%`, backgroundColor: primaryColor },
              ]}
            />
          </View>

          {/* Changing Clinical Status Text */}
          <Text style={styles.statusMilestoneText}>{statusText}</Text>
        </Animated.View>
      ) : (
        /* ========================================================================= */
        /* PHASE 2: UNLOCK YOUR RESULT + FINGERPRINT SCANNER                        */
        /* ========================================================================= */
        <Animated.View entering={FadeInDown.duration(400)} style={styles.unlockContainer}>
          {/* Top Aesthetic Header */}
          <View style={styles.unlockHeader}>
            <View style={[styles.readyPill, { backgroundColor: isFemale ? '#F3E8FF' : '#EFF6FF', borderColor: primaryColor }]}>
              <Sparkles size={13} color={primaryColor} />
              <Text style={[styles.readyPillText, { color: primaryColor }]}>
                BIOMETRIC CALCULATION COMPLETE
              </Text>
            </View>

            <Text style={styles.unlockMainTitle}>
              Your Adult Stature{'\n'}Trajectory Is Ready
            </Text>
            <Text style={styles.unlockSubtext}>
              Calibrated with pediatric Tanner-Whitehouse III algorithms and mid-parental genetic projection.
            </Text>
          </View>

          {/* Teaser Growth Projection Card */}
          <GlassCard style={styles.teaserCard}>
            <View style={styles.teaserRow}>
              <View>
                <Text style={styles.teaserLabel}>PROJECTED ADULT POTENTIAL</Text>
                <Text style={styles.teaserBlurredVal}>
                  +{predictedGainCm.toFixed(1)} cm Available
                </Text>
              </View>
              <View style={[styles.lockIconBox, { backgroundColor: glowColor }]}>
                <Lock size={18} color={primaryColor} />
              </View>
            </View>
            <Text style={styles.teaserHint}>
              Press and hold the biometric scanner below to unlock your full clinical trajectory.
            </Text>
          </GlassCard>

          {/* Bottom Fingerprint Scanner Area */}
          <View style={styles.scannerWrapper}>
            <Animated.View
              style={[
                styles.pulseOuterRing,
                ringAnimStyle,
                { borderColor: isHolding ? primaryColor : glowColor },
              ]}
            />

            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                onUnlocked();
              }}
              style={[
                styles.fingerprintBtn,
                { borderColor: primaryColor, backgroundColor: isHolding ? glowColor : 'rgba(255, 255, 255, 0.95)' },
              ]}
            >
              <Animated.View
                style={[
                  styles.holdFillOverlay,
                  fillAnimStyle,
                  { backgroundColor: isFemale ? 'rgba(178, 142, 240, 0.35)' : 'rgba(29, 78, 216, 0.25)' },
                ]}
              />
              <Fingerprint
                size={44}
                color={primaryColor}
                strokeWidth={2.2}
              />
            </Pressable>

            <Text style={styles.holdToScanPrompt}>
              {isHolding ? 'Scanning Biometrics...' : 'Touch to unlock trajectory'}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  dnaIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  bigPercentText: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  trackBar: {
    width: '85%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 20,
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusMilestoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  unlockContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  unlockHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  readyPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  unlockMainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  unlockSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 17,
  },
  teaserCard: {
    width: '100%',
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  teaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teaserLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  teaserBlurredVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  lockIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teaserHint: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  scannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    position: 'relative',
    height: 140,
    width: '100%',
  },
  pulseOuterRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
  },
  fingerprintBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  holdFillOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  holdToScanPrompt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  unlockSuccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  actionsList: {
    gap: 10,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  actionRowBtnFeatured: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  viewDirectLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  viewDirectLinkText: {
    fontSize: 13,
    fontWeight: '800',
  },
});

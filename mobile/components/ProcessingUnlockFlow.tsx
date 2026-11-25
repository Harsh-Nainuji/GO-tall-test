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
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Fingerprint,
  Lock,
  Dna,
  Activity,
  CheckCircle2,
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
  const haloAuraScale = useSharedValue(1);
  const coreGlowOpacity = useSharedValue(0.4);
  const particleOrbit = useSharedValue(0);
  const holdProgress = useSharedValue(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFemale = gender === 'female';
  const primaryColor = isFemale ? '#B28EF0' : '#1D4ED8';
  const glowColor = isFemale ? 'rgba(178, 142, 240, 0.35)' : 'rgba(29, 78, 216, 0.35)';
  const softBg = isFemale ? '#F5F0FD' : '#EFF6FF';

  // Floating particles & glowing effect setup
  useEffect(() => {
    // Continuous rotating particle orbit
    particleOrbit.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    // Core pulsing glow
    coreGlowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Concentric halo scale
    haloAuraScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1400, easing: Easing.out(Easing.ease) }),
        withTiming(0.95, { duration: 1400, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Phase 1: 0% to 100% calculation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        setStatusText(MILESTONES[4]);
        clearInterval(interval);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setPhase('unlock');
        }, 700);
      } else {
        setPercent(current);
        const stageIdx = Math.floor((current / 100) * 4);
        setStatusText(MILESTONES[stageIdx] || MILESTONES[3]);
        if (current % 20 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Phase 2: Concentric pulse loop for fingerprint scanner
  useEffect(() => {
    if (phase === 'unlock') {
      scanRingScale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [phase]);

  // Handle Long Press PressIn
  const handlePressIn = () => {
    setIsHolding(true);
    holdProgress.value = withTiming(1, { duration: 800, easing: Easing.linear });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    holdTimerRef.current = setTimeout(() => {
      // Strong multi-stage haptic vibration at completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 120);

      setIsHolding(false);
      onUnlocked();
    }, 850);
  };

  // Handle PressOut (if released early)
  const handlePressOut = () => {
    setIsHolding(false);
    holdProgress.value = withTiming(0, { duration: 180 });
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Direct tap unlock with vibration
  const handleTapUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 120);
    onUnlocked();
  };

  // Animated styles
  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanRingScale.value }],
  }));

  const haloAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloAuraScale.value }],
    opacity: coreGlowOpacity.value,
  }));

  const fillAnimStyle = useAnimatedStyle(() => ({
    height: `${holdProgress.value * 100}%`,
  }));

  // Orbital particles around central ring
  const particle1Style = useAnimatedStyle(() => {
    const angle = (particleOrbit.value * Math.PI) / 180;
    const r = 90;
    return {
      transform: [
        { translateX: Math.cos(angle) * r },
        { translateY: Math.sin(angle) * r },
        { scale: 0.8 + 0.3 * Math.sin(angle) },
      ],
    };
  });

  const particle2Style = useAnimatedStyle(() => {
    const angle = ((particleOrbit.value + 120) * Math.PI) / 180;
    const r = 96;
    return {
      transform: [
        { translateX: Math.cos(angle) * r },
        { translateY: Math.sin(angle) * r },
        { scale: 0.9 + 0.2 * Math.cos(angle) },
      ],
    };
  });

  const particle3Style = useAnimatedStyle(() => {
    const angle = ((particleOrbit.value + 240) * Math.PI) / 180;
    const r = 86;
    return {
      transform: [
        { translateX: Math.cos(angle) * r },
        { translateY: Math.sin(angle) * r },
        { scale: 0.7 + 0.4 * Math.sin(angle) },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {phase === 'processing' ? (
        /* ========================================================================= */
        /* PHASE 1: REDESIGNED GLOWING QUANTUM SYNTHESIS SCREEN                      */
        /* ========================================================================= */
        <Animated.View entering={FadeIn.duration(400)} style={styles.centerBox}>
          {/* Header pill */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.glowBadgePill, { borderColor: primaryColor, backgroundColor: softBg }]}>
            <Activity size={12} color={primaryColor} />
            <Text style={[styles.glowBadgeText, { color: primaryColor }]}>
              BIOMETRIC SYNTHESIS IN PROGRESS
            </Text>
          </Animated.View>

          {/* Central Orb with Concentric Glow Rings & Orbiting Particles */}
          <View style={styles.orbContainer}>
            {/* Outer Concentric Glow Aura */}
            <Animated.View
              style={[
                styles.glowingOuterRing,
                haloAnimStyle,
                {
                  borderColor: primaryColor,
                  backgroundColor: glowColor,
                },
              ]}
            />

            {/* Secondary Dashed Concentric Arc */}
            <View
              style={[
                styles.dashedArcRing,
                { borderColor: isFemale ? 'rgba(178, 142, 240, 0.45)' : 'rgba(29, 78, 216, 0.45)' },
              ]}
            />

            {/* Floating Orbiting Quantum Particles */}
            <Animated.View style={[styles.particleNode, particle1Style, { backgroundColor: primaryColor }]} />
            <Animated.View style={[styles.particleNode, particle2Style, { backgroundColor: isFemale ? '#C084FC' : '#60A5FA' }]} />
            <Animated.View style={[styles.particleNode, particle3Style, { backgroundColor: isFemale ? '#E9D5FF' : '#93C5FD' }]} />

            {/* Central Solid Hub */}
            <View style={styles.centerHub}>
              <View style={[styles.dnaMicroWrap, { backgroundColor: softBg }]}>
                <Dna size={22} color={primaryColor} />
              </View>
              <Text style={[styles.hugePercentText, { color: primaryColor }]}>
                {percent}%
              </Text>
              <Text style={styles.hubSubText}>OPTIMIZING</Text>
            </View>
          </View>

          {/* Glowing Track Bar */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.trackBarWrap}>
            <View style={styles.trackBar}>
              <View
                style={[
                  styles.fillBar,
                  { width: `${percent}%`, backgroundColor: primaryColor },
                ]}
              />
            </View>
          </Animated.View>

          {/* Milestone Status Text with Card */}
          <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.milestoneCard}>
            <View style={[styles.pulseStatusDot, { backgroundColor: primaryColor }]} />
            <Text style={styles.statusMilestoneText}>{statusText}</Text>
          </Animated.View>
        </Animated.View>
      ) : (
        /* ========================================================================= */
        /* PHASE 2: UNLOCK YOUR RESULT + PERFECT CONCENTRIC FINGERPRINT SCANNER      */
        /* ========================================================================= */
        <Animated.View entering={FadeInDown.duration(450).springify()} style={styles.unlockContainer}>
          {/* Top Aesthetic Header */}
          <View style={styles.unlockHeader}>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.readyPill, { backgroundColor: softBg, borderColor: primaryColor }]}>
              <Sparkles size={13} color={primaryColor} />
              <Text style={[styles.readyPillText, { color: primaryColor }]}>
                BIOMETRIC CALCULATION COMPLETE
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <Text style={styles.unlockMainTitle}>
                Your Adult Stature{'\n'}Trajectory Is Ready
              </Text>
              <Text style={styles.unlockSubtext}>
                Calibrated with pediatric Tanner-Whitehouse III algorithms and mid-parental genetic projection.
              </Text>
            </Animated.View>
          </View>

          {/* Teaser Growth Projection Card */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={{ width: '100%' }}>
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
          </Animated.View>

          {/* Concentric Fingerprint Scanner Container (100% Centered Geometry) */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.scannerWrapper}>
            <View style={styles.fingerprintConcentricBox}>
              {/* Outer Glowing Halo */}
              <Animated.View
                style={[
                  styles.outerHaloRing,
                  haloAnimStyle,
                  { borderColor: glowColor, backgroundColor: softBg },
                ]}
              />

              {/* Concentric Pulse Ring (Scales from exact center) */}
              <Animated.View
                style={[
                  styles.pulseOuterRing,
                  ringAnimStyle,
                  { borderColor: isHolding ? primaryColor : isFemale ? '#C084FC' : '#60A5FA' },
                ]}
              />

              {/* Centered Pressable Fingerprint Button */}
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleTapUnlock}
                style={[
                  styles.fingerprintBtn,
                  { borderColor: primaryColor, backgroundColor: isHolding ? glowColor : '#FFFFFF' },
                ]}
              >
                <Animated.View
                  style={[
                    styles.holdFillOverlay,
                    fillAnimStyle,
                    { backgroundColor: isFemale ? 'rgba(178, 142, 240, 0.35)' : 'rgba(29, 78, 216, 0.28)' },
                  ]}
                />
                <Fingerprint
                  size={42}
                  color={primaryColor}
                  strokeWidth={2.2}
                />
              </Pressable>
            </View>

            <Text style={styles.holdToScanPrompt}>
              {isHolding ? 'Scanning Biometrics...' : 'Touch to unlock trajectory'}
            </Text>
          </Animated.View>
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
    paddingVertical: 24,
  },
  glowBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  glowBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  orbContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  glowingOuterRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  dashedArcRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  particleNode: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  centerHub: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dnaMicroWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  hugePercentText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  hubSubText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: -2,
  },
  trackBarWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  trackBar: {
    width: '82%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pulseStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusMilestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 16,
    flexShrink: 1,
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
    marginBottom: 24,
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
    width: '100%',
  },
  fingerprintConcentricBox: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerHaloRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  pulseOuterRing: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 2,
  },
  fingerprintBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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
});

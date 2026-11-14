import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  ClipPath,
  Circle,
  Path,
  LinearGradient,
  Stop,
  G,
  Line,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../lib/theme';

interface WaterGlobeProps {
  progress: number; // 0 to 1 (can exceed 1)
  currentMl: number;
  goalMl: number;
  size?: number;
}

const GLOBE_SIZE = 240;
const RADIUS = 114;
const CENTER = GLOBE_SIZE / 2;

// Repeating wave path for smooth horizontal translation
const WAVE_WIDTH = 240;
const waveD1 = `M 0 0 Q 60 -12 120 0 T 240 0 Q 300 -12 360 0 T 480 0 L 480 300 L 0 300 Z`;
const waveD2 = `M 0 0 Q 60 10 120 0 T 240 0 Q 300 10 360 0 T 480 0 L 480 300 L 0 300 Z`;

// Pulsing star component inside the globe
function PulsingStar({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 1200 + delay, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  return <Circle cx={cx} cy={cy} r={r} fill="#FFFFFF" fillOpacity={0.7} />;
}

export default function WaterGlobe({
  progress,
  currentMl,
  goalMl,
  size = GLOBE_SIZE,
}: WaterGlobeProps) {
  // Wave horizontal movement
  const waveTranslate = useSharedValue(0);
  const waveTranslateBack = useSharedValue(0);

  // Water level animation
  const clampedProgress = Math.min(Math.max(progress, 0), 1.1);
  const waterY = useSharedValue(GLOBE_SIZE);

  useEffect(() => {
    // 3000ms loop driving translateX
    waveTranslate.value = withRepeat(
      withTiming(-WAVE_WIDTH, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    waveTranslateBack.value = withRepeat(
      withTiming(-WAVE_WIDTH, { duration: 4200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    // Map progress 0..1 to Y coordinate (bottom: 240, top: 10)
    const targetY = GLOBE_SIZE - clampedProgress * (GLOBE_SIZE - 20);
    waterY.value = withSpring(targetY, { damping: 20, stiffness: 90 });
  }, [clampedProgress]);

  const animatedWaveFront = useAnimatedStyle(() => ({
    transform: [{ translateX: waveTranslate.value }],
  }));

  const animatedWaveBack = useAnimatedStyle(() => ({
    transform: [{ translateX: waveTranslateBack.value }],
  }));

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ translateY: waterY.value }],
  }));

  const percentDisplay = Math.round(progress * 100);

  // 7 Star coordinates within the globe
  const stars = [
    { cx: 70, cy: 60, r: 2.2, delay: 0 },
    { cx: 160, cy: 50, r: 2.8, delay: 200 },
    { cx: 190, cy: 110, r: 2.0, delay: 400 },
    { cx: 50, cy: 120, r: 2.5, delay: 100 },
    { cx: 120, cy: 80, r: 3.0, delay: 300 },
    { cx: 90, cy: 160, r: 1.8, delay: 500 },
    { cx: 155, cy: 170, r: 2.2, delay: 250 },
  ];

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}>
        <Defs>
          <ClipPath id="globeClip">
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </ClipPath>

          <LinearGradient id="globeBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.4" />
          </LinearGradient>

          <LinearGradient id="waterFrontGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity="0.95" />
          </LinearGradient>

          <LinearGradient id="waterBackGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#93C5FD" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.65" />
          </LinearGradient>
        </Defs>

        {/* Globe Base Background */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="url(#globeBg)"
          stroke="#BFDBFE"
          strokeWidth="3"
        />

        {/* Scale Ticks: 25%, 50%, 75%, 100% */}
        <G stroke="#93C5FD" strokeWidth="2" strokeDasharray="3,3">
          {/* 100% tick */}
          <Line x1="18" y1="35" x2="36" y2="35" />
          {/* 75% tick */}
          <Line x1="10" y1="85" x2="28" y2="85" />
          {/* 50% tick */}
          <Line x1="6" y1="120" x2="26" y2="120" strokeWidth="2.5" />
          {/* 25% tick */}
          <Line x1="14" y1="170" x2="30" y2="170" />
        </G>

        {/* 7 Pulsing Stars */}
        {stars.map((s, idx) => (
          <PulsingStar key={idx} cx={s.cx} cy={s.cy} r={s.r} delay={s.delay} />
        ))}
      </Svg>

      {/* Clipped Animated Waves */}
      <View style={[StyleSheet.absoluteFill, styles.clippedArea]}>
        <Animated.View style={[styles.wavesContainer, animatedContainer]}>
          {/* Back wave */}
          <Animated.View style={[styles.waveRow, animatedWaveBack]}>
            <Svg width={WAVE_WIDTH * 2} height={300} viewBox="0 0 480 300">
              <Path d={waveD2} fill="url(#waterBackGrad)" />
            </Svg>
          </Animated.View>

          {/* Front wave */}
          <Animated.View style={[styles.waveRow, animatedWaveFront]}>
            <Svg width={WAVE_WIDTH * 2} height={300} viewBox="0 0 480 300">
              <Path d={waveD1} fill="url(#waterFrontGrad)" />
            </Svg>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Globe Rim Highlight */}
      <Svg width={size} height={size} viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`} pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="2"
        />
      </Svg>

      {/* Centered Numbers Overlay */}
      <View style={styles.centerOverlay} pointerEvents="none">
        <Text style={styles.percentText}>{percentDisplay}%</Text>
        <Text style={styles.metricsText}>
          {currentMl} / {goalMl} ml
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clippedArea: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    width: RADIUS * 2,
    height: RADIUS * 2,
    top: CENTER - RADIUS,
    left: CENTER - RADIUS,
  },
  wavesContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  waveRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WAVE_WIDTH * 2,
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.slate900,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metricsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

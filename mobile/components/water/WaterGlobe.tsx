import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
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
const WAVE_WIDTH = 240;

// Repeating wave paths for smooth continuous flow
const waveD1 = `M 0 0 Q 60 -12 120 0 T 240 0 Q 300 -12 360 0 T 480 0 L 480 320 L 0 320 Z`;
const waveD2 = `M 0 0 Q 60 10 120 0 T 240 0 Q 300 10 360 0 T 480 0 L 480 320 L 0 320 Z`;

// Pulsing star component inside the water globe
function PulsingStar({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 1200 + delay, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [delay, opacity]);

  return <Circle cx={cx} cy={cy} r={r} fill="#FFFFFF" fillOpacity={0.75} />;
}

export default function WaterGlobe({
  progress,
  currentMl,
  goalMl,
  size = GLOBE_SIZE,
}: WaterGlobeProps) {
  // Expand outer circle to prevent clipping
  const outerBorderWidth = 6;
  const innerRadius = size / 2 - outerBorderWidth - 3;
  const center = size / 2;

  // Wave horizontal translation
  const waveTranslate = useSharedValue(0);
  const waveTranslateBack = useSharedValue(0);

  // Water level animation
  const clampedProgress = Math.min(Math.max(progress, 0), 1.05);
  const waterY = useSharedValue(size);

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
  }, [waveTranslate, waveTranslateBack]);

  useEffect(() => {
    // Map progress 0..1 to Y coordinate (0 = bottom, 1 = top)
    const targetY = size - clampedProgress * (size - 16);
    waterY.value = withSpring(targetY, { damping: 20, stiffness: 90 });
  }, [clampedProgress, size, waterY]);

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

  // Sparkle stars
  const scaleRatio = size / 240;
  const stars = [
    { cx: 70 * scaleRatio, cy: 60 * scaleRatio, r: 2.2 * scaleRatio, delay: 0 },
    { cx: 160 * scaleRatio, cy: 50 * scaleRatio, r: 2.8 * scaleRatio, delay: 200 },
    { cx: 190 * scaleRatio, cy: 110 * scaleRatio, r: 2.0 * scaleRatio, delay: 400 },
    { cx: 50 * scaleRatio, cy: 120 * scaleRatio, r: 2.5 * scaleRatio, delay: 100 },
    { cx: 120 * scaleRatio, cy: 80 * scaleRatio, r: 3.0 * scaleRatio, delay: 300 },
    { cx: 90 * scaleRatio, cy: 160 * scaleRatio, r: 1.8 * scaleRatio, delay: 500 },
    { cx: 155 * scaleRatio, cy: 170 * scaleRatio, r: 2.2 * scaleRatio, delay: 250 },
  ];

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Outer White Circular Border Ring with Soft Halo */}
      <View
        style={[
          styles.outerWhiteBorder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: outerBorderWidth,
          },
        ]}
      />

      {/* Internal Circular Mask for Wave Animation - Perfectly Contained Inside White Border */}
      <View
        style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
          borderRadius: innerRadius,
          overflow: 'hidden',
          backgroundColor: '#F0F9FF', // Realistic light water flask background (Never black)
          position: 'absolute',
          top: center - innerRadius,
          left: center - innerRadius,
        }}
      >
        {/* Animated Water Waves Container */}
        <Animated.View style={[styles.wavesContainer, animatedContainer, { width: size * 2 }]}>
          {/* Back wave layer - Luminous crystal aqua */}
          <Animated.View style={[styles.waveRow, animatedWaveBack]}>
            <Svg width={WAVE_WIDTH * 2} height={340} viewBox="0 0 480 320">
              <Defs>
                <LinearGradient id="backWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.75" />
                  <Stop offset="50%" stopColor="#38BDF8" stopOpacity="0.85" />
                  <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.95" />
                </LinearGradient>
              </Defs>
              <Path d={waveD2} fill="url(#backWaveGrad)" />
            </Svg>
          </Animated.View>

          {/* Front wave layer - Realistic vibrant refreshing blue water */}
          <Animated.View style={[styles.waveRow, animatedWaveFront]}>
            <Svg width={WAVE_WIDTH * 2} height={340} viewBox="0 0 480 320">
              <Defs>
                <LinearGradient id="frontWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                  <Stop offset="40%" stopColor="#0EA5E9" stopOpacity="0.95" />
                  <Stop offset="100%" stopColor="#0284C7" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Path d={waveD1} fill="url(#frontWaveGrad)" />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* Ambient Stars & Water Bubbles inside the flask */}
        <Svg width={innerRadius * 2} height={innerRadius * 2} style={StyleSheet.absoluteFill}>
          {stars.map((s, idx) => (
            <PulsingStar key={idx} cx={s.cx} cy={s.cy} r={s.r} delay={s.delay} />
          ))}

          {/* Level Ticks */}
          <G stroke="#BAE6FD" strokeWidth="2" strokeDasharray="3,3">
            <Line x1="16" y1={innerRadius * 0.4} x2="32" y2={innerRadius * 0.4} />
            <Line x1="10" y1={innerRadius * 0.8} x2="28" y2={innerRadius * 0.8} />
            <Line x1="8" y1={innerRadius} x2="30" y2={innerRadius} strokeWidth="2.5" />
            <Line x1="14" y1={innerRadius * 1.4} x2="30" y2={innerRadius * 1.4} />
          </G>
        </Svg>
      </View>

      {/* Surface Glass Specular Gloss Ring */}
      <View
        pointerEvents="none"
        style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
          borderRadius: innerRadius,
          position: 'absolute',
          top: center - innerRadius,
          left: center - innerRadius,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.75)',
        }}
      />

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
  outerWhiteBorder: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
    position: 'absolute',
  },
  wavesContainer: {
    height: 340,
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
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  metricsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

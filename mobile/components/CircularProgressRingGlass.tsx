import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color?: string;
  gradientSecondary?: string;
  icon?: React.ReactNode;
  label?: string;
  sublabel?: string;
  valueText?: string;
  unitText?: string;
  centerContent?: React.ReactNode;
}

/**
 * Apple-Inspired Single-Ring Circular Progress Meter
 * - Thin-to-medium crisp track (rgba(226, 232, 240, 0.70))
 * - Single continuous animated stroke with rounded terminal caps
 * - Refined blue / semantic gradient fills
 * - Clean central content area: large bold metric + small descriptor
 * - Smooth Reanimated 4 fluid fill and value interpolation
 */
export default function CircularProgressRingGlass({
  size = 96,
  strokeWidth = 7,
  percentage,
  color = colors.blue600,
  gradientSecondary,
  icon,
  label,
  sublabel,
  valueText,
  unitText,
  centerContent,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `grad_${color.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;
  const secondaryColor =
    gradientSecondary ||
    (color === '#10B981' || color === '#16A34A'
      ? '#34D399'
      : color === '#8B5CF6' || color === '#9333EA'
      ? '#C084FC'
      : color === '#F97316' || color === '#F59E0B'
      ? '#FBBF24'
      : '#38BDF8');

  // Initialize at full circumference (0% filled)
  const strokeOffset = useSharedValue(circumference);

  const targetPercentage = Math.min(100, Math.max(0, percentage));
  const targetOffset = circumference * (1 - targetPercentage / 100);

  useEffect(() => {
    // Smooth fluid liquid fill (zero jiggly bounce)
    strokeOffset.value = withTiming(targetOffset, {
      duration: 850,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [targetOffset]);

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeOffset.value,
    };
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={secondaryColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Clean minimal background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(226, 232, 240, 0.75)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Hardware-accelerated fluid active progress stroke */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>

        {/* Center content: Custom, Icon, Value+Unit, or numeric % */}
        <View style={styles.centerBox}>
          {centerContent ? (
            centerContent
          ) : icon ? (
            icon
          ) : valueText ? (
            <View style={styles.valueWrap}>
              <Text style={[styles.percentageText, size > 110 && styles.largePercentageText]}>
                {valueText}
              </Text>
              {unitText ? <Text style={styles.unitText}>{unitText}</Text> : null}
            </View>
          ) : (
            <Text style={[styles.percentageText, size > 110 && styles.largePercentageText]}>
              {Math.round(targetPercentage)}%
            </Text>
          )}
        </View>
      </View>

      {label && <Text style={styles.labelText}>{label}</Text>}
      {sublabel && <Text style={styles.sublabelText}>{sublabel}</Text>}
    </View>
  );
}

export { CircularProgressRingGlass as CircularProgress };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotateZ: '-90deg' }],
  },
  centerBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  largePercentageText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  unitText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  sublabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressRingGlassProps {
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
 * 3D Glassmorphic SVG Circular Progress Meter
 * - Smooth fluid fill animation (cubic bezier without jiggly bounce)
 * - Gradient-shaded active progress stroke matching 3D glass aesthetic
 * - Inner translucent glass core with specular border
 */
export default function CircularProgressRingGlass({
  size = 96,
  strokeWidth = 9,
  percentage,
  color = '#0284C7',
  gradientSecondary,
  icon,
  label,
  sublabel,
  valueText,
  unitText,
  centerContent,
}: CircularProgressRingGlassProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `grad_${color.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;
  const secondaryColor = gradientSecondary || (color === '#10B981' ? '#34D399' : color === '#8B5CF6' ? '#C084FC' : color === '#F97316' ? '#FB923C' : '#38BDF8');

  // Initialize at full circumference (0% filled)
  const strokeOffset = useSharedValue(circumference);

  const targetPercentage = Math.min(100, Math.max(0, percentage));
  const targetOffset = circumference * (1 - targetPercentage / 100);

  useEffect(() => {
    // Smooth fluid liquid fill (zero jiggly bounce)
    strokeOffset.value = withTiming(targetOffset, {
      duration: 950,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [targetOffset]);

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeOffset.value,
    };
  });

  const innerCoreSize = size - strokeWidth * 2 - 8;

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

          {/* Frosted inactive background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.50)"
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

        {/* Inner Floating Glass Core */}
        <View
          pointerEvents="none"
          style={[
            styles.innerGlassCore,
            {
              width: innerCoreSize,
              height: innerCoreSize,
              borderRadius: innerCoreSize / 2,
            },
          ]}
        />

        {/* Center content: Custom, Icon, Value+Unit, or numeric % */}
        <View style={StyleSheet.absoluteFill} className="items-center justify-center">
          {centerContent ? (
            centerContent
          ) : icon ? (
            icon
          ) : valueText ? (
            <View className="items-center justify-center">
              <Text style={styles.percentageText}>{valueText}</Text>
              {unitText ? <Text style={styles.unitText}>{unitText}</Text> : null}
            </View>
          ) : (
            <Text style={styles.percentageText}>{Math.round(targetPercentage)}%</Text>
          )}
        </View>
      </View>

      {label && <Text style={styles.labelText}>{label}</Text>}
      {sublabel && <Text style={styles.sublabelText}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotateZ: '-90deg' }],
  },
  innerGlassCore: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  sublabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});

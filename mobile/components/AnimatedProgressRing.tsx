import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedProgressRingProps {
  size?: number;
  strokeWidth?: number;
  targetPercentage: number; // 0 to 100
  color?: string;
  gradientColors?: [string, string];
  trackColor?: string;
  delayMs?: number;
  valueText: string;
  labelText: string;
  subText?: string;
  icon?: React.ReactNode;
}

export default function AnimatedProgressRing({
  size = 110,
  strokeWidth = 9,
  targetPercentage,
  color = '#2563EB',
  gradientColors,
  trackColor = '#F1F5F9',
  delayMs = 200,
  valueText,
  labelText,
  subText,
  icon,
}: AnimatedProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Shared value initialized at 0 to guarantee high-frequency 60fps animation
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delayMs,
      withSpring(Math.max(0, Math.min(100, targetPercentage)), {
        damping: 15,
        stiffness: 90,
        mass: 1,
      })
    );
  }, [targetPercentage, delayMs]);

  // High-performance animated SVG circle props (runs on UI thread)
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const gradientId = `grad-${labelText.replace(/\s+/g, '-').toLowerCase()}-${size}`;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {gradientColors ? (
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          ) : null}
        </Defs>

        {/* Background Inactive Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Dynamic Animated Active Arc with Spring Physics */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientColors ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Centered Metric Readout */}
      <View className="absolute items-center justify-center px-1">
        {icon ? <View className="mb-0.5">{icon}</View> : null}
        <Text className="text-xs font-black text-slate-900 tracking-tight text-center">
          {valueText}
        </Text>
        <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center mt-0.5">
          {labelText}
        </Text>
        {subText ? (
          <Text className="text-[8px] font-semibold text-blue-600 text-center">
            {subText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}


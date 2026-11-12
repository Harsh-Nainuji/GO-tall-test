import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularGaugeProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color?: string;
  trackColor?: string;
  valueText: string;
  labelText: string;
  subText?: string;
}

export default function CircularGauge({
  size = 110,
  strokeWidth = 9,
  percentage,
  color = '#0066FF',
  trackColor = '#F1F5F9',
  valueText,
  labelText,
  subText,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Inactive Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Dynamic Animated/Active Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Centered Metric Readout */}
      <View className="absolute items-center justify-center">
        <Text className="text-base font-black text-slate-900 tracking-tight leading-tight">
          {valueText}
        </Text>
        <Text className="text-[10px] font-bold text-slate-500 mt-0.5">{labelText}</Text>
        {subText && (
          <Text className="text-[9px] font-medium text-slate-400 mt-0.5">{subText}</Text>
        )}
      </View>
    </View>
  );
}


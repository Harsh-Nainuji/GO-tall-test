import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MotivationalPatternWallpaper from './MotivationalPatternWallpaper';
import { useAppStore } from '../lib/store';

interface GoTallBackgroundProps {
  children?: React.ReactNode;
  variant?: 'pattern' | 'plain';
  style?: StyleProp<ViewStyle>;
  patternOpacity?: number;
  gender?: 'male' | 'female';
}

/**
 * GoTall Apple-Inspired Luminous Ambient Background System
 * 1. Base clean white-to-slate canvas (#FFFFFF -> soft tint)
 * 2. Subtle fitness & spine motivational wallpaper pattern (WhatsApp-inspired)
 * 3. Bottom-edge ambient glow radiating upward:
 *    - Female: Soft Lavender to Radiant #B28EF0
 *    - Male: High-Saturation Royal Cobalt #1D4ED8
 */
export default function GoTallBackground({
  children,
  variant = 'pattern',
  style,
  patternOpacity = 0.20,
  gender: genderProp,
}: GoTallBackgroundProps) {
  const storeGender = useAppStore((state) => state.quizData?.gender);
  const activeGender = genderProp || storeGender;
  const isFemale = activeGender === 'female';

  const baseColors = isFemale
    ? (['#FFFFFF', '#FAF5FF', '#F3E8FF'] as const)
    : (['#FFFFFF', '#F0F6FF', '#E0EDFE'] as const);

  const glowColors = isFemale
    ? ([
        'transparent',
        'rgba(243, 232, 255, 0.12)',
        'rgba(216, 187, 248, 0.20)',
        'rgba(178, 142, 240, 0.28)',
      ] as const)
    : ([
        'transparent',
        'rgba(219, 234, 254, 0.15)',
        'rgba(147, 197, 253, 0.22)',
        'rgba(59, 130, 246, 0.25)',
      ] as const);

  return (
    <View style={[styles.container, style]}>
      {/* 1. Base Gradient Canvas */}
      <LinearGradient
        colors={baseColors}
        locations={[0.0, 0.55, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Motivational Line-Art Wallpaper Pattern */}
      {variant === 'pattern' && (
        <MotivationalPatternWallpaper opacity={patternOpacity} />
      )}

      {/* 3. Luminous Bottom-Edge Ambient Glow (Adaptive Gender Theming) */}
      <LinearGradient
        colors={glowColors}
        locations={[0.0, 0.38, 0.68, 0.88, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={styles.ambientBottomGlow}
        pointerEvents="none"
      />

      {/* 4. Foreground Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  ambientBottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '24%',
  },
});

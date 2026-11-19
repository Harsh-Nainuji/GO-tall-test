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
}

/**
 * GoTall Apple-Inspired Luminous Ambient Background System
 * 1. Base clean white-to-slate canvas (#FFFFFF -> #F8FAFC)
 * 2. Subtle fitness & spine motivational wallpaper pattern (WhatsApp-inspired)
 * 3. Bottom-edge ambient glow radiating upward from the display base (Blue for male, Pink/Rose for female)
 */
export default function GoTallBackground({
  children,
  variant = 'pattern',
  style,
  patternOpacity = 0.28,
}: GoTallBackgroundProps) {
  const gender = useAppStore((state) => state.quizData?.gender);
  const isFemale = gender === 'female';

  const baseColors = isFemale
    ? (['#FFF1F2', '#FFF5F7', '#FFFFFF'] as const)
    : (['#EBF5FF', '#F8FAFC', '#FFFFFF'] as const);

  const glowColors = isFemale
    ? ([
        'transparent',
        'rgba(255, 228, 230, 0.20)',
        'rgba(254, 205, 211, 0.40)',
        'rgba(244, 63, 94, 0.50)',
        'rgba(225, 29, 72, 0.60)',
      ] as const)
    : ([
        'transparent',
        'rgba(224, 242, 254, 0.18)',
        'rgba(147, 197, 253, 0.38)',
        'rgba(59, 130, 246, 0.48)',
        'rgba(37, 99, 235, 0.58)',
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
    height: '52%',
  },
});

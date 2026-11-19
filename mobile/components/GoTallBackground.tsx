import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MotivationalPatternWallpaper from './MotivationalPatternWallpaper';

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
 * 3. Bottom-edge blue ambient glow radiating upward from the display base
 */
export default function GoTallBackground({
  children,
  variant = 'pattern',
  style,
  patternOpacity = 0.045,
}: GoTallBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 1. Base Gradient Canvas */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC', '#F0F7FF']}
        locations={[0.0, 0.55, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Motivational Line-Art Wallpaper Pattern */}
      {variant === 'pattern' && (
        <MotivationalPatternWallpaper opacity={patternOpacity} />
      )}

      {/* 3. Luminous Bottom-Edge Blue Ambient Effect */}
      <LinearGradient
        colors={['transparent', 'rgba(239, 246, 255, 0.25)', 'rgba(191, 219, 254, 0.45)']}
        locations={[0.45, 0.75, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
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
    height: '42%',
  },
});

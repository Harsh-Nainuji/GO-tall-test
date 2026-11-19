import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import Animated, { EntryOrExitLayoutType } from 'react-native-reanimated';
import { colors, radii, shadows } from '../../lib/theme';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  entering?: EntryOrExitLayoutType;
  testID?: string;
  accessibilityLabel?: string;
  variant?: 'elevated' | 'subtle' | 'plain';
}

/**
 * GoTall Minimal Card Component (Apple-inspired)
 * - Crisp opaque/semi-opaque surface (#FFFFFF / rgba(255, 255, 255, 0.95))
 * - Clean 1px hairline border (#E2E8F0)
 * - Refined diffuse ambient shadow
 * - Purposeful corner radii (18px)
 */
export default function GlassCard({
  children,
  style,
  entering,
  testID,
  accessibilityLabel,
  variant = 'elevated',
}: GlassCardProps) {
  const cardStyle = [
    styles.card,
    variant === 'subtle' && styles.subtle,
    variant === 'plain' && styles.plain,
    style,
  ];

  if (entering) {
    return (
      <Animated.View
        entering={entering}
        style={cardStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View
      style={cardStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.lg,
    ...shadows.subtle,
    overflow: 'hidden',
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowOpacity: 0.02,
  },
  plain: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
});

import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { EntryOrExitLayoutType } from 'react-native-reanimated';
import { colors } from '../../lib/theme';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  entering?: EntryOrExitLayoutType;
  testID?: string;
  accessibilityLabel?: string;
}

export default function GlassCard({
  children,
  style,
  entering,
  testID,
  accessibilityLabel,
}: GlassCardProps) {
  return (
    <Animated.View
      entering={entering}
      style={[styles.card, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 24,
    shadowColor: colors.glassShadow,
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
  },
});

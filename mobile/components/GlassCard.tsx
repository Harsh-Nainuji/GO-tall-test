import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  className?: string;
}

/**
 * Authentic 3D Glassmorphism Card
 * - iOS: Native optical blur with explicit borderRadius clipping
 * - Android: Clean translucent glass fill (completely eliminates the Android BlurView sharp-corner white box bug)
 * - Zero elevation: Eliminates Android native shadow bounding box artifact
 */
export default function GlassCard({
  children,
  style,
  intensity = 35,
}: GlassCardProps) {
  const flattened = StyleSheet.flatten(style) || {};
  const radius = flattened.borderRadius !== undefined ? flattened.borderRadius : 24;

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.50)',
              borderRadius: radius,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    // iOS ambient specular shadow (NO elevation for Android, avoiding sharp white shadow rectangle)
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});

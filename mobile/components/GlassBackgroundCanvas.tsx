import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import GoTallBackground from './GoTallBackground';

interface GlassBackgroundCanvasProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'pattern' | 'plain';
  gender?: 'male' | 'female';
}

/**
 * GoTall Master Background Canvas
 * Fully updated to the Apple-inspired luminous ambient canvas:
 * - Soft canvas with dynamic gender palette:
 *   - Female: Lavender with #B28EF0 ambient glow
 *   - Male: High-saturation Royal Cobalt #1D4ED8 ambient glow
 * - Subtle line-art motivational wallpaper pattern
 */
export default function GlassBackgroundCanvas({
  children,
  style,
  variant = 'pattern',
  gender,
}: GlassBackgroundCanvasProps) {
  return (
    <GoTallBackground style={style} variant={variant} gender={gender}>
      {children}
    </GoTallBackground>
  );
}

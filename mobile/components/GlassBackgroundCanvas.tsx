import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import GoTallBackground from './GoTallBackground';

interface GlassBackgroundCanvasProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'pattern' | 'plain';
}

/**
 * GoTall Master Background Canvas
 * Fully updated to the Apple-inspired luminous ambient canvas:
 * - Soft white-to-slate canvas
 * - Subtle line-art motivational wallpaper pattern
 * - Bottom-edge blue ambient atmospheric glow
 */
export default function GlassBackgroundCanvas({
  children,
  style,
  variant = 'pattern',
}: GlassBackgroundCanvasProps) {
  return (
    <GoTallBackground style={style} variant={variant}>
      {children}
    </GoTallBackground>
  );
}

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassBackgroundCanvasProps {
  children?: React.ReactNode;
}

/**
 * Clean Top-to-Bottom Shaded Glass Canvas
 * Matches the exact smooth vertical gradient shading of the clinical graph.
 * Pure vertical flow from top to bottom with zero distracting circles/orbs.
 */
export default function GlassBackgroundCanvas({ children }: GlassBackgroundCanvasProps) {
  return (
    <View style={styles.container}>
      {/* Smooth top-to-bottom vertical shading matching graph aesthetic */}
      <LinearGradient
        colors={['#C7E0FA', '#DBEBFC', '#EDF5FD', '#F8FAFD']}
        locations={[0.0, 0.30, 0.65, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
});

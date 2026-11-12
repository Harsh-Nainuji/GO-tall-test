import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Bot, Zap } from 'lucide-react-native';

interface BiologicalAvatarOrbProps {
  onPress?: () => void;
  size?: number;
}

/**
 * 3D Biological Assistant / Progress Orb
 * - Floating gently along Y-axis via withRepeat(withSequence(withTiming(-10), withTiming(10)), -1, true)
 * - Multi-layer radial halo & breathing biological glow
 * - Tap to trigger AI Consultant
 */
export default function BiologicalAvatarOrb({
  onPress,
  size = 72,
}: BiologicalAvatarOrbProps) {
  const translateY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Exact requested Y-axis floating loop
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(10, { duration: 1500 })
      ),
      -1,
      true
    );

    // Subtle biological breathing resonance
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200 }),
        withTiming(0.96, { duration: 2200 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1800 }),
        withTiming(0.45, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: pulseScale.value },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value * 1.15 }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      {/* Outer ambient glow halo */}
      <Animated.View
        style={[
          styles.ambientHalo,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
          },
          haloStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.35)', 'rgba(37, 99, 235, 0.05)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating 3D Core Orb */}
      <Animated.View
        style={[
          styles.coreOrb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          floatingStyle,
        ]}
      >
        <LinearGradient
          colors={['#60A5FA', '#3B82F6', '#1D4ED8']}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Specular 3D Reflection Highlight */}
        <View style={styles.specularPill} />

        {/* Center Icon */}
        <View style={styles.iconContainer}>
          <Bot size={size * 0.44} color="#FFFFFF" />
        </View>

        {/* Mini status indicator badge */}
        <View style={styles.statusBadge}>
          <Zap size={9} color="#FFFFFF" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 10,
  },
  ambientHalo: {
    position: 'absolute',
    alignSelf: 'center',
  },
  coreOrb: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  specularPill: {
    position: 'absolute',
    top: 6,
    left: 12,
    width: 24,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    transform: [{ rotate: '-25deg' }],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});


import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface GlassButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * High-Fidelity Micro-Interaction Button
 * Springs to scale 0.95 on press and releases smoothly back to 1.0
 */
export default function GlassButton({
  children,
  onPress,
  style,
  disabled = false,
}: GlassButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95, {
      damping: 12,
      stiffness: 250,
      mass: 0.8,
    });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1.0, {
      damping: 12,
      stiffness: 250,
      mass: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
});


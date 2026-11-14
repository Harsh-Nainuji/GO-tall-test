import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import GlassCard from './GlassCard';
import { colors } from '../../lib/theme';

interface SkeletonShimmerProps {
  style?: StyleProp<ViewStyle>;
  height?: number;
  borderRadius?: number;
}

export function SkeletonRow({
  style,
  height = 72,
  borderRadius = 20,
}: SkeletonShimmerProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <GlassCard style={[styles.card, { height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmerFill, animatedStyle]}>
        <View style={styles.contentRow}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textStack}>
            <View style={styles.lineLong} />
            <View style={styles.lineShort} />
          </View>
        </View>
      </Animated.View>
    </GlassCard>
  );
}

export default function SkeletonShimmer({
  height = 52,
  borderRadius = 16,
  style,
}: SkeletonShimmerProps) {
  return <SkeletonRow height={height} borderRadius={borderRadius} style={style} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonRow key={idx} style={styles.rowSpacing} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  rowSpacing: {
    marginBottom: 10,
  },
  shimmerFill: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.slate200,
  },
  textStack: {
    flex: 1,
    gap: 8,
  },
  lineLong: {
    width: '75%',
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.slate200,
  },
  lineShort: {
    width: '45%',
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.slate200,
  },
});

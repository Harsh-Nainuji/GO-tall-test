import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/theme';

export interface BarChartItem {
  day: string;
  value: number; // e.g. hours or percentage
  date?: string;
  isToday?: boolean;
}

interface GradientBarChartProps {
  data: BarChartItem[];
  maxValue?: number;
  height?: number;
  selectedIndex?: number;
  onSelectDay?: (index: number) => void;
  barGradient?: readonly [string, string];
  unit?: string;
}

function AnimatedBarColumn({
  item,
  index,
  normalizedHeight,
  isSelected,
  onPress,
  barGradient,
  height,
}: {
  item: BarChartItem;
  index: number;
  normalizedHeight: number;
  isSelected: boolean;
  onPress: () => void;
  barGradient: readonly [string, string];
  height: number;
}) {
  const animatedHeight = useSharedValue(0);

  React.useEffect(() => {
    animatedHeight.value = withDelay(
      index * 60,
      withSpring(normalizedHeight, {
        damping: 16,
        stiffness: 110,
        mass: 0.8,
      })
    );
  }, [normalizedHeight, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.columnTouchable}
    >
      <View style={[styles.columnTrack, { height }]}>
        {/* Inactive Track Background */}
        <View style={styles.inactiveTrackFill} />

        {/* Animated Gradient Active Fill */}
        <Animated.View style={[styles.barFillWrapper, barStyle]}>
          <LinearGradient
            colors={
              isSelected
                ? ['#2563EB', '#1D4ED8']
                : [barGradient[0], barGradient[1]]
            }
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.5, y: 0.0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Day label */}
      <Text
        style={[
          styles.dayLabel,
          isSelected && styles.dayLabelSelected,
          item.isToday && styles.dayLabelToday,
        ]}
      >
        {item.day}
      </Text>

      {/* Selected Indicator Dot */}
      {isSelected && <View style={styles.selectedDot} />}
    </TouchableOpacity>
  );
}

/**
 * Apple Health-Style Weekly Gradient Bar Chart
 * - Vertical columns with rounded top caps
 * - Soft cyan-to-blue or custom gradient fills
 * - Subtle inactive background tracks
 * - Staggered vertical growth animation from height 0
 * - Interactive day selection with haptic feedback
 */
export default function GradientBarChart({
  data,
  maxValue = 10,
  height = 110,
  selectedIndex = 6,
  onSelectDay,
  barGradient = ['#60A5FA', '#2563EB'],
  unit = 'h',
}: GradientBarChartProps) {
  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((item, index) => {
          const clampedValue = Math.min(maxValue, Math.max(0, item.value));
          const normalizedHeight = (clampedValue / maxValue) * (height - 12);
          const isSelected = selectedIndex === index;

          return (
            <AnimatedBarColumn
              key={`${item.day}-${index}`}
              item={item}
              index={index}
              normalizedHeight={normalizedHeight}
              isSelected={isSelected}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelectDay?.(index);
              }}
              barGradient={barGradient}
              height={height}
            />
          );
        })}
      </View>

      {/* Subtle baseline divider */}
      <View style={styles.baseline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  columnTouchable: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  columnTrack: {
    width: 22,
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  inactiveTrackFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F1F5F9',
  },
  barFillWrapper: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 8,
  },
  dayLabelSelected: {
    fontWeight: '700',
    color: colors.blue600,
  },
  dayLabelToday: {
    color: '#0F172A',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue600,
    marginTop: 3,
  },
  baseline: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
});

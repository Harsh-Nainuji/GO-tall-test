import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BiometricRulerReanimatedProps {
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  unit?: string;
  subLabel?: string;
  onValueChange?: (val: number) => void;
  width?: number;
}

const TICK_SPACING = 12; // pixels between each step (e.g. 0.5 or 1 cm)

export default function BiometricRulerReanimated({
  min = 120,
  max = 220,
  step = 1,
  initialValue = 172,
  unit = 'cm',
  subLabel = 'Current Stature',
  onValueChange,
  width: customWidth,
}: BiometricRulerReanimatedProps) {
  const screenWidth = Dimensions.get('window').width;
  const rulerWidth = customWidth || Math.min(screenWidth - 48, 380);
  const centerOffset = rulerWidth / 2;

  // Calculate total steps
  const totalSteps = Math.round((max - min) / step);

  // Initial translation to align initialValue with center indicator
  const initialStepIndex = Math.max(0, Math.min(totalSteps, (initialValue - min) / step));
  const initialX = -initialStepIndex * TICK_SPACING;

  // Shared values for 60fps gesture physics without React re-render lags
  const translateX = useSharedValue(initialX);
  const prevTranslateX = useSharedValue(initialX);
  const lastHapticValue = useSharedValue(initialValue);
  const displayValue = useSharedValue(initialValue);

  // Helper function to trigger native haptic feedback
  const triggerHaptic = useCallback((val: number) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Safe failover
      }
    }
    if (onValueChange) {
      onValueChange(val);
    }
  }, [onValueChange]);

  // React on UI thread to whole-number step crossing
  useAnimatedReaction(
    () => {
      const stepIdx = Math.round(-translateX.value / TICK_SPACING);
      const clampedIdx = Math.max(0, Math.min(totalSteps, stepIdx));
      return Math.round((min + clampedIdx * step) * 10) / 10;
    },
    (currentRounded, prevRounded) => {
      displayValue.value = currentRounded;
      if (currentRounded !== prevRounded && Math.abs(currentRounded - lastHapticValue.value) >= 1) {
        lastHapticValue.value = currentRounded;
        runOnJS(triggerHaptic)(currentRounded);
      }
    }
  );

  // Gesture handling using modern react-native-gesture-handler Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      prevTranslateX.value = translateX.value;
    })
    .onUpdate((event) => {
      const nextX = prevTranslateX.value + event.translationX;
      const minX = -totalSteps * TICK_SPACING;
      const maxX = 0;

      // Add gentle rubber-banding outside boundaries
      if (nextX > maxX) {
        translateX.value = maxX + (nextX - maxX) * 0.25;
      } else if (nextX < minX) {
        translateX.value = minX + (nextX - minX) * 0.25;
      } else {
        translateX.value = nextX;
      }
    })
    .onEnd((event) => {
      const minX = -totalSteps * TICK_SPACING;
      const maxX = 0;

      // Predict landing position with inertia velocity
      const projectedX = translateX.value + event.velocityX * 0.12;
      const stepIdx = Math.round(-projectedX / TICK_SPACING);
      const clampedStepIdx = Math.max(0, Math.min(totalSteps, stepIdx));
      const targetSnapX = -clampedStepIdx * TICK_SPACING;

      // Spring physics snap to closest whole unit
      translateX.value = withSpring(targetSnapX, {
        damping: 18,
        stiffness: 140,
        mass: 0.8,
      });

      const finalVal = Math.round((min + clampedStepIdx * step) * 10) / 10;
      runOnJS(triggerHaptic)(finalVal);
    });

  // Animated transform for ruler strip
  const animatedRulerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + centerOffset }],
    };
  });

  // Floating numeric text display (synced with React state for text node rendering)
  const [currentValState, setCurrentValState] = React.useState(initialValue);

  useAnimatedReaction(
    () => displayValue.value,
    (val) => {
      runOnJS(setCurrentValState)(val);
    }
  );

  // Generate tick markers
  const ticks = React.useMemo(() => {
    const list = [];
    for (let i = 0; i <= totalSteps; i++) {
      const val = min + i * step;
      const isMajor = val % 5 === 0;
      const isTen = val % 10 === 0;
      list.push({ index: i, value: val, isMajor, isTen });
    }
    return list;
  }, [min, totalSteps, step]);

  // Imperial sub-conversion
  const imperialFt = Math.floor(currentValState / 2.54 / 12);
  const imperialIn = Math.round((currentValState / 2.54) % 12);

  return (
    <View
      className="p-5 rounded-3xl bg-white/70 border border-white/80 shadow-md shadow-blue-900/5 my-3"
      style={[{ width: rulerWidth }]}
    >
      {/* Floating Readout Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {subLabel}
          </Text>
          <View className="flex-row items-baseline mt-0.5">
            <Text className="text-4xl font-black text-slate-900 tracking-tight">
              {currentValState.toFixed(1)}
            </Text>
            <Text className="text-sm font-bold text-blue-600 ml-1.5 uppercase">
              {unit}
            </Text>
          </View>
        </View>

        <View className="items-end bg-blue-50/80 px-3 py-1.5 rounded-2xl border border-blue-100/60">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Imperial
          </Text>
          <Text className="text-base font-black text-slate-800">
            {imperialFt}&apos;{imperialIn}&quot;
          </Text>
        </View>
      </View>

      {/* Interactive Scale Viewport */}
      <View className="h-28 mt-3 justify-center overflow-hidden relative">
        {/* Subtle Edge Fade Masks */}
        <View className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-white/90 to-transparent" />
        <View className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-white/90 to-transparent" />

        {/* Fixed Center Hairline Needle with Accent Pip */}
        <View
          style={[styles.needleContainer, { left: centerOffset - 1 }]}
          pointerEvents="none"
        >
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mb-1 shadow-sm shadow-blue-500/50" />
          <View className="w-0.5 h-16 bg-blue-600 rounded-full" />
        </View>

        {/* Gesture Controlled Sliding Ruler Strip */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.rulerContainer, animatedRulerStyle]}>
            {ticks.map((t) => {
              const tickHeight = t.isTen ? 42 : t.isMajor ? 28 : 16;
              const tickWidth = t.isTen ? 2.5 : t.isMajor ? 1.5 : 1;
              const tickColor = t.isTen
                ? '#1E293B'
                : t.isMajor
                ? '#64748B'
                : '#CBD5E1';

              return (
                <View
                  key={t.index}
                  style={[styles.tickWrapper, { width: TICK_SPACING }]}
                >
                  <View
                    style={{
                      height: tickHeight,
                      width: tickWidth,
                      backgroundColor: tickColor,
                      borderRadius: 1,
                    }}
                  />
                  {t.isMajor ? (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.tickLabel,
                        t.isTen ? styles.tickLabelTen : styles.tickLabelFive,
                      ]}
                    >
                      {t.value}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Instruction hint */}
      <View className="flex-row items-center justify-center mt-2">
        <Text className="text-[10px] font-semibold text-slate-400">
          ← Slide ruler horizontally to adjust target →
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  needleContainer: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  rulerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
    height: 90,
  },
  tickWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 70,
  },
  tickLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  tickLabelTen: {
    color: '#0F172A',
    fontWeight: '800',
  },
  tickLabelFive: {
    color: '#64748B',
  },
});


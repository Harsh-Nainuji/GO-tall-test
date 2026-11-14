import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Minus, Plus } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedTextInput = Platform.OS !== 'web' ? Animated.createAnimatedComponent(TextInput) : null;

interface BiometricRulerGlassProps {
  min?: number;
  max?: number;
  value?: number;
  initialValue?: number;
  unit?: string;
  subLabel?: string;
  step?: number;
  onValueChange?: (val: number) => void;
}

// 20px spacing gives controlled, calm, physics-weighted scrolling (same as homepage)
const TICK_SPACING = 20;

export default function BiometricRulerGlass({
  min = 120,
  max = 230,
  value,
  initialValue = 175,
  unit = 'cm',
  subLabel = 'clinical measurement',
  step = 1,
  onValueChange,
}: BiometricRulerGlassProps) {
  const effectiveInitial = value ?? initialValue;
  const clampedInitial = Math.min(max, Math.max(min, effectiveInitial));
  const totalTicks = Math.round((max - min) / step);
  const initialOffset = ((clampedInitial - min) / step) * TICK_SPACING;

  // Track actual container width dynamically for perfect subpixel center alignment
  const [containerWidth, setContainerWidth] = useState<number>(Math.max(280, SCREEN_WIDTH - 64));
  const [currentValue, setCurrentValue] = useState<number>(clampedInitial);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(initialOffset);
  const lastSnappedValue = useSharedValue(clampedInitial);
  const isInteracting = useRef(false);
  const valueRef = useRef(clampedInitial);

  const triggerHaptic = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const notifyChange = (val: number) => {
    valueRef.current = val;
    setCurrentValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const rawVal = min + (event.contentOffset.x / TICK_SPACING) * step;
      const computedValue = Math.min(
        max,
        Math.max(min, Math.round(rawVal / step) * step)
      );

      if (computedValue !== lastSnappedValue.value) {
        lastSnappedValue.value = computedValue;
        runOnJS(triggerHaptic)();
        runOnJS(notifyChange)(computedValue);
      }
    },
    onBeginDrag: () => {
      isInteracting.current = true;
    },
    onEndDrag: (event) => {
      const rawVal = min + (event.contentOffset.x / TICK_SPACING) * step;
      const computedValue = Math.min(max, Math.max(min, Math.round(rawVal / step) * step));
      runOnJS(notifyChange)(computedValue);
    },
    onMomentumEnd: (event) => {
      isInteracting.current = false;
      const rawVal = min + (event.contentOffset.x / TICK_SPACING) * step;
      const computedValue = Math.min(max, Math.max(min, Math.round(rawVal / step) * step));
      runOnJS(notifyChange)(computedValue);
    },
  });

  // UI-thread animated numeric display (does not trigger React re-renders on native)
  const animatedTextProps = useAnimatedProps(() => {
    const rawVal = min + (scrollX.value / TICK_SPACING) * step;
    const clamped = Math.min(max, Math.max(min, rawVal));
    const displayVal = clamped.toFixed(step < 1 ? 1 : 0);
    return {
      text: `${displayVal}`,
      value: `${displayVal}`,
    };
  });

  // Imperial feet & inches derived dynamically on UI thread
  const animatedImperialProps = useAnimatedProps(() => {
    const rawVal = min + (scrollX.value / TICK_SPACING) * step;
    const clamped = Math.min(max, Math.max(min, rawVal));
    const totalInches = clamped / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return {
      text: `${feet}' ${inches}"`,
      value: `${feet}' ${inches}"`,
    };
  });

  // Sync when prop value changes from outside
  useEffect(() => {
    if (value !== undefined && value !== valueRef.current) {
      const clamped = Math.min(max, Math.max(min, value));
      valueRef.current = clamped;
      lastSnappedValue.value = clamped;
      setCurrentValue(clamped);
      const nextOffset = ((clamped - min) / step) * TICK_SPACING;
      scrollX.value = nextOffset;
      scrollRef.current?.scrollTo({
        x: nextOffset,
        y: 0,
        animated: true,
      });
    }
  }, [value, min, step]);

  // Initial alignment on mount or when container width is calculated
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetVal = value !== undefined ? value : clampedInitial;
      const offset = ((targetVal - min) / step) * TICK_SPACING;
      scrollX.value = offset;
      lastSnappedValue.value = targetVal;
      scrollRef.current?.scrollTo({
        x: offset,
        y: 0,
        animated: false,
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [min, max, containerWidth]);

  const handleStepDelta = (delta: number) => {
    const current = lastSnappedValue.value;
    const next = Math.min(max, Math.max(min, current + delta));
    const nextOffset = ((next - min) / step) * TICK_SPACING;
    scrollX.value = nextOffset;
    lastSnappedValue.value = next;
    scrollRef.current?.scrollTo({
      x: nextOffset,
      y: 0,
      animated: true,
    });
    notifyChange(next);
    triggerHaptic();
  };

  // Generate tick markers array
  const ticks = useMemo(() => {
    const items = [];
    for (let i = 0; i <= totalTicks; i++) {
      const val = min + i * step;
      const isTen = val % 10 === 0;
      const isFive = val % 5 === 0 && !isTen;
      items.push({
        value: val,
        isTen,
        isFive,
      });
    }
    return items;
  }, [min, totalTicks, step]);

  const currentImperial = useMemo(() => {
    const totalInches = currentValue / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  }, [currentValue]);

  // Mathematical center alignment:
  // Container needle is at containerWidth / 2.
  // Each tick line is centered within its tickWrapper (at TICK_SPACING / 2 = 10px).
  // Therefore, for tick `i` to align with the needle at offset = i * TICK_SPACING,
  // paddingHorizontal must be: (containerWidth / 2) - (TICK_SPACING / 2)
  const horizontalPadding = Math.max(0, containerWidth / 2 - TICK_SPACING / 2);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Floating Measurement Header */}
      <View style={styles.numberDisplayContainer}>
        <View style={styles.numberRow}>
          {/* Fine Tuning Decrement Button */}
          <TouchableOpacity
            onPress={() => handleStepDelta(-1)}
            style={styles.stepButton}
            activeOpacity={0.7}
            accessibilityLabel="Decrease value"
          >
            <Minus size={18} color="#0284C7" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.centerValueBlock}>
            <View style={styles.primaryValueRow}>
              {Platform.OS === 'web' || !AnimatedTextInput ? (
                <Text style={styles.primaryNumberText}>
                  {currentValue.toFixed(step < 1 ? 1 : 0)}
                </Text>
              ) : (
                <AnimatedTextInput
                  underlineColorAndroid="transparent"
                  editable={false}
                  style={styles.primaryNumberText}
                  animatedProps={animatedTextProps}
                  defaultValue={`${currentValue.toFixed(step < 1 ? 1 : 0)}`}
                />
              )}
              <Text style={styles.unitText}>{unit}</Text>
            </View>

            {/* Imperial subtitle display */}
            <View style={styles.imperialRow}>
              {Platform.OS === 'web' || !AnimatedTextInput ? (
                <Text style={styles.imperialText}>{currentImperial}</Text>
              ) : (
                <AnimatedTextInput
                  underlineColorAndroid="transparent"
                  editable={false}
                  style={styles.imperialText}
                  animatedProps={animatedImperialProps}
                  defaultValue={currentImperial}
                />
              )}
              <Text style={styles.imperialSublabel}>• {subLabel}</Text>
            </View>
          </View>

          {/* Fine Tuning Increment Button */}
          <TouchableOpacity
            onPress={() => handleStepDelta(1)}
            style={styles.stepButton}
            activeOpacity={0.7}
            accessibilityLabel="Increase value"
          >
            <Plus size={18} color="#0284C7" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Fixed Cursor Needle with Glowing Cyan Tip */}
      <View pointerEvents="none" style={styles.needleContainer}>
        <View style={styles.needleTip} />
        <View style={styles.needleLine} />
      </View>

      {/* Reanimated Horizontal Scrollable Scale */}
      <View style={styles.rulerTrackFrame}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_SPACING}
          decelerationRate="fast"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {ticks.map((tick) => (
            <View key={tick.value} style={styles.tickWrapper}>
              <View
                style={[
                  styles.tickLine,
                  tick.isTen
                    ? styles.tickTen
                    : tick.isFive
                    ? styles.tickFive
                    : styles.tickSingle,
                ]}
              />
              {tick.isTen && (
                <Text style={styles.tickLabel}>{tick.value}</Text>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  numberDisplayContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValueBlock: {
    alignItems: 'center',
  },
  primaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  primaryNumberText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    minWidth: 120,
  },
  unitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  imperialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  imperialText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    padding: 0,
    margin: 0,
  },
  imperialSublabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  needleContainer: {
    alignItems: 'center',
    zIndex: 20,
    marginTop: 4,
    marginBottom: -4,
  },
  needleTip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginBottom: -2,
  },
  needleLine: {
    width: 2.5,
    height: 32,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  rulerTrackFrame: {
    width: '100%',
    height: 78,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    marginTop: 2,
  },
  scrollContent: {
    alignItems: 'flex-start',
    height: 78,
    paddingTop: 8,
  },
  tickWrapper: {
    width: TICK_SPACING,
    alignItems: 'center',
  },
  tickLine: {
    width: 2,
    borderRadius: 1,
  },
  tickSingle: {
    height: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
  },
  tickFive: {
    height: 24,
    backgroundColor: '#0284C7',
    width: 2,
  },
  tickTen: {
    height: 36,
    backgroundColor: '#0F172A',
    width: 2.5,
  },
  tickLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginTop: 6,
    position: 'absolute',
    top: 40,
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'center',
  },
});

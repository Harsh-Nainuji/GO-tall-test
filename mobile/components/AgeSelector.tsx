import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Minus, Plus, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedTextInput = Platform.OS !== 'web' ? Animated.createAnimatedComponent(TextInput) : null;

interface AgeSelectorProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const AGE_TICK_SPACING = 32; // Generous 32px per year mark for a real school ruler feel
const HALF_WIDTH = SCREEN_WIDTH / 2;

/**
 * Authentic School Ruler Age Selector
 * Displays the large selected age prominently with an authentic school ruler scale underneath.
 * Features millimeter sub-ticks, center cursor needle, and tactile haptic feedback.
 */
export default function AgeSelector({
  value = 17,
  onChange,
  min = 10,
  max = 26,
}: AgeSelectorProps) {
  // Track container width for exact subpixel center needle alignment
  const [containerWidth, setContainerWidth] = useState<number>(Math.max(280, SCREEN_WIDTH - 64));
  const scrollRef = useRef<Animated.ScrollView>(null);
  const clampedValue = Math.min(max, Math.max(min, value));
  const initialOffset = (clampedValue - min) * AGE_TICK_SPACING;

  const scrollX = useSharedValue(initialOffset);
  const lastSnappedValue = useSharedValue(clampedValue);
  const isDragging = useRef(false);

  const triggerHaptic = () => {
    Haptics.selectionAsync().catch(() => { });
  };

  const notifyChange = (newVal: number) => {
    onChange(newVal);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const rawVal = min + event.contentOffset.x / AGE_TICK_SPACING;
      const computedValue = Math.min(max, Math.max(min, Math.round(rawVal)));

      if (computedValue !== lastSnappedValue.value) {
        lastSnappedValue.value = computedValue;
        runOnJS(triggerHaptic)();
        if (Platform.OS === 'web') {
          runOnJS(notifyChange)(computedValue);
        }
      }
    },
    onBeginDrag: () => {
      isDragging.current = true;
    },
    onEndDrag: (event) => {
      const rawVal = min + event.contentOffset.x / AGE_TICK_SPACING;
      const computedValue = Math.min(max, Math.max(min, Math.round(rawVal)));
      runOnJS(notifyChange)(computedValue);
    },
    onMomentumEnd: (event) => {
      isDragging.current = false;
      const rawVal = min + event.contentOffset.x / AGE_TICK_SPACING;
      const computedValue = Math.min(max, Math.max(min, Math.round(rawVal)));
      runOnJS(notifyChange)(computedValue);
    },
  });

  // UI-thread animated number display
  const animatedNumberProps = useAnimatedProps(() => {
    const rawVal = min + scrollX.value / AGE_TICK_SPACING;
    const clamped = Math.min(max, Math.max(min, Math.round(rawVal)));
    return {
      text: `${clamped}`,
      value: `${clamped}`,
    };
  });

  // Keep scroll aligned if external value changes while not dragging
  useEffect(() => {
    if (!isDragging.current) {
      const targetOffset = (value - min) * AGE_TICK_SPACING;
      scrollX.value = targetOffset;
      lastSnappedValue.value = value;
      scrollRef.current?.scrollTo({
        x: targetOffset,
        y: 0,
        animated: true,
      });
    }
  }, [value, min]);

  // Initial alignment on mount or when container width is determined
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetOffset = (clampedValue - min) * AGE_TICK_SPACING;
      scrollX.value = targetOffset;
      lastSnappedValue.value = clampedValue;
      scrollRef.current?.scrollTo({
        x: targetOffset,
        y: 0,
        animated: false,
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [containerWidth, min]);

  const handleStepDelta = (delta: number) => {
    const current = lastSnappedValue.value;
    const next = Math.min(max, Math.max(min, current + delta));
    const nextOffset = (next - min) * AGE_TICK_SPACING;
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

  // Generate ruler marks with school ruler sub-ticks (half-year marks)
  const years = React.useMemo(() => {
    const list = [];
    for (let a = min; a <= max; a++) {
      list.push({ age: a, isYear: true });
    }
    return list;
  }, [min, max]);

  const getClinicalBadge = (ageVal: number) => {
    if (ageVal < 18) {
      return {
        label: 'Active Epiphyseal Window',
        sub: 'High chondrocyte growth velocity',
        color: '#0284C7',
      };
    }
    if (ageVal <= 21) {
      return {
        label: 'Terminal Ossification Phase',
        sub: 'Vertebral & spinal decompression potential',
        color: '#10B981',
      };
    }
    return {
      label: 'Plate Maturation & Posture',
      sub: 'Axial disc rehydration (+1.0–2.5 cm)',
      color: '#8B5CF6',
    };
  };

  const status = getClinicalBadge(clampedValue);

  // Exact subpixel center alignment:
  // Needle is at containerWidth / 2.
  // Major tick line is centered within yearSlot (at AGE_TICK_SPACING / 2 = 16px).
  // For year `a` to align with the needle when offset = (a - min) * AGE_TICK_SPACING,
  // paddingHorizontal must be: (containerWidth / 2) - (AGE_TICK_SPACING / 2)
  const horizontalPadding = Math.max(0, containerWidth / 2 - AGE_TICK_SPACING / 2);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* 1. Large Prominent Age Display with Fine-Tuning Touch Buttons */}
      <View style={styles.numberRow}>
        <TouchableOpacity
          onPress={() => handleStepDelta(-1)}
          style={styles.stepButton}
          activeOpacity={0.7}
          accessibilityLabel="Decrease age"
        >
          <Minus size={18} color="#0284C7" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.centerReadout}>
          <View style={styles.readoutRow}>
            {Platform.OS === 'web' || !AnimatedTextInput ? (
              <Text style={styles.bigNumberText}>{clampedValue}</Text>
            ) : (
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                style={styles.bigNumberText}
                animatedProps={animatedNumberProps}
                defaultValue={`${clampedValue}`}
              />
            )}
            <Text style={styles.yearsUnitText}>Years Old</Text>
          </View>

          <View style={styles.statusPill}>
            <Sparkles size={11} color={status.color} />
            <Text style={[styles.statusPillText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleStepDelta(1)}
          style={styles.stepButton}
          activeOpacity={0.7}
          accessibilityLabel="Increase age"
        >
          <Plus size={18} color="#0284C7" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 2. School Ruler Scale Indicator Cursor */}
      <View pointerEvents="none" style={styles.needleContainer}>
        <View style={styles.needleTip} />
        <View style={styles.needleLine} />
      </View>

      {/* 3. Horizontal Physical School Ruler */}
      <View style={styles.rulerFrame}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={AGE_TICK_SPACING}
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
          {years.map((item, idx) => (
            <View key={item.age} style={styles.yearSlot}>
              {/* Main Year Tick Mark */}
              <View style={styles.majorTick} />

              {/* Sub-tick (half-year mark like a school ruler) */}
              {idx < years.length - 1 && (
                <View style={styles.subTickSlot}>
                  <View style={styles.minorTick} />
                </View>
              )}

              {/* Number Label */}
              <Text
                style={[
                  styles.yearLabel,
                  item.age === clampedValue && styles.yearLabelActive,
                ]}
              >
                {item.age}
              </Text>
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
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
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  centerReadout: {
    alignItems: 'center',
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bigNumberText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.5,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    minWidth: 70,
  },
  yearsUnitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(240, 249, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.9)',
    marginTop: 2,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  needleContainer: {
    alignItems: 'center',
    zIndex: 20,
    marginTop: 6,
    marginBottom: -4,
  },
  needleTip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginBottom: -2,
    shadowColor: '#0284C7',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  needleLine: {
    width: 2.5,
    height: 26,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  rulerFrame: {
    width: '100%',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    marginTop: 4,
  },
  scrollContent: {
    alignItems: 'flex-start',
    height: 64,
    paddingTop: 8,
  },
  yearSlot: {
    width: AGE_TICK_SPACING,
    alignItems: 'center',
    position: 'relative',
  },
  majorTick: {
    width: 2.5,
    height: 24,
    backgroundColor: '#0F172A',
    borderRadius: 1.5,
  },
  subTickSlot: {
    position: 'absolute',
    left: AGE_TICK_SPACING / 2,
    top: 0,
    width: AGE_TICK_SPACING / 2,
    alignItems: 'center',
  },
  minorTick: {
    width: 1.5,
    height: 14,
    backgroundColor: 'rgba(100, 116, 139, 0.6)',
    borderRadius: 1,
  },
  yearLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  yearLabelActive: {
    color: '#0284C7',
    fontWeight: '900',
    fontSize: 12,
  },
});

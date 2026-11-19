import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;

interface WheelColumnProps<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  labelFormat?: (item: T) => string;
  width?: number;
}

function WheelColumn<T>({
  items,
  selectedIndex,
  onSelect,
  labelFormat = (item) => String(item),
  width = 70,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const lastIndex = useRef(selectedIndex);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    if (clampedIndex !== lastIndex.current) {
      lastIndex.current = clampedIndex;
      Haptics.selectionAsync().catch(() => {});
      onSelect(clampedIndex);
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
  };

  return (
    <View style={[styles.columnWrapper, { width }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.85}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const isAdjacent = Math.abs(idx - selectedIndex) === 1;

          return (
            <View key={idx} style={styles.itemContainer}>
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.itemTextSelected,
                  isAdjacent && styles.itemTextAdjacent,
                  !isSelected && !isAdjacent && styles.itemTextFar,
                ]}
              >
                {labelFormat(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export interface WheelTimeValue {
  hours: number; // 1-12
  minutes: number; // 0-59 (typically steps of 5 or 15)
  period: 'AM' | 'PM';
}

interface WheelTimePickerProps {
  value: WheelTimeValue;
  onChange: (value: WheelTimeValue) => void;
  minuteStep?: number;
}

/**
 * Apple-Grade Vertical Scrolling Wheel Time Selector
 * - 3 Visible Levels: Center selected (bold 24px, 1.0 opacity), previous & next faded (0.30 opacity)
 * - Snaps naturally into center with tactile haptic feedback
 * - Supports 12-hour format with AM/PM column
 */
export default function WheelTimePicker({
  value,
  onChange,
  minuteStep = 15,
}: WheelTimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => i * minuteStep
  );
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  const hourIndex = Math.max(0, hours.indexOf(value.hours));
  const minuteIndex = Math.max(0, minutes.indexOf(value.minutes));
  const periodIndex = Math.max(0, periods.indexOf(value.period));

  return (
    <View style={styles.pickerContainer}>
      {/* Selection Center Highlight Bar */}
      <View pointerEvents="none" style={styles.selectionHighlight}>
        <View style={styles.highlightLineTop} />
        <View style={styles.highlightLineBottom} />
      </View>

      {/* Columns Row */}
      <View style={styles.columnsRow}>
        {/* Hours Column */}
        <WheelColumn
          items={hours}
          selectedIndex={hourIndex}
          onSelect={(idx) => onChange({ ...value, hours: hours[idx] })}
          labelFormat={(h) => String(h).padStart(2, '0')}
          width={65}
        />

        <Text style={styles.colonSeparator}>:</Text>

        {/* Minutes Column */}
        <WheelColumn
          items={minutes}
          selectedIndex={minuteIndex}
          onSelect={(idx) => onChange({ ...value, minutes: minutes[idx] })}
          labelFormat={(m) => String(m).padStart(2, '0')}
          width={65}
        />

        {/* AM / PM Column */}
        <WheelColumn
          items={periods}
          selectedIndex={periodIndex}
          onSelect={(idx) => onChange({ ...value, period: periods[idx] })}
          width={60}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    top: ITEM_HEIGHT,
    backgroundColor: 'rgba(239, 246, 255, 0.45)',
    justifyContent: 'space-between',
  },
  highlightLineTop: {
    height: 1,
    backgroundColor: '#BFDBFE',
  },
  highlightLineBottom: {
    height: 1,
    backgroundColor: '#BFDBFE',
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnWrapper: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94A3B8',
    fontVariant: ['tabular-nums'],
  },
  itemTextSelected: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    transform: [{ scale: 1.08 }],
  },
  itemTextAdjacent: {
    fontSize: 17,
    fontWeight: '500',
    color: '#64748B',
    opacity: 0.35,
    transform: [{ scale: 0.9 }],
  },
  itemTextFar: {
    opacity: 0.1,
  },
  colonSeparator: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 4,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
});

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
  hours: number; // 1-12 in 12h mode, 0-23 in 24h mode
  minutes: number; // 0-59
  period?: 'AM' | 'PM';
  is24Hour?: boolean;
}

interface WheelTimePickerProps {
  value: WheelTimeValue;
  onChange: (value: WheelTimeValue) => void;
  is24Hour?: boolean;
  onToggleFormat?: (is24Hour: boolean) => void;
}

/**
 * Apple-Grade Vertical Scrolling Wheel Time Selector
 * - 3 Visible Levels: Center selected (bold 24px, 1.0 opacity), previous & next faded (0.30 opacity)
 * - Snaps naturally into center with tactile haptic feedback
 * - Supports both 12-hour (1-12 AM/PM) and 24-hour (00-23) modes with full 0-59 minute liberty
 */
export default function WheelTimePicker({
  value,
  onChange,
  is24Hour = false,
  onToggleFormat,
}: WheelTimePickerProps) {
  // Hours: 1-12 for 12h mode, 0-23 for 24h mode
  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  const hours = is24Hour ? hours24 : hours12;

  // Full 0-59 minutes
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  const normalizedHour = is24Hour
    ? Math.max(0, Math.min(23, value.hours))
    : Math.max(1, Math.min(12, value.hours % 12 || 12));

  const hourIndex = Math.max(0, hours.indexOf(normalizedHour));
  const minuteIndex = Math.max(0, Math.min(59, value.minutes));
  const currentPeriod = value.period || 'PM';
  const periodIndex = Math.max(0, periods.indexOf(currentPeriod));

  return (
    <View style={styles.pickerWrapper}>
      {/* 12h vs 24h format switcher */}
      {onToggleFormat && (
        <View style={styles.formatSwitcherRow}>
          <View style={styles.formatToggleContainer}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onToggleFormat(false);
              }}
              style={[
                styles.formatBtn,
                !is24Hour && styles.formatBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.formatBtnText,
                  !is24Hour && styles.formatBtnTextActive,
                ]}
              >
                12-Hour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onToggleFormat(true);
              }}
              style={[
                styles.formatBtn,
                is24Hour && styles.formatBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.formatBtnText,
                  is24Hour && styles.formatBtnTextActive,
                ]}
              >
                24-Hour
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            width={is24Hour ? 85 : 68}
          />

          <Text style={styles.colonSeparator}>:</Text>

          {/* Minutes Column (Full 0-59 liberty) */}
          <WheelColumn
            items={minutes}
            selectedIndex={minuteIndex}
            onSelect={(idx) => onChange({ ...value, minutes: minutes[idx] })}
            labelFormat={(m) => String(m).padStart(2, '0')}
            width={is24Hour ? 85 : 68}
          />

          {/* AM / PM Column (only in 12h mode) */}
          {!is24Hour && (
            <WheelColumn
              items={periods}
              selectedIndex={periodIndex}
              onSelect={(idx) => onChange({ ...value, period: periods[idx] })}
              width={64}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    gap: 8,
  },
  formatSwitcherRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  formatToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9,
  },
  formatBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  formatBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  formatBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
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

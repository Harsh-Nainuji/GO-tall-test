import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Minus, Plus } from 'lucide-react-native';
import { cmToFtIn } from '../lib/growth-calc';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ITEM_HEIGHT = 16; // height in px per 1 cm increment
const MIN_CM = 120;
const MAX_CM = 225;
const TOTAL_STEPS = MAX_CM - MIN_CM + 1;

interface VerticalBiometricRulerProps {
  initialValue?: number; // in cm
  onValueChange: (cm: number) => void;
  accentColor?: string;
  sublabel?: string;
}

export default function VerticalBiometricRuler({
  initialValue = 175,
  onValueChange,
  accentColor = '#22C55E',
  sublabel = 'Stature Measurement',
}: VerticalBiometricRulerProps) {
  const [currentCm, setCurrentCm] = useState<number>(initialValue);
  const [unit, setUnit] = useState<'ft' | 'cm'>('ft');
  const scrollRef = useRef<any>(null);
  const isUserScrolling = useRef(false);

  // Convert cm to feet & inches
  const ft = Math.floor(currentCm / 30.48);
  const totalInches = Math.round(currentCm / 2.54);
  const inches = Math.round(totalInches % 12);

  // Scroll to initial value on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollIndex = MAX_CM - initialValue;
      scrollRef.current?.scrollTo({
        y: scrollIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const offsetIndex = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(TOTAL_STEPS - 1, offsetIndex));
    const calculatedCm = MAX_CM - clampedIndex;

    if (calculatedCm !== currentCm && calculatedCm >= MIN_CM && calculatedCm <= MAX_CM) {
      setCurrentCm(calculatedCm);
      onValueChange(calculatedCm);
      if (calculatedCm % 5 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  };

  const adjustCm = (delta: number) => {
    const nextCm = Math.max(MIN_CM, Math.min(MAX_CM, currentCm + delta));
    if (nextCm !== currentCm) {
      setCurrentCm(nextCm);
      onValueChange(nextCm);
      Haptics.selectionAsync().catch(() => {});
      const scrollIndex = MAX_CM - nextCm;
      scrollRef.current?.scrollTo({
        y: scrollIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Ruler View: Left Number Display + Right Vertical Tick Marks */}
      <View style={styles.mainRow}>
        {/* Left Side: Large Bold Numerical Height Display */}
        <View style={styles.leftDisplay}>
          {unit === 'ft' ? (
            <View style={styles.ftRow}>
              <View style={styles.unitBlock}>
                <Text style={styles.largeNumber}>{ft}</Text>
                <Text style={styles.unitLabel}>ft</Text>
              </View>
              <View style={[styles.unitBlock, { marginLeft: 24 }]}>
                <Text style={styles.largeNumber}>{inches}</Text>
                <Text style={styles.unitLabel}>in</Text>
              </View>
            </View>
          ) : (
            <View style={styles.cmRow}>
              <Text style={styles.largeNumber}>{currentCm}</Text>
              <Text style={styles.unitLabel}>cm</Text>
            </View>
          )}

          <Text style={styles.subtext}>
            {unit === 'ft' ? `${currentCm} cm equivalent` : `${ft} ft ${inches} in equivalent`}
          </Text>

          {/* Micro Adjustment Stepper Buttons */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => adjustCm(-1)}
              activeOpacity={0.7}
            >
              <Minus size={16} color="#475569" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>{currentCm} cm</Text>
            </View>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => adjustCm(1)}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#475569" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Vertical Ruler Ticks */}
        <View style={styles.rightRulerWrapper}>
          {/* Active Center Indicator Line */}
          <View style={[styles.activeIndicatorLine, { backgroundColor: accentColor }]}>
            <View style={[styles.activeLinePointer, { borderLeftColor: accentColor }]} />
          </View>

          {/* Scrollable Ruler Column */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.rulerScrollContent}
          >
            {/* Array from MAX_CM down to MIN_CM */}
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const cmValue = MAX_CM - i;
              const isFootMark = cmValue % 30 === 0; // ~every foot
              const isTenCm = cmValue % 10 === 0;
              const isFiveCm = cmValue % 5 === 0;

              // Calculate approximate foot number for major marks
              const footNumber = Math.round(cmValue / 30.48);

              return (
                <View key={cmValue} style={styles.tickRow}>
                  {isTenCm && (
                    <Text style={styles.rulerNumber}>
                      {unit === 'ft' ? (isFootMark ? footNumber : '') : cmValue}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.tickMark,
                      isTenCm
                        ? styles.tickMajor
                        : isFiveCm
                        ? styles.tickMedium
                        : styles.tickSmall,
                    ]}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Unit Switcher: Ft <-> Cm */}
      <View style={styles.bottomUnitRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setUnit('ft');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.unitToggleText, unit === 'ft' && styles.unitToggleTextActive]}>
            Ft
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleSwitchTrack,
            unit === 'cm' && styles.toggleSwitchTrackActive,
          ]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setUnit(unit === 'ft' ? 'cm' : 'ft');
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.toggleSwitchThumb,
              unit === 'cm' ? styles.toggleSwitchThumbRight : styles.toggleSwitchThumbLeft,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setUnit('cm');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.unitToggleText, unit === 'cm' && styles.unitToggleTextActive]}>
            Cm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 280,
  },
  leftDisplay: {
    flex: 1.4,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  ftRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  largeNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    lineHeight: 62,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 2,
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    fontVariant: ['tabular-nums'],
  },
  rightRulerWrapper: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  activeIndicatorLine: {
    position: 'absolute',
    left: 20,
    right: 0,
    top: '50%',
    marginTop: -1.5,
    height: 3,
    borderRadius: 2,
    zIndex: 10,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  activeLinePointer: {
    position: 'absolute',
    left: -4,
    top: -3.5,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  rulerScrollContent: {
    paddingVertical: 140 - ITEM_HEIGHT / 2, // centers the selected item
  },
  tickRow: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 6,
  },
  rulerNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    marginRight: 12,
    fontVariant: ['tabular-nums'],
  },
  tickMark: {
    height: 1.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  tickMajor: {
    width: 32,
    height: 2.5,
    backgroundColor: '#64748B',
  },
  tickMedium: {
    width: 20,
    height: 1.5,
    backgroundColor: '#94A3B8',
  },
  tickSmall: {
    width: 12,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  bottomUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  unitToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  unitToggleTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  toggleSwitchTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchTrackActive: {
    backgroundColor: '#22C55E',
  },
  toggleSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleSwitchThumbLeft: {
    alignSelf: 'flex-start',
  },
  toggleSwitchThumbRight: {
    alignSelf: 'flex-end',
  },
});

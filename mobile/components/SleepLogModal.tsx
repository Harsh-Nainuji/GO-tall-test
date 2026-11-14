// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Moon, Sparkles, Check } from 'lucide-react-native';
import BottomSheet from './ui/BottomSheet';
import { useAppStore } from '../lib/store';
import { colors } from '../lib/theme';
import { haptics } from '../lib/animations';

interface SleepLogModalProps {
  visible: boolean;
  onClose: () => void;
}

const BEDTIME_OPTIONS = [
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
  '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM',
];

const WAKE_OPTIONS = [
  '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM',
  '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM',
];

const DIRECT_HOURS_PRESETS = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

const SLEEP_QUALITIES = [
  {
    id: 'Deep Restorative',
    label: 'Deep sleep',
    desc: 'Woke up feeling energized and fresh',
    icon: '✨',
  },
  {
    id: 'Normal Rest',
    label: 'Normal sleep',
    desc: 'Standard rest through the night',
    icon: '🌙',
  },
  {
    id: 'Light / Interrupted',
    label: 'Light sleep',
    desc: 'Woke up multiple times during night',
    icon: '😴',
  },
];

function parseTimeTo24hDecimal(timeStr: string): number {
  const [timePart, modifier] = timeStr.trim().split(' ');
  const [hourStr, minStr] = timePart.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours + minutes / 60;
}

export function calculateSleepDuration(bedtimeStr: string, wakeStr: string): number {
  const bed = parseTimeTo24hDecimal(bedtimeStr);
  const wake = parseTimeTo24hDecimal(wakeStr);

  const duration = (wake - bed + 24) % 24;
  return Math.round(duration * 100) / 100;
}

export default function SleepLogModal({ visible, onClose }: SleepLogModalProps) {
  const addSleepLog = useAppStore((state) => state.addSleepLog);
  const sleepTargetHours = useAppStore((state) => state.sleepTargetHours);

  const [inputMode, setInputMode] = useState<'times' | 'direct'>('times');
  const [selectedBedtime, setSelectedBedtime] = useState<string>('10:30 PM');
  const [selectedWakeup, setSelectedWakeup] = useState<string>('07:00 AM');
  const [directHours, setDirectHours] = useState<number>(8.5);
  const [selectedQuality, setSelectedQuality] = useState<string>('Deep Restorative');

  const calculatedHours =
    inputMode === 'times'
      ? calculateSleepDuration(selectedBedtime, selectedWakeup)
      : directHours;

  const handleSave = () => {
    haptics.success();

    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];
    const dateStr = now.toISOString().split('T')[0];

    addSleepLog({
      date: dateStr,
      dayOfWeek: currentDay,
      bedtime: inputMode === 'times' ? selectedBedtime : undefined,
      wakeupTime: inputMode === 'times' ? selectedWakeup : undefined,
      hours: calculatedHours,
      quality: selectedQuality,
    });

    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Log your sleep"
      subtitle="Track your sleep to support natural height growth"
      footer={
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          style={styles.saveBtn}
          accessibilityLabel="Save sleep entry"
          accessibilityRole="button"
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save sleep log</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.container}>
        {/* Mode Selector */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              haptics.selection();
              setInputMode('times');
            }}
            style={[styles.tabBtn, inputMode === 'times' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, inputMode === 'times' && styles.tabTextActive]}>
              Bed & Wake time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              haptics.selection();
              setInputMode('direct');
            }}
            style={[styles.tabBtn, inputMode === 'direct' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, inputMode === 'direct' && styles.tabTextActive]}>
              Total hours
            </Text>
          </TouchableOpacity>
        </View>

        {inputMode === 'times' ? (
          <View style={styles.sectionWrap}>
            {/* Bedtime */}
            <Text style={styles.sectionLabel}>Bedtime</Text>
            <View style={styles.chipsRow}>
              {BEDTIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    haptics.selection();
                    setSelectedBedtime(time);
                  }}
                  style={[
                    styles.chip,
                    selectedBedtime === time && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedBedtime === time && styles.chipTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Wake Time */}
            <Text style={styles.sectionLabel}>Wake time</Text>
            <View style={styles.chipsRow}>
              {WAKE_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    haptics.selection();
                    setSelectedWakeup(time);
                  }}
                  style={[
                    styles.chip,
                    selectedWakeup === time && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedWakeup === time && styles.chipTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>Select hours</Text>
            <View style={styles.chipsRow}>
              {DIRECT_HOURS_PRESETS.map((hrs) => (
                <TouchableOpacity
                  key={hrs}
                  onPress={() => {
                    haptics.selection();
                    setDirectHours(hrs);
                  }}
                  style={[
                    styles.chip,
                    directHours === hrs && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      directHours === hrs && styles.chipTextActive,
                    ]}
                  >
                    {hrs}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Calculated summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHours}>{calculatedHours} Hours</Text>
          <Text style={styles.summaryGoal}>
            {calculatedHours >= sleepTargetHours
              ? 'Goal reached ✓'
              : `${(sleepTargetHours - calculatedHours).toFixed(1)}h under goal`}
          </Text>
        </View>

        {/* Sleep Quality */}
        <Text style={styles.sectionLabel}>Sleep quality</Text>
        <View style={styles.qualityList}>
          {SLEEP_QUALITIES.map((q) => (
            <TouchableOpacity
              key={q.id}
              activeOpacity={0.7}
              onPress={() => {
                haptics.selection();
                setSelectedQuality(q.id);
              }}
              style={[
                styles.qualityItem,
                selectedQuality === q.id && styles.qualityItemActive,
              ]}
            >
              <Text style={styles.qualityIcon}>{q.icon}</Text>
              <View style={styles.qualityTextCol}>
                <Text
                  style={[
                    styles.qualityTitle,
                    selectedQuality === q.id && styles.qualityTitleActive,
                  ]}
                >
                  {q.label}
                </Text>
                <Text style={styles.qualityDesc}>{q.desc}</Text>
              </View>
              {selectedQuality === q.id && (
                <View style={styles.checkIcon}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.slate100,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate400,
  },
  tabTextActive: {
    color: colors.blue600,
    fontWeight: '700',
  },
  sectionWrap: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  chipActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue600,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
  },
  chipTextActive: {
    color: colors.blue600,
    fontWeight: '700',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    gap: 2,
  },
  summaryHours: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.blue600,
  },
  summaryGoal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
  },
  qualityList: {
    gap: 8,
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  qualityItemActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue600,
  },
  qualityIcon: {
    fontSize: 20,
  },
  qualityTextCol: {
    flex: 1,
  },
  qualityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate900,
  },
  qualityTitleActive: {
    color: colors.blue600,
  },
  qualityDesc: {
    fontSize: 11,
    color: colors.slate400,
    marginTop: 2,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: 48,
    backgroundColor: colors.purple600,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

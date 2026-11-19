import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Moon, Sunrise, Sparkles, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import WheelTimePicker, { WheelTimeValue } from './WheelTimePicker';
import GlassCard from './ui/GlassCard';
import GlassButton from './GlassButton';
import { useAppStore } from '../lib/store';
import { colors } from '../lib/theme';

interface SleepSchedulerModalProps {
  visible: boolean;
  onClose: () => void;
}

function timeValueToMinutes(t: WheelTimeValue): number {
  let h = t.hours % 12;
  if (t.period === 'PM') h += 12;
  return h * 60 + t.minutes;
}

function formatTimeValue(t: WheelTimeValue): string {
  const h = String(t.hours).padStart(2, '0');
  const m = String(t.minutes).padStart(2, '0');
  return `${h}:${m} ${t.period}`;
}

export default function SleepSchedulerModal({
  visible,
  onClose,
}: SleepSchedulerModalProps) {
  const addSleepLog = useAppStore((state) => state.addSleepLog);
  const setSleepTargetHours = useAppStore((state) => state.setSleepTargetHours);

  const [activeTab, setActiveTab] = useState<'bedtime' | 'wakeup'>('bedtime');
  const [bedtime, setBedtime] = useState<WheelTimeValue>({
    hours: 10,
    minutes: 30,
    period: 'PM',
  });
  const [wakeup, setWakeup] = useState<WheelTimeValue>({
    hours: 7,
    minutes: 0,
    period: 'AM',
  });
  const [quality, setQuality] = useState<'Deep Restorative' | 'Normal Rest' | 'Light / Interrupted'>('Deep Restorative');

  // Calculate duration across midnight
  const { totalHours, hoursPart, minutesPart, isOptimalHgh } = useMemo(() => {
    const bedMin = timeValueToMinutes(bedtime);
    const wakeMin = timeValueToMinutes(wakeup);

    let diffMin = wakeMin - bedMin;
    if (diffMin <= 0) {
      diffMin += 1440; // overnight midnight wrap
    }

    const hours = diffMin / 60;
    const hPart = Math.floor(diffMin / 60);
    const mPart = diffMin % 60;

    // Check if bedtime is within prime hGH window (09:30 PM - 11:30 PM) and duration >= 8h
    const isOptimal =
      (bedtime.period === 'PM' && (bedtime.hours >= 9 && bedtime.hours <= 11)) &&
      hours >= 7.5;

    return {
      totalHours: Math.round(hours * 10) / 10,
      hoursPart: hPart,
      minutesPart: mPart,
      isOptimalHgh: isOptimal,
    };
  }, [bedtime, wakeup]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Save sleep target in hours
    setSleepTargetHours(totalHours);

    // Record sleep log for today
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = now.toISOString().split('T')[0];

    addSleepLog({
      date: dateStr,
      dayOfWeek,
      hours: totalHours,
      quality,
      bedtime: formatTimeValue(bedtime),
      wakeupTime: formatTimeValue(wakeup),
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <GlassCard style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconCircle}>
                <Moon size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.titleText}>Sleep Scheduler</Text>
                <Text style={styles.subtitleText}>Vertical wheel circadian setup</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Bedtime / Wake-up Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveTab('bedtime');
                }}
                style={[styles.tabBtn, activeTab === 'bedtime' && styles.tabBtnActive]}
              >
                <Moon size={14} color={activeTab === 'bedtime' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'bedtime' && styles.tabBtnTextActive]}>
                  Bedtime: {formatTimeValue(bedtime)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveTab('wakeup');
                }}
                style={[styles.tabBtn, activeTab === 'wakeup' && styles.tabBtnActive]}
              >
                <Sunrise size={14} color={activeTab === 'wakeup' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.tabBtnText, activeTab === 'wakeup' && styles.tabBtnTextActive]}>
                  Wake-Up: {formatTimeValue(wakeup)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vertical Scrolling Wheel Selector */}
            <View style={styles.wheelSection}>
              <Text style={styles.wheelSectionLabel}>
                {activeTab === 'bedtime' ? 'SCROLL TO SELECT BEDTIME' : 'SCROLL TO SELECT WAKE-UP TIME'}
              </Text>
              {activeTab === 'bedtime' ? (
                <WheelTimePicker
                  value={bedtime}
                  onChange={(val) => setBedtime(val)}
                  minuteStep={15}
                />
              ) : (
                <WheelTimePicker
                  value={wakeup}
                  onChange={(val) => setWakeup(val)}
                  minuteStep={15}
                />
              )}
            </View>

            {/* Calculated Sleep Window Display */}
            <View style={styles.durationCard}>
              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>Calculated Sleep Window</Text>
                <Text style={styles.durationValue}>
                  {hoursPart}h {minutesPart > 0 ? `${minutesPart}m` : ''}
                </Text>
              </View>

              {isOptimalHgh && (
                <View style={styles.hghBadge}>
                  <Sparkles size={13} color="#2563EB" />
                  <Text style={styles.hghBadgeText}>
                    Optimal Somatotropin (hGH) Peak Window (10 PM - 2 AM)
                  </Text>
                </View>
              )}
            </View>

            {/* Sleep Quality Options */}
            <View style={styles.qualitySection}>
              <Text style={styles.qualitySectionLabel}>EXPECTED REST QUALITY</Text>
              <View style={styles.qualityRow}>
                {(['Deep Restorative', 'Normal Rest', 'Light / Interrupted'] as const).map((q) => {
                  const isSelected = quality === q;
                  const labelShort = q === 'Deep Restorative' ? 'Deep' : q === 'Normal Rest' ? 'Normal' : 'Light';
                  const emoji = q === 'Deep Restorative' ? '✨' : q === 'Normal Rest' ? '🌙' : '😴';
                  return (
                    <TouchableOpacity
                      key={q}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setQuality(q);
                      }}
                      style={[styles.qualityChip, isSelected && styles.qualityChipActive]}
                    >
                      <Text style={{ fontSize: 14 }}>{emoji}</Text>
                      <Text style={[styles.qualityChipText, isSelected && styles.qualityChipTextActive]}>
                        {labelShort}
                      </Text>
                      {isSelected && <Check size={12} color="#2563EB" strokeWidth={2.5} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Button */}
            <GlassButton
              onPress={handleSave}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Sleep Schedule ({totalHours}h Goal)</Text>
            </GlassButton>
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  wheelSection: {
    marginBottom: 16,
  },
  wheelSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  durationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    fontVariant: ['tabular-nums'],
  },
  hghBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  hghBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1D4ED8',
    flex: 1,
  },
  qualitySection: {
    marginBottom: 20,
  },
  qualitySectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
  },
  qualityChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  qualityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  qualityChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

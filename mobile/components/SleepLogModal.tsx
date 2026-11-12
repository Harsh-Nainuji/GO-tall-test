import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Moon, Sun, Clock, Sparkles, Check, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { useAppStore } from '../lib/store';

interface SleepLogModalProps {
  visible: boolean;
  onClose: () => void;
}

const BEDTIME_OPTIONS = [
  '09:00 PM', '09:30 PM', '10:00 PM', '10:15 PM', '10:30 PM',
  '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM', '01:00 AM',
];

const WAKE_OPTIONS = [
  '05:30 AM', '06:00 AM', '06:30 AM', '06:45 AM', '07:00 AM',
  '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
];

const DIRECT_HOURS_PRESETS = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

const SLEEP_QUALITIES = [
  {
    id: 'Deep Restorative',
    label: 'Deep Restorative',
    desc: 'Peak slow-wave hGH pulse sync',
    icon: '✨',
    badge: 'Optimal Chondrocyte Rehydration',
    color: '#0284C7',
  },
  {
    id: 'Normal Rest',
    label: 'Normal Rest',
    desc: 'Standard nocturnal recovery',
    icon: '🌙',
    badge: 'Adequate Recovery',
    color: '#3B82F6',
  },
  {
    id: 'Light / Interrupted',
    label: 'Light / Fragmented',
    desc: 'Frequent micro-arousals',
    icon: '⚠️',
    badge: 'Elevated Cortisol Risk',
    color: '#F59E0B',
  },
];

// Pure arithmetic helper to convert 12h clock string to decimal 24h number
function parseTimeTo24hDecimal(timeStr: string): number {
  const [timePart, modifier] = timeStr.trim().split(' ');
  const [hourStr, minStr] = timePart.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours + minutes / 60;
}

// Pure arithmetic cross-midnight sleep calculator
export function calculateSleepDuration(bedtimeStr: string, wakeStr: string): number {
  const bed = parseTimeTo24hDecimal(bedtimeStr);
  const wake = parseTimeTo24hDecimal(wakeStr);

  const duration = (wake - bed + 24) % 24;
  return Math.round(duration * 100) / 100;
}

// Pure arithmetic somatotropin slow-wave overlap (10:00 PM = 22.0, 2:00 AM = 26.0)
export function calculateSomatotropinWindowOverlap(bedtimeStr: string, wakeStr: string): {
  overlapHours: number;
  percentage: number;
} {
  const bed = parseTimeTo24hDecimal(bedtimeStr);
  const wake = parseTimeTo24hDecimal(wakeStr);

  // Normalize bed time on timeline where 10 PM is 22:
  const bedNormalized = bed < 12 ? bed + 24 : bed;
  const wakeNormalized = wake <= 12 ? wake + 24 : wake;

  const windowStart = 22.0; // 10:00 PM
  const windowEnd = 26.0; // 02:00 AM

  const overlapStart = Math.max(bedNormalized, windowStart);
  const overlapEnd = Math.min(wakeNormalized, windowEnd);

  const overlap = Math.max(0, overlapEnd - overlapStart);
  const percentage = Math.min(100, Math.round((overlap / 4.0) * 100));

  return { overlapHours: Math.round(overlap * 10) / 10, percentage };
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

  const hghOverlap =
    inputMode === 'times'
      ? calculateSomatotropinWindowOverlap(selectedBedtime, selectedWakeup)
      : {
          overlapHours: Math.min(4.0, Math.round((calculatedHours / 8.5) * 3.5 * 10) / 10),
          percentage: Math.min(100, Math.round((calculatedHours / 8.5) * 88)),
        };

  const deltaFromTarget = Math.round((calculatedHours - sleepTargetHours) * 10) / 10;

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.sheetContainer}>
          <GlassCard style={styles.glassModal}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerBadge}>
                <Moon size={16} color="#0284C7" />
                <Text style={styles.headerBadgeText}>Circadian Biometrics</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Log Sleep Cycle</Text>
            <Text style={styles.modalSubtitle}>
              Tracks slow-wave pituitary growth hormone (hGH) release and disc rehydration.
            </Text>

            {/* Input Mode Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, inputMode === 'times' && styles.toggleBtnActive]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setInputMode('times');
                }}
              >
                <Clock size={15} color={inputMode === 'times' ? '#FFFFFF' : '#475569'} />
                <Text
                  style={[
                    styles.toggleBtnText,
                    inputMode === 'times' && styles.toggleBtnTextActive,
                  ]}
                >
                  Bedtime & Wake-up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, inputMode === 'direct' && styles.toggleBtnActive]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setInputMode('direct');
                }}
              >
                <Sparkles size={15} color={inputMode === 'direct' ? '#FFFFFF' : '#475569'} />
                <Text
                  style={[
                    styles.toggleBtnText,
                    inputMode === 'direct' && styles.toggleBtnTextActive,
                  ]}
                >
                  Direct Hours
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              {inputMode === 'times' ? (
                <View style={styles.timeSection}>
                  {/* Bedtime Selector */}
                  <View style={styles.timeSelectorGroup}>
                    <View style={styles.timeLabelRow}>
                      <Moon size={14} color="#6366F1" />
                      <Text style={styles.timeLabel}>Bedtime</Text>
                      <Text style={styles.timeSelectedValue}>{selectedBedtime}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                      {BEDTIME_OPTIONS.map((time) => {
                        const isSelected = selectedBedtime === time;
                        return (
                          <TouchableOpacity
                            key={time}
                            onPress={() => {
                              Haptics.selectionAsync().catch(() => {});
                              setSelectedBedtime(time);
                            }}
                            style={[styles.chip, isSelected && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Wakeup Selector */}
                  <View style={[styles.timeSelectorGroup, { marginTop: 14 }]}>
                    <View style={styles.timeLabelRow}>
                      <Sun size={14} color="#F59E0B" />
                      <Text style={styles.timeLabel}>Wake-up Time</Text>
                      <Text style={styles.timeSelectedValue}>{selectedWakeup}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                      {WAKE_OPTIONS.map((time) => {
                        const isSelected = selectedWakeup === time;
                        return (
                          <TouchableOpacity
                            key={time}
                            onPress={() => {
                              Haptics.selectionAsync().catch(() => {});
                              setSelectedWakeup(time);
                            }}
                            style={[styles.chip, isSelected && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View style={styles.directSection}>
                  <Text style={styles.sectionHeading}>Select Hours Slept</Text>
                  <View style={styles.directChipsGrid}>
                    {DIRECT_HOURS_PRESETS.map((hrs) => {
                      const isSelected = directHours === hrs;
                      return (
                        <TouchableOpacity
                          key={hrs}
                          onPress={() => {
                            Haptics.selectionAsync().catch(() => {});
                            setDirectHours(hrs);
                          }}
                          style={[styles.directChip, isSelected && styles.directChipActive]}
                        >
                          <Text
                            style={[
                              styles.directChipText,
                              isSelected && styles.directChipTextActive,
                            ]}
                          >
                            {hrs} hrs
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Dynamic Arithmetic Preview Card */}
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Arithmetic Summary</Text>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>{calculatedHours} Hours Total</Text>
                  </View>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {deltaFromTarget >= 0 ? `+${deltaFromTarget}h` : `${deltaFromTarget}h`}
                    </Text>
                    <Text style={styles.metricLbl}>vs {sleepTargetHours}h Target</Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <View style={styles.metricValRow}>
                      <Flame size={14} color="#0284C7" />
                      <Text style={styles.metricVal}>{hghOverlap.percentage}%</Text>
                    </View>
                    <Text style={styles.metricLbl}>hGH Window Sync</Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{hghOverlap.overlapHours}h / 4h</Text>
                    <Text style={styles.metricLbl}>10 PM – 2 AM Wave</Text>
                  </View>
                </View>
              </View>

              {/* Sleep Quality Selector */}
              <View style={styles.qualitySection}>
                <Text style={styles.sectionHeading}>Sleep Quality & Architecture</Text>
                <View style={styles.qualityList}>
                  {SLEEP_QUALITIES.map((q) => {
                    const isSelected = selectedQuality === q.id;
                    return (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setSelectedQuality(q.id);
                        }}
                        style={[styles.qualityItem, isSelected && styles.qualityItemActive]}
                      >
                        <Text style={styles.qualityIcon}>{q.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.qualityName, isSelected && styles.qualityNameActive]}>
                            {q.label}
                          </Text>
                          <Text style={styles.qualityDesc}>{q.desc}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkCircle}>
                            <Check size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footerRow}>
              <GlassButton onPress={handleSave}>
                <View style={styles.primaryBtnInner}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Log {calculatedHours}h Sleep</Text>
                </View>
              </GlassButton>
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  glassModal: {
    padding: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#0284C7',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 380,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSelectorGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  timeSelectedValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  directSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  directChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  directChip: {
    flexBasis: '22%',
    flexGrow: 1,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  directChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  directChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  directChipTextActive: {
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  durationBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#BAE6FD',
  },
  qualitySection: {
    marginBottom: 12,
  },
  qualityList: {
    gap: 8,
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  qualityItemActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  qualityIcon: {
    fontSize: 22,
  },
  qualityName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  qualityNameActive: {
    color: '#0284C7',
  },
  qualityDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    marginTop: 8,
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

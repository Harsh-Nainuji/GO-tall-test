import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Moon,
  Sparkles,
  Sunrise,
  Sunset,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GlassCard from '../../components/ui/GlassCard';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import SleepLogModal from '../../components/SleepLogModal';
import { useAppStore, SleepLog } from '../../lib/store';
import { SLEEP_GOAL_HOURS, SLEEP_STREAK_MIN_HOURS } from '../../lib/constants';
import { colors, gradients } from '../../lib/theme';

export default function SleepScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Default today (last index)

  const sleepLogs = useAppStore((state) => state.sleepLogs);

  // 7-day data mapping (last 7 days)
  const weekData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      const match = sleepLogs.find((l) => l.date === dateStr || l.dayOfWeek === dayName);
      result.push({
        day: dayName,
        date: dateStr,
        hours: match ? match.hours : 0,
        quality: match ? match.quality : 'Unrecorded',
        log: match,
      });
    }
    return result;
  }, [sleepLogs]);

  const selectedDayData = weekData[selectedDayIdx] || weekData[weekData.length - 1];

  // Sleep streak: consecutive days with >= 7.5h
  const streakDays = useMemo(() => {
    let count = 0;
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].hours >= SLEEP_STREAK_MIN_HOURS) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [weekData]);

  // Daily target ring percentage (target: 9.0h)
  const currentHours = selectedDayData.hours;
  const sleepPct = Math.min(100, Math.round((currentHours / SLEEP_GOAL_HOURS) * 100));

  // Recent logs list (sorted newest first)
  const recentLogs = useMemo(() => {
    return [...sleepLogs].reverse().slice(0, 5);
  }, [sleepLogs]);

  return (
    <LinearGradient colors={gradients.canvas} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Sleep & Recovery</Text>
            <Text style={styles.headerSubtitle}>Rest for natural growth hormone</Text>
          </View>

          <View style={styles.headerRight}>
            {streakDays > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={13} color={colors.amber600} />
                <Text style={styles.streakText}>{streakDays}d streak</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setModalVisible(true);
              }}
              style={styles.manualLogBtn}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.manualLogText}>Log Sleep</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 9-HOUR SLEEP RING CARD */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.ringCard}>
              <View style={styles.ringCenterWrap}>
                <CircularProgressRingGlass
                  size={150}
                  strokeWidth={12}
                  percentage={sleepPct}
                  color={colors.purple600}
                  valueText={`${currentHours}h`}
                  unitText={`of ${SLEEP_GOAL_HOURS}h goal`}
                  label={`${selectedDayData.day} Rest`}
                  sublabel={`${sleepPct}% of daily goal`}
                />
              </View>

              <View style={styles.scheduleRow}>
                <View style={styles.scheduleBox}>
                  <Sunset size={16} color={colors.purple600} />
                  <Text style={styles.scheduleLabel}>Bedtime</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDayData.log?.bedtime || '10:30 PM'}
                  </Text>
                </View>

                <View style={styles.scheduleBox}>
                  <Sunrise size={16} color={colors.amber600} />
                  <Text style={styles.scheduleLabel}>Wake Up</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDayData.log?.wakeupTime || '07:30 AM'}
                  </Text>
                </View>
              </View>

              {/* Prominent Log Sleep Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setModalVisible(true);
                }}
                style={styles.primaryLogSleepBtn}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.primaryLogSleepBtnText}>Log Sleep Window</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* 7-DAY BAR CHART */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Past 7 Days</Text>
                <Text style={styles.chartTargetText}>{SLEEP_GOAL_HOURS}h goal</Text>
              </View>

              <View style={styles.barsContainer}>
                {weekData.map((bar, idx) => {
                  const isSelected = selectedDayIdx === idx;
                  const barHeight = bar.hours > 0 ? Math.min(110, (bar.hours / 10) * 110) : 10;
                  const reachedTarget = bar.hours >= SLEEP_STREAK_MIN_HOURS;

                  return (
                    <TouchableOpacity
                      key={bar.day}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedDayIdx(idx);
                      }}
                      style={styles.barColumn}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.barHoursText, isSelected && styles.barHoursSelected]}>
                        {bar.hours > 0 ? `${bar.hours}h` : '—'}
                      </Text>

                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: isSelected
                                ? colors.purple600
                                : reachedTarget
                                ? '#A855F7'
                                : '#CBD5E1',
                            },
                          ]}
                        />
                      </View>

                      <View style={[styles.dayPill, isSelected && styles.dayPillSelected]}>
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                          {bar.day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassCard>
          </Animated.View>

          {/* CLINICAL hGH INSIGHT CARD */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <GlassCard style={styles.insightCard}>
              <View style={styles.insightIconWrap}>
                <Sparkles size={20} color={colors.purple600} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Somatotropin (hGH) Secretion Window</Text>
                <Text style={styles.insightDesc}>
                  Over 75% of cumulative daily human growth hormone is pulsed during Stage 3–4 slow-wave deep sleep between 10:00 PM and 2:00 AM. Maintaining consistent bedtime synchronizes peak anabolic recovery.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* RECENT SLEEP HISTORY */}
          {recentLogs.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={styles.historySectionTitle}>Recent Sleep Logs</Text>
              <View style={styles.historyList}>
                {recentLogs.map((log) => (
                  <GlassCard key={log.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyIconWrap}>
                        <Moon size={16} color={colors.purple600} />
                      </View>
                      <View>
                        <Text style={styles.historyDateText}>
                          {log.dayOfWeek}, {log.date}
                        </Text>
                        <Text style={styles.historyWindowText}>
                          {log.bedtime} – {log.wakeupTime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyHoursText}>{log.hours} hrs</Text>
                      <View
                        style={[
                          styles.qualityBadge,
                          log.quality === 'Optimal' ? styles.qualityOptimal : styles.qualityFair,
                        ]}
                      >
                        <Text
                          style={[
                            styles.qualityBadgeText,
                            log.quality === 'Optimal' ? styles.qualityTextOptimal : styles.qualityTextFair,
                          ]}
                        >
                          {log.quality}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <SleepLogModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate900,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.slate600,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.amber600,
  },
  manualLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purple600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  manualLogText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  ringCard: {
    padding: 20,
    gap: 16,
  },
  ringCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  scheduleLabel: {
    fontSize: 11,
    color: colors.slate600,
  },
  scheduleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate900,
  },
  primaryLogSleepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.purple600,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: colors.purple600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryLogSleepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartCard: {
    padding: 20,
    gap: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate900,
  },
  chartTargetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.purple600,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barHoursText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate400,
  },
  barHoursSelected: {
    color: colors.purple600,
    fontWeight: '700',
  },
  barTrack: {
    width: 22,
    height: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  dayPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayPillSelected: {
    backgroundColor: colors.purple600,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate600,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(243, 232, 255, 0.6)',
    borderColor: '#E9D5FF',
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#581C87',
  },
  insightDesc: {
    fontSize: 11,
    color: '#6B21A8',
    lineHeight: 16,
  },
  historySectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate900,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  historyList: {
    gap: 8,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  historyWindowText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyHoursText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.purple600,
  },
  qualityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qualityOptimal: {
    backgroundColor: '#DCFCE7',
  },
  qualityFair: {
    backgroundColor: '#FEF3C7',
  },
  qualityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  qualityTextOptimal: {
    color: '#15803D',
  },
  qualityTextFair: {
    color: '#B45309',
  },
});

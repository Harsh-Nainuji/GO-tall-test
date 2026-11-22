import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Sparkles,
  Flame,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GoTallBackground from '../../components/GoTallBackground';
import GlassCard from '../../components/ui/GlassCard';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import SleepClockDial from '../../components/SleepClockDial';
import GradientBarChart from '../../components/GradientBarChart';
import SleepSchedulerModal from '../../components/SleepSchedulerModal';
import { useAppStore } from '../../lib/store';
import { SLEEP_GOAL_HOURS, SLEEP_STREAK_MIN_HOURS } from '../../lib/constants';
import { colors } from '../../lib/theme';

export default function SleepScreen() {
  const [schedulerModalVisible, setSchedulerModalVisible] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Default today (last index)

  const sleepLogs = useAppStore((state) => state.sleepLogs);
  const sleepTargetHours = useAppStore((state) => state.sleepTargetHours) || SLEEP_GOAL_HOURS;
  const streakDays = useAppStore((state) => state.streakDays);

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
        isToday: i === 0,
      });
    }
    return result;
  }, [sleepLogs]);

  const selectedDayData = weekData[selectedDayIdx] || weekData[weekData.length - 1];

  // Daily target ring percentage
  const currentHours = selectedDayData.hours;
  const sleepPct = Math.min(100, Math.round((currentHours / sleepTargetHours) * 100));

  // Chart data formatted for GradientBarChart
  const chartItems = useMemo(() => {
    return weekData.map((w) => ({
      day: w.day,
      value: w.hours,
      date: w.date,
      isToday: w.isToday,
    }));
  }, [weekData]);

  // Recent logs list (sorted newest first)
  const recentLogs = useMemo(() => {
    return [...sleepLogs].reverse().slice(0, 5);
  }, [sleepLogs]);

  return (
    <GoTallBackground variant="pattern">
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header with Brand Logo & Name */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.brandPill}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.brandLogoImg}
                resizeMode="cover"
              />
              <Text style={styles.brandText}>Tallgrame</Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.headerTitle}>Sleep & Recovery</Text>
            <Text style={styles.headerSubtitle}>Nocturnal Somatotropin (hGH) cycle</Text>
          </View>

          <View style={styles.headerRight}>
            {streakDays > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color="#D97706" />
                <Text style={styles.streakText}>{streakDays}d streak</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSchedulerModalVisible(true);
              }}
              style={styles.scheduleActionBtn}
              activeOpacity={0.8}
            >
              <Clock size={13} color="#2563EB" />
              <Text style={styles.scheduleActionBtnText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* PRIMARY SLEEP CLOCK DIAL (Image 2: Circular Dial with Lavender Arc & 8hr Target) */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <SleepClockDial
              hours={currentHours}
              bedtime={selectedDayData.log?.bedtime || '23:30'}
              wakeupTime={selectedDayData.log?.wakeupTime || '07:30'}
              targetHours={sleepTargetHours}
              onPressBedtime={() => {
                Haptics.selectionAsync().catch(() => {});
                setSchedulerModalVisible(true);
              }}
              onPressWakeup={() => {
                Haptics.selectionAsync().catch(() => {});
                setSchedulerModalVisible(true);
              }}
            />
          </Animated.View>

          {/* APPLE HEALTH WEEKLY BAR CHART */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Past 7 Days History</Text>
                  <Text style={styles.chartSubtitle}>
                    {selectedDayData.day}: {selectedDayData.hours}h ({selectedDayData.quality})
                  </Text>
                </View>
                <View style={styles.targetPill}>
                  <Text style={styles.chartTargetText}>{sleepTargetHours}h Goal</Text>
                </View>
              </View>

              {/* Reusable Gradient Bar Chart */}
              <GradientBarChart
                data={chartItems}
                maxValue={10}
                height={120}
                selectedIndex={selectedDayIdx}
                onSelectDay={(idx) => setSelectedDayIdx(idx)}
                barGradient={['#38BDF8', '#8B5CF6']}
              />
            </GlassCard>
          </Animated.View>

          {/* CLINICAL hGH INSIGHT CARD */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <GlassCard style={styles.insightCard}>
              <View style={styles.insightIconWrap}>
                <Sparkles size={18} color="#2563EB" />
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
              <Text style={styles.historySectionTitle}>Recent Sleep Records</Text>
              <View style={styles.historyList}>
                {recentLogs.map((log) => (
                  <GlassCard key={log.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyIconWrap}>
                        <Moon size={15} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text style={styles.historyDateText}>
                          {log.dayOfWeek}, {log.date}
                        </Text>
                        <Text style={styles.historyWindowText}>
                          {log.bedtime || '10:30 PM'} → {log.wakeupTime || '07:00 AM'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyRight}>
                      <Text style={styles.historyHoursText}>{log.hours}h</Text>
                      <View
                        style={[
                          styles.qualityBadge,
                          log.hours >= SLEEP_STREAK_MIN_HOURS
                            ? styles.qualityOptimal
                            : styles.qualityFair,
                        ]}
                      >
                        <Text
                          style={[
                            styles.qualityBadgeText,
                            log.hours >= SLEEP_STREAK_MIN_HOURS
                              ? styles.qualityTextOptimal
                              : styles.qualityTextFair,
                          ]}
                        >
                          {log.quality || 'Recorded'}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Tactile Vertical Wheel Sleep Scheduler Modal with 12h / 24h liberty */}
        <SleepSchedulerModal
          visible={schedulerModalVisible}
          onClose={() => setSchedulerModalVisible(false)}
        />
      </SafeAreaView>
    </GoTallBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  scheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  scheduleActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  ringCard: {
    padding: 20,
    alignItems: 'center',
  },
  ringCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 12,
  },
  scheduleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 16,
  },
  primaryLogSleepBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryLogSleepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryScheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    borderRadius: 14,
  },
  secondaryScheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  chartCard: {
    padding: 18,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  targetPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chartTargetText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    borderColor: '#BFDBFE',
  },
  insightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  insightDesc: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 16,
    marginTop: 2,
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    paddingHorizontal: 2,
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
    color: '#0F172A',
  },
  historyWindowText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyHoursText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    fontVariant: ['tabular-nums'],
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
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  brandLogoImg: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  qualityTextOptimal: {
    color: '#15803D',
  },
  qualityTextFair: {
    color: '#B45309',
  },
});

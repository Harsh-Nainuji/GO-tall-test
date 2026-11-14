import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
  Play,
  Square,
  RefreshCw,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GlassCard from '../../components/ui/GlassCard';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import SleepLogModal from '../../components/SleepLogModal';
import { useAppStore, SleepLog } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SLEEP_GOAL_HOURS, SLEEP_STREAK_MIN_HOURS } from '../../lib/constants';
import { colors, gradients } from '../../lib/theme';
import { logError } from '../../lib/logger';

const ASYNC_SLEEP_KEY = 'gotall_active_sleep_session';
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SleepStateMachine = 'IDLE' | 'SLEEPING' | 'WOKEN_UP';

export default function SleepScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Default today (last index)

  // Sleep State Machine
  const [sleepState, setSleepState] = useState<SleepStateMachine>('IDLE');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wokenSummary, setWokenSummary] = useState<{ hours: number; bedtime: string; wakeup: string } | null>(null);

  const sleepLogs = useAppStore((state) => state.sleepLogs);
  const addSleepLog = useAppStore((state) => state.addSleepLog);

  // Restore active sleep session from AsyncStorage on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem(ASYNC_SLEEP_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.state === 'SLEEPING' && parsed.startTime) {
            setStartTime(parsed.startTime);
            setSleepState('SLEEPING');
            setElapsedSeconds(Math.floor((Date.now() - parsed.startTime) / 1000));
          }
        }
      } catch (e) {
        logError('Failed to restore sleep session', e);
      }
    }
    restoreSession();
  }, []);

  // Ticking live digital clock during SLEEPING
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (sleepState === 'SLEEPING' && startTime) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sleepState, startTime]);

  // Handle Start Sleep
  const handleStartSleep = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const now = Date.now();
    setStartTime(now);
    setElapsedSeconds(0);
    setSleepState('SLEEPING');
    try {
      await AsyncStorage.setItem(
        ASYNC_SLEEP_KEY,
        JSON.stringify({ state: 'SLEEPING', startTime: now })
      );
    } catch (e) {
      logError('Failed to persist sleep session', e);
    }
  };

  // Handle Wake Up
  const handleWakeUp = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const now = Date.now();
    const start = startTime || (now - elapsedSeconds * 1000);
    const totalHours = Math.round(((now - start) / 3600000) * 10) / 10;

    const bedtimeStr = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const wakeupStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWokenSummary({
      hours: Math.max(0.1, totalHours),
      bedtime: bedtimeStr,
      wakeup: wakeupStr,
    });
    setSleepState('WOKEN_UP');

    try {
      await AsyncStorage.removeItem(ASYNC_SLEEP_KEY);
    } catch (e) {
      logError('Failed to remove sleep session', e);
    }
  };

  // Handle Save Woken Sleep Log
  const handleSaveWokenSleep = async () => {
    if (!wokenSummary) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = today.toISOString().split('T')[0];

    // Add to local store
    addSleepLog({
      date: dateStr,
      dayOfWeek: dayName,
      bedtime: wokenSummary.bedtime,
      wakeupTime: wokenSummary.wakeup,
      hours: wokenSummary.hours,
      quality: wokenSummary.hours >= SLEEP_STREAK_MIN_HOURS ? 'Optimal' : 'Fair',
    });

    // Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('sleep_logs').insert({
          user_id: user?.id,
          logged_date: dateStr,
          bedtime: wokenSummary.bedtime,
          wakeup_time: wokenSummary.wakeup,
          hours: wokenSummary.hours,
          quality: wokenSummary.hours >= SLEEP_STREAK_MIN_HOURS ? 'Optimal' : 'Fair',
        });
      } catch (err) {
        logError('Failed to save sleep log to Supabase', err);
      }
    }

    setSleepState('IDLE');
    setStartTime(null);
    setWokenSummary(null);
  };

  // Format digital clock ticking
  const formatTickingClock = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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

  return (
    <LinearGradient colors={gradients.canvas} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Sleep Tracker</Text>
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
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.manualLogText}>Log</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* LIVE SLEEP TRACKER CARD (State Machine) */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.liveCard}>
              {sleepState === 'IDLE' && (
                <View style={styles.stateCenter}>
                  <View style={styles.moonIconWrap}>
                    <Moon size={32} color={colors.purple600} />
                  </View>
                  <Text style={styles.stateTitle}>Ready for sleep</Text>
                  <Text style={styles.stateDesc}>Tap below when you get into bed.</Text>

                  <TouchableOpacity
                    onPress={handleStartSleep}
                    style={styles.startSleepBtn}
                    activeOpacity={0.8}
                  >
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.startSleepBtnText}>Start Sleep</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sleepState === 'SLEEPING' && (
                <View style={styles.stateCenter}>
                  <View style={[styles.moonIconWrap, styles.moonIconWrapActive]}>
                    <Moon size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sleepingLabel}>Resting now...</Text>
                  <Text style={styles.digitalClock}>{formatTickingClock(elapsedSeconds)}</Text>
                  <Text style={styles.stateDesc}>Natural growth hormone releases during deep rest.</Text>

                  <TouchableOpacity
                    onPress={handleWakeUp}
                    style={styles.wakeUpBtn}
                    activeOpacity={0.8}
                  >
                    <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.wakeUpBtnText}>I am Awake</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sleepState === 'WOKEN_UP' && wokenSummary && (
                <View style={styles.stateCenter}>
                  <View style={[styles.moonIconWrap, { backgroundColor: '#DCFCE7' }]}>
                    <CheckCircle2 size={32} color={colors.green600} />
                  </View>
                  <Text style={styles.stateTitle}>Good morning</Text>
                  <Text style={styles.wokenHoursText}>{wokenSummary.hours} hours slept</Text>
                  <Text style={styles.stateDesc}>
                    {wokenSummary.bedtime} to {wokenSummary.wakeup}
                  </Text>

                  <TouchableOpacity
                    onPress={handleSaveWokenSleep}
                    style={styles.saveWokenBtn}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={18} color="#FFFFFF" />
                    <Text style={styles.saveWokenBtnText}>Save to Log</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* 9-HOUR SLEEP RING CARD */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
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
            </GlassCard>
          </Animated.View>

          {/* 7-DAY BAR CHART */}
          <Animated.View entering={FadeInDown.delay(260).springify()}>
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
  liveCard: {
    padding: 24,
    alignItems: 'center',
  },
  stateCenter: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  moonIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moonIconWrapActive: {
    backgroundColor: colors.purple600,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate900,
  },
  sleepingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple600,
  },
  digitalClock: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.slate900,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginVertical: 4,
  },
  wokenHoursText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.purple600,
  },
  stateDesc: {
    fontSize: 13,
    color: colors.slate600,
    textAlign: 'center',
  },
  startSleepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.purple600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  startSleepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wakeUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  wakeUpBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveWokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.green600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  saveWokenBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
});

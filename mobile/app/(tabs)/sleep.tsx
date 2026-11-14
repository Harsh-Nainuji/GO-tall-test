import React, { useState, useMemo } from 'react';
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
  Activity,
  Moon,
  Sparkles,
  Sunrise,
  Sunset,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GlassCard from '../../components/GlassCard';
import GlassBackgroundCanvas from '../../components/GlassBackgroundCanvas';
import CircularProgressRingGlass from '../../components/CircularProgressRingGlass';
import SleepLogModal from '../../components/SleepLogModal';
import { useAppStore, SleepLog } from '../../lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SleepScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(3); // Default Thu or today

  const sleepLogs = useAppStore((state) => state.sleepLogs);
  const sleepTargetHours = useAppStore((state) => state.sleepTargetHours);
  const deleteSleepLog = useAppStore((state) => state.deleteSleepLog);

  // Group and map logs into 7 days of the week (Mon -> Sun)
  const weekData = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const match = sleepLogs.find((l) => l.dayOfWeek.toLowerCase() === day.toLowerCase());
      return {
        day,
        log: match,
        hours: match ? match.hours : 0,
        quality: match ? match.quality : 'Unrecorded',
      };
    });
  }, [sleepLogs]);

  const selectedDayData = weekData[selectedDayIdx] || weekData[0];

  // Pure arithmetic calculations for the week
  const loggedEntries = weekData.filter((d) => d.hours > 0);
  const totalLoggedHours = loggedEntries.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = loggedEntries.length > 0
    ? Math.round((totalLoggedHours / loggedEntries.length) * 10) / 10
    : 0;

  // Sleep debt calculation
  const weeklyTargetHours = sleepTargetHours * (loggedEntries.length || 7);
  const sleepDebt = Math.max(0, Math.round((weeklyTargetHours - totalLoggedHours) * 10) / 10);

  // Target achievement percentage
  const currentLogged = selectedDayData.hours > 0 ? selectedDayData.hours : avgHours;
  const sleepPct = Math.min(100, Math.round((currentLogged / sleepTargetHours) * 100));

  // Max hours for chart normalization
  const maxHoursInWeek = Math.max(10, ...weekData.map((d) => d.hours));

  return (
    <GlassBackgroundCanvas>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.brandPill}>
            <Activity size={14} color="#0284C7" />
            <Text style={styles.brandText}>GoTall</Text>
            <View style={styles.onlineDot} />
          </View>

          <TouchableOpacity
            style={styles.addLogButton}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#FFFFFF" />
            <Text style={styles.addLogButtonText}>Log Sleep</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.titleSection}
          >
            <Text style={styles.subheadingText}>Circadian Somatotropin Recovery</Text>
            <Text style={styles.headingText}>Slow-Wave Sleep HGH</Text>
          </Animated.View>

          {/* Central Circular Gauge Card matching 3D Glass aesthetic */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard style={styles.cardSpacing}>
              <View style={styles.meterCenterWrap}>
                <CircularProgressRingGlass
                  size={150}
                  strokeWidth={12}
                  percentage={sleepPct}
                  color="#0284C7"
                  valueText={`${currentLogged}h`}
                  unitText={`of ${sleepTargetHours}h goal`}
                  label={`${selectedDayData.day} Somatotropin Sync`}
                  sublabel={`${sleepPct}% Peak Anabolic Quota`}
                />
              </View>

              {/* Bedtime / Wakeup row for selected day */}
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleBox}>
                  <View style={styles.scheduleIconWrap}>
                    <Sunset size={14} color="#0284C7" />
                  </View>
                  <Text style={styles.scheduleLabel}>Bedtime</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDayData.log?.bedtime || '10:30 PM'}
                  </Text>
                  <Text style={styles.scheduleSub}>Slow-Wave Sync</Text>
                </View>

                <View style={styles.scheduleBox}>
                  <View style={styles.scheduleIconWrap}>
                    <Sunrise size={14} color="#F59E0B" />
                  </View>
                  <Text style={styles.scheduleLabel}>Wake Up</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDayData.log?.wakeupTime || '07:00 AM'}
                  </Text>
                  <Text style={styles.scheduleSub}>Natural REM End</Text>
                </View>
              </View>

              {/* SWS Somatotropin Banner */}
              <View style={styles.swsBanner}>
                <Sparkles size={14} color="#0284C7" />
                <Text style={styles.swsBannerText}>
                  {currentLogged >= 8.0
                    ? 'Peak 10 PM – 2 AM Somatotropin Wave Synchronized'
                    : 'Partial Somatotropin Release: Sleep 8.5h+ for Maxima'}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* 7-Day Dynamic Bar Chart Section */}
          <Animated.View
            entering={FadeInDown.delay(260).springify()}
            style={styles.sectionHeaderRow}
          >
            <View>
              <Text style={styles.sectionTitle}>7-Day Sleep Architecture</Text>
              <Text style={styles.sectionSubtitle}>
                Weekly Average: <Text style={styles.boldBlueText}>{avgHours}h / night</Text>
              </Text>
            </View>
            <View style={styles.goalLineTag}>
              <Text style={styles.goalLineText}>{sleepTargetHours}h Target</Text>
            </View>
          </Animated.View>

          {/* Real Dynamic Bar Chart */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <GlassCard style={styles.chartCard}>
              <View style={styles.barsContainer}>
                {weekData.map((bar, idx) => {
                  const isSelected = selectedDayIdx === idx;
                  const barHeight = bar.hours > 0
                    ? Math.max(22, (bar.hours / maxHoursInWeek) * 115)
                    : 12;
                  const isOptimal = bar.hours >= 8.0;

                  return (
                    <TouchableOpacity
                      key={bar.day}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedDayIdx(idx);
                      }}
                      activeOpacity={0.7}
                      style={styles.barColumn}
                    >
                      <Text style={[styles.barHoursText, isSelected && styles.barHoursTextSelected]}>
                        {bar.hours > 0 ? `${bar.hours}h` : '—'}
                      </Text>

                      <View style={styles.barTrack}>
                        <LinearGradient
                          colors={
                            isSelected
                              ? ['#0284C7', '#38BDF8']
                              : isOptimal
                              ? ['#2563EB', '#60A5FA']
                              : bar.hours > 0
                              ? ['#93C5FD', '#BFDBFE']
                              : ['#E2E8F0', '#F1F5F9']
                          }
                          start={{ x: 0.5, y: 0.0 }}
                          end={{ x: 0.5, y: 1.0 }}
                          style={[styles.barFill, { height: barHeight }]}
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

              {/* Dynamic Arithmetic Stat Badges */}
              <View style={styles.statBadgesRow}>
                <View style={styles.statBadgeItem}>
                  <Text style={styles.statBadgeLabel}>Weekly Sleep Debt</Text>
                  <Text style={[styles.statBadgeValue, sleepDebt > 0 && { color: '#EF4444' }]}>
                    {sleepDebt > 0 ? `${sleepDebt}h deficit` : '0h (Optimal)'}
                  </Text>
                </View>

                <View style={styles.statBadgeDivider} />

                <View style={styles.statBadgeItem}>
                  <Text style={styles.statBadgeLabel}>hGH Pulse Days</Text>
                  <Text style={styles.statBadgeValue}>
                    {weekData.filter((d) => d.hours >= 8.0).length} / 7 days
                  </Text>
                </View>

                <View style={styles.statBadgeDivider} />

                <View style={styles.statBadgeItem}>
                  <Text style={styles.statBadgeLabel}>Optimal Rate</Text>
                  <Text style={styles.statBadgeValue}>
                    {Math.round((weekData.filter((d) => d.hours >= 8.0).length / 7) * 100)}%
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Clinical Insights Section */}
          <Animated.View
            entering={FadeInDown.delay(380).springify()}
            style={{ marginTop: 14 }}
          >
            <GlassCard style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.insightIconBadge}>
                  <Clock size={16} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>Intradiscal Rehydration Cycle</Text>
                  <Text style={styles.insightSubtitle}>
                    Spinal discs expand 1.2 – 2.0 cm overnight through diurnal osmotic swelling.
                  </Text>
                </View>
              </View>
              <Text style={styles.insightBody}>
                During prolonged standing, gravity compresses the 23 fibrocartilage intervertebral
                discs, losing fluid. Non-weightbearing slow-wave horizontal sleep draws synovial fluid
                and nutrients back into the nucleus pulposus, stimulating growth factor IGF-1.
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Recent Logs List with Delete Action */}
          <Animated.View
            entering={FadeInDown.delay(440).springify()}
            style={styles.recentLogsSection}
          >
            <Text style={styles.recentLogsTitle}>Recent Nocturnal Cycles</Text>
            <View style={styles.logsList}>
              {sleepLogs.length === 0 ? (
                <GlassCard style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>
                    No sleep records logged yet
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>
                    Tap &ldquo;+ Log Sleep&rdquo; above to track nocturnal somatotropin release windows.
                  </Text>
                </GlassCard>
              ) : (
                sleepLogs.slice(0, 5).map((item) => (
                  <GlassCard key={item.id} style={styles.logCard}>
                    <View style={styles.logLeft}>
                      <View style={styles.logIcon}>
                        <Moon size={16} color="#0284C7" />
                      </View>
                      <View>
                        <View style={styles.logRow}>
                          <Text style={styles.logDay}>{item.dayOfWeek}</Text>
                          <Text style={styles.logDate}>{item.date}</Text>
                        </View>
                        <Text style={styles.logTimes}>
                          {item.bedtime && item.wakeupTime
                            ? `${item.bedtime} – ${item.wakeupTime}`
                            : `${item.hours} hours logged`}
                        </Text>
                        <Text style={styles.logQuality}>{item.quality}</Text>
                      </View>
                    </View>

                    <View style={styles.logRight}>
                      <View style={styles.logHoursBadge}>
                        <Text style={styles.logHoursText}>{item.hours}h</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          deleteSleepLog(item.id);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ))
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Sleep Logging Modal */}
        <SleepLogModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </GlassBackgroundCanvas>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  addLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addLogButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
    marginTop: 4,
  },
  subheadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headingText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  cardSpacing: {
    padding: 20,
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  meterCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  scheduleBox: {
    flex: 1,
    backgroundColor: 'rgba(240, 249, 255, 0.65)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.8)',
    alignItems: 'center',
  },
  scheduleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  scheduleSub: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  swsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 14,
  },
  swsBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  boldBlueText: {
    color: '#0284C7',
    fontWeight: '800',
  },
  goalLineTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalLineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  chartCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 165,
    paddingTop: 10,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barHoursText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  barHoursTextSelected: {
    color: '#0284C7',
    fontWeight: '800',
  },
  barTrack: {
    width: 22,
    height: 115,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(226, 232, 240, 0.45)',
    borderRadius: 11,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  dayPill: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayPillSelected: {
    backgroundColor: '#0284C7',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  statBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBadgeItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  statBadgeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statBadgeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  insightCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  insightIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  insightBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  recentLogsSection: {
    marginTop: 20,
  },
  recentLogsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  logsList: {
    gap: 8,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logDay: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  logDate: {
    fontSize: 11,
    color: '#64748B',
  },
  logTimes: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 1,
  },
  logQuality: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 1,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logHoursBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logHoursText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  deleteBtn: {
    padding: 4,
  },
});

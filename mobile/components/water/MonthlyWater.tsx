// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Droplet, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from '../ui/BottomSheet';
import { useWaterStore, WaterLog } from '../../store/waterStore';
import { getDaysInMonth, formatWaterDate } from '../../lib/water/dates';
import { colors } from '../../lib/theme';

interface MonthlyWaterProps {
  visible: boolean;
  onClose: () => void;
}

export default function MonthlyWater({ visible, onClose }: MonthlyWaterProps) {
  const monthLogs = useWaterStore((state) => state.monthLogs);
  const goal = useWaterStore((state) => state.goal);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalDays = getDaysInMonth(year, month);

  // Group logs by date
  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of monthLogs) {
      map.set(log.logged_date, (map.get(log.logged_date) || 0) + log.amount_ml);
    }
    return map;
  }, [monthLogs]);

  const handlePrevMonth = () => {
    Haptics.selectionAsync().catch(() => {});
    setCurrentDate(new Date(year, month - 2, 1));
    setSelectedDayStr(null);
  };

  const handleNextMonth = () => {
    Haptics.selectionAsync().catch(() => {});
    setCurrentDate(new Date(year, month, 1));
    setSelectedDayStr(null);
  };

  const getColorForPercent = (total: number) => {
    const pct = (total / goal) * 100;
    if (total === 0) return { bg: '#F1F5F9', text: colors.slate400 };
    if (pct < 50) return { bg: '#DBEAFE', text: colors.blue600 };
    if (pct < 100) return { bg: '#60A5FA', text: '#FFFFFF' };
    return { bg: colors.blue600, text: '#FFFFFF' };
  };

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Selected day details
  const selectedDayLogs: WaterLog[] = useMemo(() => {
    if (!selectedDayStr) return [];
    return monthLogs.filter((l) => l.logged_date === selectedDayStr);
  }, [selectedDayStr, monthLogs]);

  const selectedDayTotal = selectedDayLogs.reduce((sum, l) => sum + l.amount_ml, 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Monthly Water Log">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Month Switcher Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={colors.slate900} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={colors.slate900} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#F1F5F9' }]} />
            <Text style={styles.legendText}>0%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#DBEAFE' }]} />
            <Text style={styles.legendText}>1–49%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.legendText}>50–99%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.blue600 }]} />
            <Text style={styles.legendText}>100%+</Text>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const total = dailyTotals.get(dateStr) || 0;
            const style = getColorForPercent(total);
            const isSelected = selectedDayStr === dateStr;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedDayStr(dateStr);
                }}
                style={[
                  styles.dayCell,
                  { backgroundColor: style.bg },
                  isSelected && styles.dayCellSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayNumber, { color: style.text }]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Day Detail Card */}
        {selectedDayStr && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderLeft}>
                <Calendar size={16} color={colors.blue600} />
                <Text style={styles.detailDate}>{formatWaterDate(selectedDayStr)}</Text>
              </View>
              <Text style={styles.detailTotal}>{selectedDayTotal} / {goal} ml</Text>
            </View>

            {selectedDayLogs.length === 0 ? (
              <Text style={styles.noLogsText}>No water logged on this day.</Text>
            ) : (
              <View style={styles.logsList}>
                {selectedDayLogs.map((l) => (
                  <View key={l.id} style={styles.logItem}>
                    <View style={styles.logItemLeft}>
                      <Droplet size={14} color={colors.blue600} />
                      <Text style={styles.logLabel}>{l.size_label || `${l.amount_ml}ml`}</Text>
                    </View>
                    <Text style={styles.logAmount}>+{l.amount_ml} ml</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate900,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: colors.slate600,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: colors.slate900,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate900,
  },
  detailTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.blue600,
  },
  noLogsText: {
    fontSize: 12,
    color: colors.slate400,
  },
  logsList: {
    gap: 6,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate900,
  },
  logAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.blue600,
  },
});

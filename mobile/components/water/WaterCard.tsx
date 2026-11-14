import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Droplet, Undo2, Calendar, Plus, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import GlassCard from '../ui/GlassCard';
import WaterGlobe from './WaterGlobe';
import WaterSizePicker from './WaterSizePicker';
import MonthlyWater from './MonthlyWater';
import { useWaterStore } from '../../store/waterStore';
import { colors } from '../../lib/theme';

export default function WaterCard() {
  const todayLogs = useWaterStore((state) => state.todayLogs);
  const goal = useWaterStore((state) => state.goal);
  const addLog = useWaterStore((state) => state.addLog);
  const undoLast = useWaterStore((state) => state.undoLast);
  const loadToday = useWaterStore((state) => state.loadToday);
  const loadMonth = useWaterStore((state) => state.loadMonth);
  const getTodayTotal = useWaterStore((state) => state.getTodayTotal);
  const getStreak = useWaterStore((state) => state.getStreak);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  useEffect(() => {
    loadToday();
    const d = new Date();
    loadMonth(d.getFullYear(), d.getMonth() + 1);
  }, []);

  const totalMl = getTodayTotal();
  const streak = getStreak();
  const progress = goal > 0 ? totalMl / goal : 0;

  const handleAddWater = (amount_ml: number, label?: string) => {
    addLog(amount_ml, label);
  };

  const handleUndo = () => {
    Haptics.selectionAsync().catch(() => {});
    undoLast();
  };

  return (
    <>
      <GlassCard style={styles.card}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.iconWrap}>
              <Droplet size={18} color={colors.blue600} />
            </View>
            <View>
              <Text style={styles.title}>Spine Hydration</Text>
              <Text style={styles.subtitle}>Daily disc fluid intake</Text>
            </View>
          </View>

          <View style={styles.actionsGroup}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color={colors.amber600} />
                <Text style={styles.streakText}>{streak}d</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setIsCalendarVisible(true);
              }}
              style={styles.calendarBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Calendar size={18} color={colors.slate600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated Water Globe */}
        <View style={styles.globeContainer}>
          <WaterGlobe
            progress={progress}
            currentMl={totalMl}
            goalMl={goal}
            size={220}
          />
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={handleUndo}
            disabled={todayLogs.length === 0}
            style={[
              styles.undoButton,
              todayLogs.length === 0 && styles.undoButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Undo2 size={16} color={todayLogs.length === 0 ? colors.slate400 : colors.slate600} />
            <Text
              style={[
                styles.undoText,
                todayLogs.length === 0 && styles.undoTextDisabled,
              ]}
            >
              Undo last
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsPickerVisible(true);
            }}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Water</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Size Picker Modal */}
      <WaterSizePicker
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelectAmount={handleAddWater}
      />

      {/* Monthly Log Modal */}
      <MonthlyWater
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 16,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate900,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slate400,
  },
  actionsGroup: {
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
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  undoButtonDisabled: {
    opacity: 0.5,
  },
  undoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
  undoTextDisabled: {
    color: colors.slate400,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.blue600,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalDate } from '../lib/water/dates';
import { calculateWaterStreak, DayTotal } from '../lib/water/streak';
import { DEFAULT_WATER_GOAL_ML } from '../lib/constants';
import { logError } from '../lib/logger';

export interface WaterLog {
  id: string;
  user_id?: string;
  logged_date: string;
  amount_ml: number;
  size_label?: string;
  logged_at: string;
}

interface WaterState {
  todayLogs: WaterLog[];
  monthLogs: WaterLog[];
  goal: number;
  isLoading: boolean;

  setGoal: (goal: number) => Promise<void>;
  loadToday: (dateStr?: string) => Promise<void>;
  loadMonth: (year: number, month: number) => Promise<void>;
  addLog: (amount_ml: number, size_label?: string) => Promise<boolean>;
  undoLast: () => Promise<boolean>;
  getTodayTotal: () => number;
  getStreak: () => number;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      todayLogs: [],
      monthLogs: [],
      goal: DEFAULT_WATER_GOAL_ML,
      isLoading: false,

      setGoal: async (newGoal: number) => {
        set({ goal: newGoal });
        if (isSupabaseConfigured()) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.id) {
              await supabase
                .from('profiles')
                .update({ water_goal_ml: newGoal })
                .eq('id', user.id);
            }
          } catch (err) {
            logError('Failed to update water goal on profile', err);
          }
        }
      },

      loadToday: async (dateStr = getLocalDate()) => {
        if (!isSupabaseConfigured()) return;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.id) return;

          const { data, error } = await supabase
            .from('water_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('logged_date', dateStr)
            .order('logged_at', { ascending: true });

          if (!error && data) {
            set({ todayLogs: data as WaterLog[] });
          }
        } catch (err) {
          logError('Failed to load today water logs', err);
        }
      },

      loadMonth: async (year: number, month: number) => {
        if (!isSupabaseConfigured()) return;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.id) return;

          const mStr = String(month).padStart(2, '0');
          const startDate = `${year}-${mStr}-01`;
          const endDate = `${year}-${mStr}-31`;

          const { data, error } = await supabase
            .from('water_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_date', startDate)
            .lte('logged_date', endDate)
            .order('logged_at', { ascending: true });

          if (!error && data) {
            set({ monthLogs: data as WaterLog[] });
          }
        } catch (err) {
          logError('Failed to load month water logs', err);
        }
      },

      addLog: async (amount_ml: number, size_label?: string) => {
        const todayStr = getLocalDate();
        const tempId = `temp-${Date.now()}`;
        const newLog: WaterLog = {
          id: tempId,
          logged_date: todayStr,
          amount_ml,
          size_label: size_label || `${amount_ml}ml`,
          logged_at: new Date().toISOString(),
        };

        // 1. Optimistic update
        const prevToday = get().todayLogs;
        const prevMonth = get().monthLogs;
        set({
          todayLogs: [...prevToday, newLog],
          monthLogs: [...prevMonth, newLog],
        });

        // 2. Supabase insert
        if (isSupabaseConfigured()) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const row = {
              user_id: user?.id,
              logged_date: todayStr,
              amount_ml,
              size_label: newLog.size_label,
              logged_at: newLog.logged_at,
            };

            const { data, error } = await supabase
              .from('water_logs')
              .insert(row)
              .select('id')
              .single();

            if (error) {
              // Rollback on failure
              set({ todayLogs: prevToday, monthLogs: prevMonth });
              logError('Failed to save water log, rolled back', error);
              return false;
            }

            if (data?.id) {
              // Replace tempId with real DB id
              set((state) => ({
                todayLogs: state.todayLogs.map((l) => (l.id === tempId ? { ...l, id: data.id } : l)),
                monthLogs: state.monthLogs.map((l) => (l.id === tempId ? { ...l, id: data.id } : l)),
              }));
            }
          } catch (err) {
            set({ todayLogs: prevToday, monthLogs: prevMonth });
            logError('Network error on water log insert', err);
            return false;
          }
        }

        return true;
      },

      undoLast: async () => {
        const { todayLogs, monthLogs } = get();
        if (todayLogs.length === 0) return false;

        const lastLog = todayLogs[todayLogs.length - 1];
        const nextToday = todayLogs.slice(0, -1);
        const nextMonth = monthLogs.filter((l) => l.id !== lastLog.id);

        // Optimistic delete
        set({ todayLogs: nextToday, monthLogs: nextMonth });

        if (isSupabaseConfigured() && !lastLog.id.startsWith('temp-')) {
          try {
            const { error } = await supabase
              .from('water_logs')
              .delete()
              .eq('id', lastLog.id);

            if (error) {
              // Rollback
              set({ todayLogs, monthLogs });
              logError('Failed to undo water log', error);
              return false;
            }
          } catch (err) {
            set({ todayLogs, monthLogs });
            logError('Network error during water log undo', err);
            return false;
          }
        }

        return true;
      },

      getTodayTotal: () => {
        const todayStr = getLocalDate();
        return get()
          .todayLogs.filter((l) => l.logged_date === todayStr)
          .reduce((sum, l) => sum + l.amount_ml, 0);
      },

      getStreak: () => {
        const { monthLogs, goal } = get();
        const map = new Map<string, number>();
        for (const log of monthLogs) {
          map.set(log.logged_date, (map.get(log.logged_date) || 0) + log.amount_ml);
        }
        const dailyTotals: DayTotal[] = Array.from(map.entries()).map(([date, total_ml]) => ({
          date,
          total_ml,
        }));
        return calculateWaterStreak(dailyTotals, goal, getLocalDate());
      },
    }),
    {
      name: 'gotall_water_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todayLogs: state.todayLogs,
        monthLogs: state.monthLogs,
        goal: state.goal,
      }),
    }
  )
);

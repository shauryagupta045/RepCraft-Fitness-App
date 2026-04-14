import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_METRICS } from '../constants/mockData';

export const useMetricsStore = create(
  persist(
    (set, get) => ({
      todayMetrics: MOCK_METRICS.today,
      weeklyData: MOCK_METRICS.week,
      lastWeekData: MOCK_METRICS.lastWeek,
      monthlyData: MOCK_METRICS.monthly,

      logWater: (amount = 0.25) =>
        set((state) => ({
          todayMetrics: {
            ...state.todayMetrics,
            water: Math.min(5, +(state.todayMetrics.water + amount).toFixed(2)),
          },
        })),

      setWater: (value) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, water: value },
        })),

      logSleep: (hours) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, sleep: hours },
        })),

      logSteps: (steps) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, steps: state.todayMetrics.steps + steps },
        })),

      setSteps: (steps) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, steps },
        })),

      logCaloriesBurned: (cal) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, caloriesBurned: state.todayMetrics.caloriesBurned + cal },
        })),

      updateReadiness: (updates) =>
        set((state) => ({
          todayMetrics: { ...state.todayMetrics, ...updates },
        })),

      computeReadiness: () => {
        const { todayMetrics } = get();
        const { sleep, fatigue, didWorkout } = todayMetrics;
        return Math.min(100, Math.round(
          (sleep / 8) * 40 +
          ((6 - fatigue) / 5) * 35 +
          (didWorkout ? 25 : 0)
        ));
      },
    }),
    {
      name: 'metrics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

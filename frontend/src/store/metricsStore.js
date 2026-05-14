import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStats, updateStats } from '../services/userService';

/** Fire-and-forget Firebase write */
function fbWrite(uid, updates) {
  if (!uid) return;
  updateStats(uid, updates).catch((e) =>
    console.warn('[metricsStore] Firebase write failed:', e.message)
  );
}

const todayDateString = () => new Date().toISOString().split('T')[0];

const DEFAULT_METRICS = {
  steps: 0,
  caloriesBurned: 0,
  caloriesConsumed: 0,
  water: 0,
  sleep: 0,
  bedtime: '',
  wakeTime: '',
  activeMinutes: 0,
  readinessScore: 0,
  fatigue: 0,
  didWorkout: false,
};

const DEFAULT_CHART_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
  steps: 0,
  water: 0,
  sleep: 0,
  caloriesBurned: 0,
  caloriesConsumed: 0,
}));

export const useMetricsStore = create(
  persist(
    (set, get) => ({
      todayMetrics: DEFAULT_METRICS,
      weeklyData: DEFAULT_CHART_DATA,
      lastWeekData: DEFAULT_CHART_DATA,
      monthlyData: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 0 })),
      lastResetDate: todayDateString(),
      _uid: null,

      setUid: (uid) => set({ _uid: uid }),

      /** Load metrics from Firebase on login */
      loadFromFirebase: async (uid) => {
        try {
          const data = await getStats(uid);
          if (!data) return;
          set({
            _uid: uid,
            todayMetrics: {
              ...DEFAULT_METRICS,
              steps: data.stepCount ?? 0,
              water: data.waterIntakeMl ? data.waterIntakeMl / 1000 : 0, // ml → L
              sleep: data.sleepHours ?? 0,
              bedtime: data.bedtime ?? '',
              wakeTime: data.wakeTime ?? '',
              readinessScore: data.readinessScore ?? 0,
            },
          });
        } catch (e) {
          console.warn('[metricsStore] loadFromFirebase error:', e.message);
        }
      },

      /** Reset on logout */
      resetStore: () =>
        set({
          todayMetrics: DEFAULT_METRICS,
          weeklyData: DEFAULT_CHART_DATA,
          lastWeekData: DEFAULT_CHART_DATA,
          monthlyData: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 0 })),
          lastResetDate: todayDateString(),
          _uid: null,
        }),

      resetDailyStepsIfNewDay: () => {
        const today = todayDateString();
        const { lastResetDate } = get();
        if (lastResetDate !== today) {
          set((state) => ({
            lastResetDate: today,
            todayMetrics: { ...state.todayMetrics, steps: 0 },
          }));
        }
      },

      logWater: (amount = 0.25) =>
        set((state) => {
          const water = Math.min(5, +(state.todayMetrics.water + amount).toFixed(2));
          fbWrite(state._uid, { waterIntakeMl: Math.round(water * 1000) });
          return { todayMetrics: { ...state.todayMetrics, water } };
        }),

      setWater: (value) =>
        set((state) => {
          fbWrite(state._uid, { waterIntakeMl: Math.round(value * 1000) });
          return { todayMetrics: { ...state.todayMetrics, water: value } };
        }),

      logSleep: (hours) =>
        set((state) => {
          const today = new Date().getDay();
          const index = today === 0 ? 6 : today - 1;
          const newWeekly = [...state.weeklyData];
          newWeekly[index] = { ...newWeekly[index], sleep: hours };
          
          const newMetrics = { ...state.todayMetrics, sleep: hours };
          // Re-calculate readiness
          const { fatigue, didWorkout } = newMetrics;
          const readinessScore = Math.min(
            100,
            Math.round((hours / 8) * 40 + ((6 - fatigue) / 5) * 35 + (didWorkout ? 25 : 0))
          );
          newMetrics.readinessScore = readinessScore;

          fbWrite(state._uid, { 
            sleepHours: hours,
            readinessScore 
          });
          
          return { 
            todayMetrics: newMetrics,
            weeklyData: newWeekly
          };
        }),

      logSleepTime: (bedtime, wakeTime) =>
        set((state) => {
          const [bh, bm] = bedtime.split(':').map(Number);
          const [wh, wm] = wakeTime.split(':').map(Number);
          
          let duration = wh + wm/60 - (bh + bm/60);
          if (duration < 0) duration += 24;
          duration = +duration.toFixed(2);
          
          const today = new Date().getDay();
          const index = today === 0 ? 6 : today - 1;
          const newWeekly = [...state.weeklyData];
          newWeekly[index] = { ...newWeekly[index], sleep: duration };

          const newMetrics = { 
            ...state.todayMetrics, 
            sleep: duration,
            bedtime,
            wakeTime
          };

          // Re-calculate readiness
          const { fatigue, didWorkout } = newMetrics;
          const readinessScore = Math.min(
            100,
            Math.round((duration / 8) * 40 + ((6 - fatigue) / 5) * 35 + (didWorkout ? 25 : 0))
          );
          newMetrics.readinessScore = readinessScore;

          fbWrite(state._uid, { 
            sleepHours: duration,
            bedtime,
            wakeTime,
            readinessScore
          });

          return {
            todayMetrics: newMetrics,
            weeklyData: newWeekly
          };
        }),

      logSteps: (steps) =>
        set((state) => {
          const newSteps = state.todayMetrics.steps + steps;
          fbWrite(state._uid, { stepCount: newSteps });
          return { todayMetrics: { ...state.todayMetrics, steps: newSteps } };
        }),

      setSteps: (steps) =>
        set((state) => {
          const newSteps = Math.max(0, steps);
          fbWrite(state._uid, { stepCount: newSteps });
          return { todayMetrics: { ...state.todayMetrics, steps: newSteps } };
        }),

      logCaloriesBurned: (cal) =>
        set((state) => ({
          todayMetrics: {
            ...state.todayMetrics,
            caloriesBurned: state.todayMetrics.caloriesBurned + cal,
          },
        })),

      updateReadiness: (updates) =>
        set((state) => {
          fbWrite(state._uid, { readinessScore: updates.readinessScore ?? state.todayMetrics.readinessScore });
          return { todayMetrics: { ...state.todayMetrics, ...updates } };
        }),

      computeReadiness: () => {
        const { todayMetrics } = get();
        const { sleep, fatigue, didWorkout } = todayMetrics;
        return Math.min(
          100,
          Math.round((sleep / 8) * 40 + ((6 - fatigue) / 5) * 35 + (didWorkout ? 25 : 0))
        );
      },
    }),
    {
      name: 'metrics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

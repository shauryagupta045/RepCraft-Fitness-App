import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveRoutine,
  deleteRoutine as fbDeleteRoutine,
  saveCardioSession,
  saveHyroxSession,
  saveWorkoutLog,
  getRoutines,
  getCardioSessions,
  getHyroxSessions,
  getWorkoutLogs,
} from '../services/userService';

/** Fire-and-forget Firebase write — never blocks the UI */
function fbWrite(fn, ...args) {
  fn(...args).catch((e) => console.warn('[workoutStore] Firebase write failed:', e.message));
}

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      routines: [],
      workoutLogs: [],
      cardioSessions: [],
      hyroxSessions: [],
      activeSession: null,
      _uid: null, // injected by authStore on login

      /** Called by authStore after login */
      setUid: (uid) => set({ _uid: uid }),

      /** Load all workout data from Firebase (called on login) */
      loadFromFirebase: async (uid) => {
        try {
          const [routines, workoutLogs, cardioSessions, hyroxSessions] = await Promise.all([
            getRoutines(uid),
            getWorkoutLogs(uid),
            getCardioSessions(uid),
            getHyroxSessions(uid),
          ]);
          set({ routines, workoutLogs, cardioSessions, hyroxSessions, _uid: uid });
        } catch (e) {
          console.warn('[workoutStore] loadFromFirebase error:', e.message);
        }
      },

      /** Reset all state on logout */
      resetStore: () =>
        set({
          routines: [],
          workoutLogs: [],
          cardioSessions: [],
          hyroxSessions: [],
          activeSession: null,
          _uid: null,
        }),

      addRoutine: (routine) => {
        const newRoutine = { ...routine, id: `r${Date.now()}` };
        set((state) => ({ routines: [...state.routines, newRoutine] }));
        const uid = get()._uid;
        if (uid) fbWrite(saveRoutine, uid, newRoutine);
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
        const uid = get()._uid;
        if (uid) {
          const updated = get().routines.find((r) => r.id === id);
          if (updated) fbWrite(saveRoutine, uid, updated);
        }
      },

      deleteRoutine: (id) => {
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) }));
        const uid = get()._uid;
        if (uid) fbWrite(fbDeleteRoutine, uid, id);
      },

      startSession: (routine) =>
        set({
          activeSession: {
            routineId: routine.id,
            routineName: routine.title,
            startTime: Date.now(),
            sets: {},
            notes: '',
          },
        }),

      logSet: (exerciseId, setData) =>
        set((state) => {
          const current = state.activeSession?.sets[exerciseId] || [];
          return {
            activeSession: {
              ...state.activeSession,
              sets: {
                ...state.activeSession?.sets,
                [exerciseId]: [...current, { ...setData, id: Date.now() }],
              },
            },
          };
        }),

      updateSet: (exerciseId, setIndex, updates) =>
        set((state) => {
          const currentSets = [...(state.activeSession?.sets[exerciseId] || [])];
          currentSets[setIndex] = { ...currentSets[setIndex], ...updates };
          return {
            activeSession: {
              ...state.activeSession,
              sets: { ...state.activeSession?.sets, [exerciseId]: currentSets },
            },
          };
        }),

      finishSession: (manualEffort) =>
        set((state) => {
          if (!state.activeSession) return {};
          const duration = Math.round((Date.now() - state.activeSession.startTime) / 60000);
          const routine = state.routines.find((r) => r.id === state.activeSession.routineId);
          let calculatedEffort = 7;
          if (routine) {
            const totalPlannedSets = routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
            const totalCompletedSets = Object.values(state.activeSession.sets).reduce(
              (sum, sets) => sum + sets.length,
              0
            );
            calculatedEffort =
              totalPlannedSets > 0
                ? Math.min(10, (totalCompletedSets / totalPlannedSets) * 10)
                : 7;
          }
          const log = {
            id: `l${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            routineId: state.activeSession.routineId,
            duration,
            effort: manualEffort !== undefined ? manualEffort : Math.round(calculatedEffort),
            sets: state.activeSession.sets,
          };

          const uid = state._uid;
          if (uid) fbWrite(saveWorkoutLog, uid, log);

          return { workoutLogs: [log, ...state.workoutLogs], activeSession: null };
        }),

      cancelSession: () => set({ activeSession: null }),

      addCardioSession: (session) => {
        const newSession = { ...session, id: `c${Date.now()}` };
        set((state) => ({ cardioSessions: [newSession, ...state.cardioSessions] }));
        const uid = get()._uid;
        if (uid) fbWrite(saveCardioSession, uid, newSession);
      },

      addHyroxSession: (session) => {
        const newSession = { ...session, id: `h${Date.now()}` };
        set((state) => ({ hyroxSessions: [newSession, ...state.hyroxSessions] }));
        const uid = get()._uid;
        if (uid) fbWrite(saveHyroxSession, uid, newSession);
      },

      getExerciseHistory: (exerciseName) => {
        const { workoutLogs, routines } = get();
        const history = [];
        workoutLogs.forEach((log) => {
          const routine = routines.find((r) => r.id === log.routineId);
          if (routine) {
            const exercise = routine.exercises.find((e) => e.name === exerciseName);
            if (exercise && log.sets?.[exercise.id]) {
              log.sets[exercise.id].forEach((s) => {
                history.push({ date: log.date, weight: s.weight, reps: s.reps, volume: s.weight * s.reps });
              });
            }
          }
        });
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      applyAIPlan: (plan) => {
        if (!plan?.workoutPlan) return;
        const newRoutines = plan.workoutPlan.map((day, i) => ({
          id: `ai_r${Date.now()}_${i}`,
          title: day.title || `Day ${i + 1}`,
          day: day.day || 'Monday',
          muscleGroup: day.muscleGroup || 'Full Body',
          exercises: (day.exercises || []).map((ex, j) => ({
            id: `ai_e${Date.now()}_${i}_${j}`,
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            weight: ex.weight || 0,
            rest: ex.rest || 60,
            pr: null,
          })),
        }));
        set((state) => ({ routines: [...newRoutines, ...state.routines] }));
        const uid = get()._uid;
        if (uid) newRoutines.forEach((r) => fbWrite(saveRoutine, uid, r));
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

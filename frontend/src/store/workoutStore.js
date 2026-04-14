import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_ROUTINES, MOCK_WORKOUT_LOGS, MOCK_CARDIO_SESSIONS, MOCK_HYROX_SESSIONS } from '../constants/mockData';

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      routines: MOCK_ROUTINES,
      workoutLogs: MOCK_WORKOUT_LOGS,
      cardioSessions: MOCK_CARDIO_SESSIONS,
      hyroxSessions: MOCK_HYROX_SESSIONS,
      activeSession: null,

      addRoutine: (routine) =>
        set((state) => ({
          routines: [...state.routines, { ...routine, id: `r${Date.now()}` }],
        })),

      updateRoutine: (id, updates) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        })),

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
              sets: {
                ...state.activeSession?.sets,
                [exerciseId]: currentSets,
              },
            },
          };
        }),

      finishSession: (effort) =>
        set((state) => {
          if (!state.activeSession) return {};
          const duration = Math.round((Date.now() - state.activeSession.startTime) / 60000);
          const log = {
            id: `l${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            routineId: state.activeSession.routineId,
            duration,
            effort: effort || 7,
            sets: state.activeSession.sets,
          };
          return {
            workoutLogs: [log, ...state.workoutLogs],
            activeSession: null,
          };
        }),

      cancelSession: () => set({ activeSession: null }),

      addCardioSession: (session) =>
        set((state) => ({
          cardioSessions: [{ ...session, id: `c${Date.now()}` }, ...state.cardioSessions],
        })),

      addHyroxSession: (session) =>
        set((state) => ({
          hyroxSessions: [{ ...session, id: `h${Date.now()}` }, ...state.hyroxSessions],
        })),

      getExerciseHistory: (exerciseName) => {
        const { workoutLogs, routines } = get();
        const history = [];
        workoutLogs.forEach((log) => {
          const routine = routines.find((r) => r.id === log.routineId);
          if (routine) {
            const exercise = routine.exercises.find((e) => e.name === exerciseName);
            if (exercise && log.sets?.[exercise.id]) {
              log.sets[exercise.id].forEach((set) => {
                history.push({
                  date: log.date,
                  weight: set.weight,
                  reps: set.reps,
                  volume: set.weight * set.reps,
                });
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
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_DIET_TARGETS, MOCK_SUPPLEMENTS } from '../constants/mockData';

export const useDietStore = create(
  persist(
    (set) => ({
      targets: MOCK_DIET_TARGETS,
      supplements: MOCK_SUPPLEMENTS,

      updateTargets: (updates) =>
        set((state) => ({ targets: { ...state.targets, ...updates } })),

      toggleSupplement: (id) =>
        set((state) => ({
          supplements: state.supplements.map((s) =>
            s.id === id ? { ...s, taken: !s.taken } : s
          ),
        })),

      addSupplement: (supp) =>
        set((state) => ({
          supplements: [
            ...state.supplements,
            { ...supp, id: `s${Date.now()}`, taken: false },
          ],
        })),

      deleteSupplement: (id) =>
        set((state) => ({
          supplements: state.supplements.filter((s) => s.id !== id),
        })),

      applyAIDietPlan: (plan) => {
        if (!plan?.dietPlan) return;
        set((state) => ({
          targets: {
            ...state.targets,
            calories: plan.dietPlan.calories || state.targets.calories,
            protein: plan.dietPlan.protein || state.targets.protein,
            fat: plan.dietPlan.fat || state.targets.fat,
            carbs: plan.dietPlan.carbs || state.targets.carbs,
          },
        }));
      },
    }),
    {
      name: 'diet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

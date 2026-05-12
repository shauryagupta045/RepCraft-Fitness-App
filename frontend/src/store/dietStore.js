import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDietData, updateDietData, getSupplements, saveSupplements } from '../services/userService';

/** Fire-and-forget Firebase write */
function fbWrite(fn, ...args) {
  fn(...args).catch((e) => console.warn('[dietStore] Firebase write failed:', e.message));
}

const EMPTY_TARGETS = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
};

export const useDietStore = create(
  persist(
    (set, get) => ({
      targets: EMPTY_TARGETS,
      supplements: [],
      mealLog: [],
      _uid: null,

      setUid: (uid) => set({ _uid: uid }),

      /** Load diet targets and supplements from Firebase on login */
      loadFromFirebase: async (uid) => {
        try {
          const [dietData, supplements] = await Promise.all([
            getDietData(uid),
            getSupplements(uid),
          ]);
          const targets = dietData
            ? {
                calories: dietData.targetCalories ?? 0,
                protein: dietData.targetProtein ?? 0,
                carbs: dietData.targetCarbs ?? 0,
                fat: dietData.targetFat ?? 0,
                fiber: dietData.targetFiber ?? 0,
              }
            : EMPTY_TARGETS;
          set({ targets, supplements: supplements || [], _uid: uid });
        } catch (e) {
          console.warn('[dietStore] loadFromFirebase error:', e.message);
        }
      },

      /** Reset on logout */
      resetStore: () =>
        set({ targets: EMPTY_TARGETS, supplements: [], mealLog: [], _uid: null }),

      updateTargets: (updates) => {
        set((state) => {
          const targets = { ...state.targets, ...updates };
          const uid = state._uid;
          if (uid) {
            fbWrite(updateDietData, uid, {
              targetCalories: targets.calories,
              targetProtein: targets.protein,
              targetCarbs: targets.carbs,
              targetFat: targets.fat,
              targetFiber: targets.fiber,
            });
          }
          return { targets };
        });
      },

      toggleSupplement: (id) =>
        set((state) => {
          const supplements = state.supplements.map((s) =>
            s.id === id ? { ...s, taken: !s.taken } : s
          );
          const uid = state._uid;
          if (uid) fbWrite(saveSupplements, uid, supplements);
          return { supplements };
        }),

      addSupplement: (supp) =>
        set((state) => {
          const supplements = [...state.supplements, { ...supp, id: `s${Date.now()}`, taken: false }];
          const uid = state._uid;
          if (uid) fbWrite(saveSupplements, uid, supplements);
          return { supplements };
        }),

      deleteSupplement: (id) =>
        set((state) => {
          const supplements = state.supplements.filter((s) => s.id !== id);
          const uid = state._uid;
          if (uid) fbWrite(saveSupplements, uid, supplements);
          return { supplements };
        }),

      addMeal: (meal) =>
        set((state) => ({
          mealLog: [...state.mealLog, { ...meal, id: `m${Date.now()}` }],
        })),

      applyAIDietPlan: (plan) => {
        if (!plan?.dietPlan) return;
        set((state) => {
          const targets = {
            ...state.targets,
            calories: plan.dietPlan.calories || state.targets.calories,
            protein: plan.dietPlan.protein || state.targets.protein,
            fat: plan.dietPlan.fat || state.targets.fat,
            carbs: plan.dietPlan.carbs || state.targets.carbs,
            fiber: plan.dietPlan.fiber || state.targets.fiber,
          };
          const uid = state._uid;
          if (uid) {
            fbWrite(updateDietData, uid, {
              targetCalories: targets.calories,
              targetProtein: targets.protein,
              targetCarbs: targets.carbs,
              targetFat: targets.fat,
              targetFiber: targets.fiber,
            });
          }
          return { targets };
        });
      },
    }),
    {
      name: 'diet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

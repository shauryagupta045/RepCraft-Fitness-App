import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER } from '../constants/mockData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: { ...MOCK_USER, streak: 0 },
      isAuthenticated: false,
      lastActivityDate: null,
      showStreakAnimation: false,
      settings: {
        units: 'metric',
        notifications: {
          daily: true,
          workouts: true,
          diet: true,
        }
      },
      
      // Called after successful Firebase Auth
      setUser: (firebaseUser) => {
        set({ 
          user: { 
            ...MOCK_USER, 
            streak: 0, // Fresh user starts at 0
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
          }, 
          isAuthenticated: true 
        });
      },

      login: async (phoneNumber) => {
        const userData = { ...MOCK_USER, streak: 0, phoneNumber };
        set({ user: userData, isAuthenticated: true });
        // Trigger streak increment on login
        get().incrementStreak();
        return { success: true };
      },

      incrementStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastActivityDate;
        const currentUser = get().user;

        if (lastDate !== today) {
          const newStreak = (currentUser?.streak || 0) + 1;
          set((state) => ({
            user: { ...state.user, streak: newStreak },
            lastActivityDate: today,
            showStreakAnimation: true
          }));
          
          // Auto-hide animation state after 3 seconds
          setTimeout(() => {
            set({ showStreakAnimation: false });
          }, 3000);
        }
      },

      dismissStreakAnimation: () => set({ showStreakAnimation: false }),

      logout: () => set({ user: null, isAuthenticated: false, lastActivityDate: null }),
      updateProfile: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { 
          ...state.settings, 
          ...newSettings,
          notifications: {
            ...state.settings.notifications,
            ...(newSettings.notifications || {})
          }
        } 
      })),
      toggleUnits: () => set((state) => {
        const isMetric = state.settings.units === 'metric';
        const newUnits = isMetric ? 'imperial' : 'metric';
        const user = state.user;
        
        if (!user) return { settings: { ...state.settings, units: newUnits } };

        // Convert weight: kg <-> lbs (1 kg = 2.20462 lbs)
        const weight = isMetric 
          ? +(user.weight * 2.20462).toFixed(1) 
          : +(user.weight / 2.20462).toFixed(1);
        
        // Convert height: cm <-> in (1 cm = 0.393701 in)
        const height = isMetric 
          ? +(user.height * 0.393701).toFixed(1) 
          : +(user.height / 0.393701).toFixed(1);

        return {
          settings: { ...state.settings, units: newUnits },
          user: { ...user, weight, height }
        };
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

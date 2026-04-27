import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER } from '../constants/mockData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: MOCK_USER,
      isAuthenticated: true,
      settings: {
        units: 'metric', // 'metric' or 'imperial'
        notifications: {
          daily: true,
          workouts: true,
          diet: true,
        }
      },
      login: (userData) => set({ user: { ...MOCK_USER, ...userData }, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
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

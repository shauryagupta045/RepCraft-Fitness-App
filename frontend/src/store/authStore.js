import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER } from '../constants/mockData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: MOCK_USER,
      isAuthenticated: true,
      login: (userData) => set({ user: { ...MOCK_USER, ...userData }, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

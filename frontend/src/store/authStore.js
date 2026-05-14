import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeUserData,
  getUserProfile,
  updateUserProfile,
  updateStats,
} from '../services/userService';
import { setNutritionUid } from './nutritionStore';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

// Lazy imports to avoid circular deps — resolved at call-time
const getWorkoutStore = () => require('./workoutStore').useWorkoutStore;
const getAIStore = () => require('./aiStore').useAIStore;
const getMetricsStore = () => require('./metricsStore').useMetricsStore;
const getDietStore = () => require('./dietStore').useDietStore;

// Default empty profile shape
const DEFAULT_USER = {
  uid: null,
  email: '',
  name: '',
  profile: {
    height: 0,
    weight: 0,
    age: 0,
    gender: '',
    activityLevel: '',
    goal: '',
  },
  preferences: {
    units: 'metric',
    theme: 'light',
    notifications: true,
  },
  stats: {
    totalWorkouts: 0,
    totalCalories: 0,
    streak: 0,
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivityDate: null,
      showStreakAnimation: false,

      // ─── Load all other stores from Firebase ──────────────────────────────
      loadAllUserData: async (uid) => {
        console.log('[authStore] loadAllUserData start for:', uid);
        // Set uid on nutritionStore (module-level singleton)
        setNutritionUid(uid);

        // Set uid on Zustand stores and trigger their Firebase loads in parallel
        const workout = getWorkoutStore().getState();
        const ai = getAIStore().getState();
        const metrics = getMetricsStore().getState();
        const diet = getDietStore().getState();

        workout.setUid(uid);
        ai.setUid(uid);
        metrics.setUid(uid);
        diet.setUid(uid);

        console.log('[authStore] Triggering parallel store loads...');
        const results = await Promise.allSettled([
          workout.loadFromFirebase(uid),
          ai.loadFromFirebase(uid),
          metrics.loadFromFirebase(uid),
          diet.loadFromFirebase(uid),
        ]);
        console.log('[authStore] Parallel loads finished:', results.map(r => r.status));
      },

      // ─── setUser — called after Firebase Auth success ─────────────────────
      setUser: async (firebaseUser, isNewUser = false) => {
        console.log('[authStore] setUser called:', firebaseUser.uid, 'isNewUser:', isNewUser);
        set({ isLoading: true });
        try {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL,
            profile: { ...DEFAULT_USER.profile },
            preferences: { ...DEFAULT_USER.preferences },
            streak: 0,
          };

          // Initialize Firestore docs for brand-new users (idempotent)
          try {
            if (isNewUser) {
              console.log('[authStore] Initializing new user data in Firestore...');
              await initializeUserData(firebaseUser.uid, firebaseUser.displayName || '');
            }
            
            // Fetch Profile and Stats in parallel
            const [profile, stats] = await Promise.all([
              getUserProfile(firebaseUser.uid),
              require('../services/userService').getStats(firebaseUser.uid)
            ]);

            if (profile) {
              userData.profile = {
                height: profile.height || 0,
                weight: profile.weight || 0,
                age: profile.age || 0,
                gender: profile.gender || '',
                activityLevel: profile.activityLevel || '',
                goal: profile.goal || '',
              };
              userData.name = profile.displayName || userData.name;
              userData.preferences = {
                ...userData.preferences,
                ...(profile.preferences || {}),
              };
            }

            if (stats) {
              userData.streak = stats.streak || 0;
              set({ lastActivityDate: stats.lastActivityDate || null });
            }
          } catch (firestoreError) {
            console.error('[authStore] Firestore data fetch failed:', firestoreError.message);
          }

          // Populate all other stores from Firebase (BLOCKING to ensure data consistency)
          await get().loadAllUserData(firebaseUser.uid);

          console.log('[authStore] setUser success, setting state');
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('[authStore] Error in setUser:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      // ─── login — for onboarding / guest flow ──────────────────────────────
      login: (userData) => {
        console.log('[authStore] login called with:', userData);
        const currentUid = get().user?.uid;
        
        set({
          user: {
            uid: userData.uid || currentUid || null,
            email: userData.email || '',
            name: userData.name || 'User',
            photoURL: userData.photoURL || null,
            profile: {
              ...DEFAULT_USER.profile,
              goal: userData.goal || '',
              height: userData.height || 0,
              weight: userData.weight || 0,
              activityLevel: userData.experience || '',
            },
            preferences: { ...DEFAULT_USER.preferences },
            streak: 0,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        const finalUid = userData.uid || currentUid;
        if (finalUid) {
          console.log('[authStore] login triggering data load for:', finalUid);
          get().loadAllUserData(finalUid).catch(() => {});
        }
      },

      // ─── updateProfile ────────────────────────────────────────────────────
      updateProfile: async (profileUpdates) => {
        const { user } = get();
        if (!user || !user.uid) return;
        try {
          set({ isLoading: true });
          await updateUserProfile(user.uid, profileUpdates);
          const updatedUser = {
            ...user,
            profile: { ...(user.profile || {}), ...profileUpdates },
            name: profileUpdates.displayName || user.name,
          };
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ─── incrementStreak ──────────────────────────────────────────────────
      incrementStreak: async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastActivityDate;
        const currentUser = get().user;

        if (lastDate !== today && currentUser) {
          const newStreak = (currentUser.streak || 0) + 1;

          set((state) => ({
            user: { ...state.user, streak: newStreak },
            lastActivityDate: today,
            showStreakAnimation: true,
          }));

          // Persist streak to both profile and stats
          try {
            await Promise.all([
              updateUserProfile(currentUser.uid, { streak: newStreak }),
              updateStats(currentUser.uid, { streak: newStreak, lastActivityDate: today }),
            ]);
          } catch (e) {
            console.warn('[authStore] Failed to persist streak:', e.message);
          }

          setTimeout(() => set({ showStreakAnimation: false }), 3000);
        }
      },

      dismissStreakAnimation: () => set({ showStreakAnimation: false }),

      // ─── logout — reset all stores ────────────────────────────────────────
      logout: async () => {
        // Reset all other stores first
        try {
          getWorkoutStore().getState().resetStore();
          getAIStore().getState().resetStore();
          getMetricsStore().getState().resetStore();
          getDietStore().getState().resetStore();
          setNutritionUid(null);
          
          // Sign out from Firebase
          await signOut(auth);
        } catch (e) {
          console.warn('[authStore] Error resetting stores on logout:', e.message);
        }

        set({
          user: null,
          isAuthenticated: false,
          lastActivityDate: null,
          error: null,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // ─── settings ─────────────────────────────────────────────────────────
      updateSettings: async (updates) => {
        const { user } = get();
        if (!user) return;
        const newPrefs = { ...user.preferences, ...updates };
        set((state) => ({
          user: { ...state.user, preferences: newPrefs }
        }));
        // Persist to Firebase (optional, but good practice)
        try {
          await updateUserProfile(user.uid, { preferences: newPrefs });
        } catch (e) {
          console.warn('[authStore] Failed to persist settings:', e.message);
        }
      },

      toggleUnits: async () => {
        const { user } = get();
        if (!user) return;
        const currentUnits = user.preferences?.units || 'metric';
        const newUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
        
        // Basic conversion logic for profile values if needed
        let { height, weight } = user.profile;
        if (newUnits === 'imperial') {
          // metric -> imperial
          height = Math.round(height / 2.54); // cm -> in
          weight = Math.round(weight * 2.20462); // kg -> lb
        } else {
          // imperial -> metric
          height = Math.round(height * 2.54); // in -> cm
          weight = Math.round(weight / 2.20462); // lb -> kg
        }

        const newPrefs = { ...user.preferences, units: newUnits };
        set((state) => ({
          user: { 
            ...state.user, 
            preferences: newPrefs,
            profile: { ...state.user.profile, height, weight }
          }
        }));

        try {
          await updateUserProfile(user.uid, { 
            preferences: newPrefs,
            height,
            weight
          });
        } catch (e) {
          console.warn('[authStore] Failed to persist unit toggle:', e.message);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFoodLog as fbGetFoodLog,
  saveFoodLog as fbSaveFoodLog,
  getSupplements as fbGetSupplements,
  saveSupplements as fbSaveSupplements,
  getUserProfile as fbGetUserProfile,
  updateUserProfile as fbUpdateUserProfile,
} from '../services/userService';

/**
 * RepCraft Nutrition Store — Persistent storage for food logs, profiles, and history.
 * Primary source of truth: Firebase Firestore.
 * AsyncStorage used as local cache / offline fallback.
 */

const KEYS = {
  PROFILE: 'repcraft_user_profile',
  FOOD_LOG_PREFIX: 'repcraft_food_log_',
  RECENT_FOODS: 'repcraft_recent_foods',
  SCANNED_HISTORY: 'repcraft_scanned_history',
  SUPPLEMENTS: 'repcraft_supplements',
};

// Current logged-in user id — set by authStore after login
let _currentUid = null;
export const setNutritionUid = (uid) => { _currentUid = uid; };

// ─── Utilities ────────────────────────────────────────────────────────────────

export const getDateKey = (date) => {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Compute totals from a meals array */
function computeTotals(meals = []) {
  let cal = 0, p = 0, c = 0, f = 0, fib = 0;
  meals.forEach((m) => {
    cal += m.calories || 0;
    p += m.protein || 0;
    c += m.carbs || 0;
    f += m.fat || 0;
    fib += m.fiber || 0;
  });
  return { totalCalories: cal, totalProtein: p, totalCarbs: c, totalFat: f, totalFiber: fib };
}

// ─── Supplements ──────────────────────────────────────────────────────────────

export const loadSupplements = async () => {
  // Try Firebase first (requires login)
  if (_currentUid) {
    try {
      const supps = await fbGetSupplements(_currentUid);
      if (supps !== null) {
        // Also cache locally
        await AsyncStorage.setItem(KEYS.SUPPLEMENTS, JSON.stringify(supps));
        return supps;
      }
    } catch (e) {
      console.warn('[nutritionStore] loadSupplements Firebase error:', e.message);
    }
  }
  // Fallback: local cache
  try {
    const data = await AsyncStorage.getItem(KEYS.SUPPLEMENTS);
    return data ? JSON.parse(data) : []; // Return empty — no hardcoded defaults
  } catch (e) {
    return [];
  }
};

export const toggleSupplement = async (id) => {
  try {
    const supps = await loadSupplements();
    const updated = supps.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s));
    await AsyncStorage.setItem(KEYS.SUPPLEMENTS, JSON.stringify(updated));
    if (_currentUid) fbSaveSupplements(_currentUid, updated).catch(() => {});
    return updated;
  } catch (e) {
    return [];
  }
};

// ─── User Profile & Targets ───────────────────────────────────────────────────

const EMPTY_PROFILE = {
  name: '',
  targets: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  metrics: {},
};

export const loadUserProfile = async () => {
  // Try Firebase first
  if (_currentUid) {
    try {
      const profile = await fbGetUserProfile(_currentUid);
      if (profile) {
        const mapped = {
          name: profile.displayName || '',
          targets: {
            calories: profile.targetCalories || 0,
            protein: profile.targetProtein || 0,
            carbs: profile.targetCarbs || 0,
            fat: profile.targetFat || 0,
            fiber: profile.targetFiber || 0,
          },
          metrics: {
            weight: profile.weight || 0,
            height: profile.height || 0,
            age: profile.age || 0,
            goal: profile.goal || '',
            activityLevel: profile.activityLevel || '',
          },
        };
        await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('[nutritionStore] loadUserProfile Firebase error:', e.message);
    }
  }
  // Fallback: local cache
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : EMPTY_PROFILE;
  } catch (e) {
    return EMPTY_PROFILE;
  }
};

export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    if (_currentUid) {
      await fbUpdateUserProfile(_currentUid, {
        displayName: profile.name,
        targetCalories: profile.targets?.calories,
        targetProtein: profile.targets?.protein,
        targetCarbs: profile.targets?.carbs,
        targetFat: profile.targets?.fat,
        targetFiber: profile.targets?.fiber,
        ...(profile.metrics || {}),
      });
    }
  } catch (e) {
    console.error('[nutritionStore] Error saving profile:', e.message);
  }
};

// ─── Daily Food Log ───────────────────────────────────────────────────────────

export const loadFoodLog = async (dateKey) => {
  // Try Firebase first
  if (_currentUid) {
    try {
      const data = await fbGetFoodLog(_currentUid, dateKey);
      if (data) {
        const log = { meals: data.meals || [], waterGlasses: data.waterGlasses || 0 };
        await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify(log));
        return { ...log, ...computeTotals(log.meals) };
      }
    } catch (e) {
      console.warn('[nutritionStore] loadFoodLog Firebase error:', e.message);
    }
  }
  // Fallback: local cache
  try {
    const data = await AsyncStorage.getItem(KEYS.FOOD_LOG_PREFIX + dateKey);
    const log = data ? JSON.parse(data) : { meals: [], waterGlasses: 0 };
    return { ...log, ...computeTotals(log.meals) };
  } catch (e) {
    return { meals: [], waterGlasses: 0, ...computeTotals([]) };
  }
};

export const addFoodEntry = async (dateKey, entry) => {
  try {
    const log = await loadFoodLog(dateKey);
    const newEntry = { ...entry, id: Date.now().toString() };
    const meals = [...log.meals, newEntry];
    const updated = { meals, waterGlasses: log.waterGlasses };

    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify(updated));
    if (_currentUid) fbSaveFoodLog(_currentUid, dateKey, updated).catch(() => {});

    await updateRecentFoods(newEntry);
    return { ...updated, ...computeTotals(meals) };
  } catch (e) {
    console.error('[nutritionStore] Error adding food entry:', e.message);
  }
};

export const deleteFoodEntry = async (dateKey, entryId) => {
  try {
    const log = await loadFoodLog(dateKey);
    const meals = log.meals.filter((m) => m.id !== entryId);
    const updated = { meals, waterGlasses: log.waterGlasses };

    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify(updated));
    if (_currentUid) fbSaveFoodLog(_currentUid, dateKey, updated).catch(() => {});

    return { ...updated, ...computeTotals(meals) };
  } catch (e) {
    console.error('[nutritionStore] Error deleting food entry:', e.message);
  }
};

export const updateWater = async (dateKey, glasses) => {
  try {
    const log = await loadFoodLog(dateKey);
    const updated = { meals: log.meals, waterGlasses: Math.max(0, glasses) };

    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify(updated));
    if (_currentUid) fbSaveFoodLog(_currentUid, dateKey, updated).catch(() => {});

    return { ...updated, ...computeTotals(updated.meals) };
  } catch (e) {
    console.error('[nutritionStore] Error updating water:', e.message);
  }
};

// ─── History & Recents ────────────────────────────────────────────────────────

export const loadRecentFoods = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECENT_FOODS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const updateRecentFoods = async (food) => {
  try {
    let recents = await loadRecentFoods();
    recents = recents.filter((r) => r.foodId !== food.foodId);
    recents.unshift(food);
    await AsyncStorage.setItem(KEYS.RECENT_FOODS, JSON.stringify(recents.slice(0, 20)));
  } catch (e) {}
};

export const loadScannedHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCANNED_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveScannedItem = async (item) => {
  try {
    let history = await loadScannedHistory();
    history = history.filter((h) => h.barcode !== item.barcode);
    history.unshift(item);
    await AsyncStorage.setItem(KEYS.SCANNED_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {}
};

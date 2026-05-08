import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * RepCraft Nutrition Store — Persistent storage for food logs, profiles, and history.
 */

const KEYS = {
  PROFILE: 'repcraft_user_profile',
  FOOD_LOG_PREFIX: 'repcraft_food_log_',
  RECENT_FOODS: 'repcraft_recent_foods',
  SCANNED_HISTORY: 'repcraft_scanned_history',
  SUPPLEMENTS: 'repcraft_supplements',
};

// --- Utilities ---

// --- Supplements ---

export const loadSupplements = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SUPPLEMENTS);
    return data ? JSON.parse(data) : [
      { id: 's1', name: 'Creatine', time: '08:00', taken: false, dose: '5g' },
      { id: 's2', name: 'Whey Protein', time: '13:00', taken: false, dose: '30g' },
      { id: 's3', name: 'Vitamin D3', time: '08:00', taken: false, dose: '2000IU' },
      { id: 's4', name: 'Omega-3', time: '20:00', taken: false, dose: '1g' },
      { id: 's5', name: 'Magnesium', time: '22:00', taken: false, dose: '400mg' },
    ];
  } catch (e) {
    return [];
  }
};

export const toggleSupplement = async (id) => {
  try {
    const supps = await loadSupplements();
    const updated = supps.map(s => s.id === id ? { ...s, taken: !s.taken } : s);
    await AsyncStorage.setItem(KEYS.SUPPLEMENTS, JSON.stringify(updated));
    return updated;
  } catch (e) {}
};

export const getDateKey = (date) => {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// --- User Profile & Targets ---

export const loadUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : {
      name: 'Alex Jordan',
      targets: { calories: 2400, protein: 180, carbs: 260, fat: 70, fiber: 35 },
      metrics: { weight: 82, height: 180, age: 28, goal: 'Build Muscle', activityLevel: 'Moderate' }
    };
  } catch (e) {
    console.error('Error loading profile', e);
    return {};
  }
};

export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
};

// --- Daily Food Log ---

export const loadFoodLog = async (dateKey) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FOOD_LOG_PREFIX + dateKey);
    const log = data ? JSON.parse(data) : { meals: [], waterGlasses: 0 };
    
    // Calculate totals
    let cal = 0, p = 0, c = 0, f = 0, fib = 0;
    log.meals.forEach(m => {
      cal += m.calories || 0;
      p += m.protein || 0;
      c += m.carbs || 0;
      f += m.fat || 0;
      fib += m.fiber || 0;
    });

    return {
      ...log,
      totalCalories: cal,
      totalProtein: p,
      totalCarbs: c,
      totalFat: f,
      totalFiber: fib,
    };
  } catch (e) {
    console.error('Error loading food log', e);
    return { meals: [], waterGlasses: 0, totalCalories: 0 };
  }
};

export const addFoodEntry = async (dateKey, entry) => {
  try {
    const log = await loadFoodLog(dateKey);
    const newEntry = { ...entry, id: Date.now().toString() };
    log.meals.push(newEntry);
    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify({
      meals: log.meals,
      waterGlasses: log.waterGlasses
    }));
    
    // Update recent foods
    await updateRecentFoods(newEntry);
    
    return await loadFoodLog(dateKey);
  } catch (e) {
    console.error('Error adding food entry', e);
  }
};

export const deleteFoodEntry = async (dateKey, entryId) => {
  try {
    const log = await loadFoodLog(dateKey);
    log.meals = log.meals.filter(m => m.id !== entryId);
    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify({
      meals: log.meals,
      waterGlasses: log.waterGlasses
    }));
    return await loadFoodLog(dateKey);
  } catch (e) {
    console.error('Error deleting food entry', e);
  }
};

export const updateWater = async (dateKey, glasses) => {
  try {
    const log = await loadFoodLog(dateKey);
    const updated = { ...log, waterGlasses: Math.max(0, glasses) };
    await AsyncStorage.setItem(KEYS.FOOD_LOG_PREFIX + dateKey, JSON.stringify({
      meals: updated.meals,
      waterGlasses: updated.waterGlasses
    }));
    return updated;
  } catch (e) {
    console.error('Error updating water', e);
  }
};

// --- History & Recents ---

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
    // Remove if already exists (to move to top)
    recents = recents.filter(r => r.foodId !== food.foodId);
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
    history = history.filter(h => h.barcode !== item.barcode);
    history.unshift(item);
    await AsyncStorage.setItem(KEYS.SCANNED_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {}
};

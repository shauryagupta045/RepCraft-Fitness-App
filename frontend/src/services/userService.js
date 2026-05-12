/**
 * userService.js
 * Centralised Firebase Firestore read/write operations for all user data.
 *
 * Schema:
 *   users/{uid}/profile/current
 *   users/{uid}/stats/current
 *   users/{uid}/diet/current
 *   users/{uid}/supplements/current
 *   users/{uid}/ai/current
 *   users/{uid}/routines/{routineId}          (sub-collection)
 *   users/{uid}/cardio/{sessionId}            (sub-collection)
 *   users/{uid}/hyrox/{sessionId}             (sub-collection)
 *   users/{uid}/workoutLogs/{logId}           (sub-collection)
 *   users/{uid}/foodLog/{dateKey}             (sub-collection)
 */

import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from './firebase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userRef = (uid) => doc(db, 'users', uid);
const subDoc = (uid, sub, id) => doc(db, 'users', uid, sub, id);
const subCol = (uid, sub) => collection(db, 'users', uid, sub);

/** Fetch a document; returns data object or null */
async function fetchDoc(ref) {
  try {
    console.log('[userService] Fetching doc:', ref.path);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    console.log('[userService] Fetch result:', ref.path, data ? 'Found' : 'Not Found');
    return data;
  } catch (e) {
    console.error('[userService] fetchDoc error:', ref.path, e.message);
    return null;
  }
}

/** Fetch all docs in a sub-collection; returns array of { id, ...data } */
async function fetchCollection(colRef) {
  try {
    console.log('[userService] Fetching collection:', colRef.path);
    const snap = await getDocs(colRef);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log('[userService] Fetch collection result:', colRef.path, 'Count:', data.length);
    return data;
  } catch (e) {
    console.error('[userService] fetchCollection error:', colRef.path, e.message);
    return [];
  }
}

// ─── Initialisation ────────────────────────────────────────────────────────────

/**
 * Creates all required sub-documents for a brand-new user.
 * Safe to call multiple times — skips if profile/current already exists.
 */
export async function initializeUserData(uid, displayName = '') {
  try {
    const profileRef = subDoc(uid, 'profile', 'current');
    const existing = await getDoc(profileRef);
    if (existing.exists()) return; // Don't overwrite existing data

    const now = serverTimestamp();
    const batch = [
      setDoc(profileRef, {
        displayName: displayName || '',
        goal: '',
        activityLevel: '',
        weight: 0,
        height: 0,
        age: 0,
        createdAt: now,
        updatedAt: now,
      }),
      setDoc(subDoc(uid, 'stats', 'current'), {
        streak: 0,
        lastActivityDate: null,
        readinessScore: 0,
        stepCount: 0,
        dailyCalories: 0,
        waterIntakeMl: 0,
        sleepHours: 0,
        updatedAt: now,
      }),
      setDoc(subDoc(uid, 'diet', 'current'), {
        targetCalories: 0,
        targetProtein: 0,
        targetCarbs: 0,
        targetFat: 0,
        targetFiber: 0,
        updatedAt: now,
      }),
      setDoc(subDoc(uid, 'supplements', 'current'), {
        supplements: [],
        updatedAt: now,
      }),
      setDoc(subDoc(uid, 'ai', 'current'), {
        chatHistory: [],
        lastAnalyzedAt: null,
        updatedAt: now,
      }),
    ];
    await Promise.all(batch);
    console.log('[userService] New user initialized:', uid);
  } catch (e) {
    console.error('[userService] initializeUserData error:', e.message);
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  return fetchDoc(subDoc(uid, 'profile', 'current'));
}

export async function updateUserProfile(uid, updates) {
  try {
    const ref = subDoc(uid, 'profile', 'current');
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error('[userService] updateUserProfile error:', e.message);
    throw e;
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(uid) {
  return fetchDoc(subDoc(uid, 'stats', 'current'));
}

export async function updateStats(uid, updates) {
  try {
    const ref = subDoc(uid, 'stats', 'current');
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] updateStats error:', e.message);
  }
}

// ─── Diet Targets ─────────────────────────────────────────────────────────────

export async function getDietData(uid) {
  return fetchDoc(subDoc(uid, 'diet', 'current'));
}

export async function updateDietData(uid, updates) {
  try {
    const ref = subDoc(uid, 'diet', 'current');
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] updateDietData error:', e.message);
  }
}

// ─── Supplements ──────────────────────────────────────────────────────────────

export async function getSupplements(uid) {
  const data = await fetchDoc(subDoc(uid, 'supplements', 'current'));
  return data?.supplements ?? [];
}

export async function saveSupplements(uid, supplements) {
  try {
    const ref = subDoc(uid, 'supplements', 'current');
    await setDoc(ref, { supplements, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] saveSupplements error:', e.message);
  }
}

// ─── Food Log (per day) ───────────────────────────────────────────────────────

export async function getFoodLog(uid, dateKey) {
  return fetchDoc(subDoc(uid, 'foodLog', dateKey));
}

export async function saveFoodLog(uid, dateKey, data) {
  try {
    const ref = subDoc(uid, 'foodLog', dateKey);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] saveFoodLog error:', e.message);
  }
}

// ─── Routines (sub-collection) ────────────────────────────────────────────────

export async function getRoutines(uid) {
  return fetchCollection(subCol(uid, 'routines'));
}

export async function saveRoutine(uid, routine) {
  try {
    const ref = subDoc(uid, 'routines', routine.id);
    console.log('[userService] Saving routine:', ref.path, routine.title);
    await setDoc(ref, { ...routine, updatedAt: serverTimestamp() }, { merge: true });
    console.log('[userService] Routine saved successfully');
  } catch (e) {
    console.error('[userService] saveRoutine error:', e.message);
  }
}

export async function deleteRoutine(uid, routineId) {
  try {
    await deleteDoc(subDoc(uid, 'routines', routineId));
  } catch (e) {
    console.warn('[userService] deleteRoutine error:', e.message);
  }
}

// ─── Cardio Sessions ──────────────────────────────────────────────────────────

export async function getCardioSessions(uid) {
  return fetchCollection(subCol(uid, 'cardio'));
}

export async function saveCardioSession(uid, session) {
  try {
    const id = session.id || `cardio_${Date.now()}`;
    const ref = subDoc(uid, 'cardio', id);
    await setDoc(ref, { ...session, id, savedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] saveCardioSession error:', e.message);
  }
}

// ─── Hyrox Sessions ───────────────────────────────────────────────────────────

export async function getHyroxSessions(uid) {
  return fetchCollection(subCol(uid, 'hyrox'));
}

export async function saveHyroxSession(uid, session) {
  try {
    const id = session.id || `hyrox_${Date.now()}`;
    const ref = subDoc(uid, 'hyrox', id);
    await setDoc(ref, { ...session, id, savedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] saveHyroxSession error:', e.message);
  }
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function getWorkoutLogs(uid) {
  return fetchCollection(subCol(uid, 'workoutLogs'));
}

export async function saveWorkoutLog(uid, log) {
  try {
    const id = log.id || `log_${Date.now()}`;
    const ref = subDoc(uid, 'workoutLogs', id);
    await setDoc(ref, { ...log, id, savedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('[userService] saveWorkoutLog error:', e.message);
  }
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export async function getAIChat(uid) {
  const data = await fetchDoc(subDoc(uid, 'ai', 'current'));
  return data?.chatHistory ?? [];
}

export async function saveAIChat(uid, chatHistory) {
  try {
    const ref = subDoc(uid, 'ai', 'current');
    await setDoc(
      ref,
      { chatHistory, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.warn('[userService] saveAIChat error:', e.message);
  }
}

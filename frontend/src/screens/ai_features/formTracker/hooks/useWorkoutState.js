import { useState, useCallback, useRef } from 'react';

const INITIAL_STATE = {
  exercise: 'pushup',
  reps: 0,
  stage: null,
  holdTime: 0,
  feedback: [],
  goodForm: true,
  sessionStartTime: null,
  isActive: false,
};

/**
 * useWorkoutState — central state manager for an active workout session.
 *
 * Returns: { ...state, startSession, endSession, resetReps, switchExercise, updateFromAnalysis }
 */
export default function useWorkoutState() {
  const [state, setState] = useState(INITIAL_STATE);
  const plankTimerRef = useRef(null);

  // ── Actions ──────────────────────────────────────────────────────────────

  const startSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionStartTime: new Date(),
      isActive: true,
    }));
  }, []);

  const endSession = useCallback(() => {
    clearInterval(plankTimerRef.current);
    let summary;
    setState(prev => {
      summary = {
        exercise: prev.exercise,
        reps: prev.reps,
        holdTime: prev.holdTime,
        duration: prev.sessionStartTime
          ? Math.round((Date.now() - prev.sessionStartTime.getTime()) / 1000)
          : 0,
        endedAt: new Date(),
      };
      return { ...prev, isActive: false };
    });
    return summary;
  }, []);

  const resetReps = useCallback(() => {
    clearInterval(plankTimerRef.current);
    setState(prev => ({
      ...prev,
      reps: 0,
      stage: null,
      holdTime: 0,
      feedback: [],
      goodForm: true,
    }));
  }, []);

  const switchExercise = useCallback((name) => {
    clearInterval(plankTimerRef.current);
    setState(prev => ({
      ...INITIAL_STATE,
      sessionStartTime: prev.sessionStartTime,
      isActive: prev.isActive,
      exercise: name,
    }));
  }, []);

  /**
   * Receive the result object from an exercise analyser and update state.
   * Also drives the plank hold-time timer.
   */
  const updateFromAnalysis = useCallback((result) => {
    if (!result) return;
    setState(prev => ({
      ...prev,
      reps:      result.reps     ?? prev.reps,
      holdTime:  result.holdTime ?? prev.holdTime,
      stage:     result.stage    ?? prev.stage,
      feedback:  result.feedback ?? [],
      goodForm:  result.goodForm ?? true,
    }));
  }, []);

  // Plank hold-time ticker — started externally by FormTrackerScreen
  const startPlankTimer = useCallback(() => {
    clearInterval(plankTimerRef.current);
    plankTimerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        holdTime: prev.holdTime + 1,
      }));
    }, 1000);
  }, []);

  const stopPlankTimer = useCallback(() => {
    clearInterval(plankTimerRef.current);
  }, []);

  return {
    ...state,
    startSession,
    endSession,
    resetReps,
    switchExercise,
    updateFromAnalysis,
    startPlankTimer,
    stopPlankTimer,
  };
}

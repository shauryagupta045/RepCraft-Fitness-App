import { calculateAngle, getLandmark } from '../utils/poseUtils';
import { LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST } from '../constants/landmarks';

// Keep a rolling window of shoulder Y positions to detect shoulder raise
const shoulderYHistory = [];
const HISTORY_SIZE = 10;

/**
 * Analyse a bicep curl frame.
 */
export default function analyzeBicepCurl(landmarks, stateRef) {
  const state = stateRef.current;

  const ls = getLandmark(landmarks, LEFT_SHOULDER);
  const le = getLandmark(landmarks, LEFT_ELBOW);
  const lw = getLandmark(landmarks, LEFT_WRIST);

  if (!ls || !le || !lw) {
    return { reps: state.reps, stage: state.stage, feedback: [], goodForm: true, jointColors: {} };
  }

  const elbowAngle = calculateAngle(ls, le, lw);

  let { reps, stage } = state;
  if (elbowAngle > 155) stage = 'down';
  if (elbowAngle < 45 && stage === 'down') { stage = 'up'; reps += 1; }

  // Track shoulder Y variance
  shoulderYHistory.push(ls.y);
  if (shoulderYHistory.length > HISTORY_SIZE) shoulderYHistory.shift();

  const feedback = [];
  let elbowBad = false;

  if (shoulderYHistory.length === HISTORY_SIZE) {
    const mean = shoulderYHistory.reduce((a, b) => a + b, 0) / HISTORY_SIZE;
    const variance = shoulderYHistory.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / HISTORY_SIZE;
    if (variance > 0.03) {
      feedback.push("Keep your elbow pinned — shoulder is moving");
      elbowBad = true;
    }
  }

  // z-axis wrist check (depth); MediaPipe provides z as relative depth
  if (typeof lw.z === 'number' && typeof le.z === 'number' && lw.z < le.z - 0.1) {
    feedback.push("Keep your wrist straight");
    elbowBad = true;
  }

  const jointColors = {
    [LEFT_ELBOW]: elbowBad ? 'bad' : 'good',
  };

  return { reps, stage, feedback, goodForm: feedback.length === 0, jointColors };
}

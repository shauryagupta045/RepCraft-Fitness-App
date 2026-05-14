import { calculateAngle, getLandmark } from '../utils/poseUtils';
import {
  LEFT_HIP, LEFT_KNEE, LEFT_ANKLE,
  RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE,
  LEFT_SHOULDER,
} from '../constants/landmarks';

/**
 * Analyse a squat frame.
 */
export default function analyzeSquat(landmarks, stateRef) {
  const state = stateRef.current;

  const lh  = getLandmark(landmarks, LEFT_HIP);
  const lk  = getLandmark(landmarks, LEFT_KNEE);
  const la  = getLandmark(landmarks, LEFT_ANKLE);
  const rh  = getLandmark(landmarks, RIGHT_HIP);
  const rk  = getLandmark(landmarks, RIGHT_KNEE);
  const ra  = getLandmark(landmarks, RIGHT_ANKLE);
  const ls  = getLandmark(landmarks, LEFT_SHOULDER);

  if (!lh || !lk || !la || !ls) {
    return { reps: state.reps, stage: state.stage, feedback: [], goodForm: true, jointColors: {} };
  }

  const kneeAngle = calculateAngle(lh, lk, la);
  const backAngle = calculateAngle(ls, lh, lk);

  let { reps, stage } = state;
  if (kneeAngle > 160) stage = 'up';
  if (kneeAngle < 90 && stage === 'up') { stage = 'down'; reps += 1; }

  const feedback = [];
  let kneeBad = false;
  let backBad = false;

  if (backAngle < 50) {
    feedback.push("Keep your back straighter");
    backBad = true;
  }
  if (stage === 'down' && kneeAngle > 105) {
    feedback.push("Squat deeper — aim for parallel");
    kneeBad = true;
  }
  if (lk.x > la.x + 0.05) {
    feedback.push("Keep knees behind toes");
    kneeBad = true;
  }

  const jointColors = {
    [LEFT_KNEE]:  kneeBad ? 'bad' : 'good',
    [RIGHT_KNEE]: kneeBad ? 'bad' : 'good',
    [LEFT_HIP]:   backBad ? 'bad' : 'good',
    [RIGHT_HIP]:  backBad ? 'bad' : 'good',
  };

  return { reps, stage, feedback, goodForm: feedback.length === 0, jointColors };
}

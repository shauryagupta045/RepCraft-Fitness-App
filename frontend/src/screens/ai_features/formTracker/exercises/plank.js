import { calculateAngle, getLandmark } from '../utils/poseUtils';
import { LEFT_SHOULDER, LEFT_HIP, LEFT_ANKLE } from '../constants/landmarks';

/**
 * Analyse a plank frame. Time-based — returns holdTime instead of reps.
 */
export default function analyzePlank(landmarks, stateRef) {
  const state = stateRef.current;

  const ls = getLandmark(landmarks, LEFT_SHOULDER);
  const lh = getLandmark(landmarks, LEFT_HIP);
  const la = getLandmark(landmarks, LEFT_ANKLE);

  if (!ls || !lh || !la) {
    return {
      reps: 0,
      holdTime: state.holdTime || 0,
      stage: 'hold',
      feedback: [],
      goodForm: true,
      jointColors: {},
    };
  }

  const bodyAngle = calculateAngle(ls, lh, la);
  const holdTime  = state.holdTime || 0;

  const feedback = [];
  let hipBad = false;

  if (bodyAngle < 160) {
    feedback.push("Hips are sagging — raise them up");
    hipBad = true;
  } else if (bodyAngle > 190) {
    feedback.push("Lower your hips — body is arching");
    hipBad = true;
  }

  // Encouragement every 30 s when form is perfect
  if (feedback.length === 0 && holdTime > 0 && holdTime % 30 === 0) {
    feedback.push("Keep going — great form!");
  }

  const jointColors = {
    [LEFT_HIP]:     hipBad ? 'bad' : 'good',
    [LEFT_SHOULDER]: !hipBad ? 'good' : 'neutral',
    [LEFT_ANKLE]:    !hipBad ? 'good' : 'neutral',
  };

  return {
    reps: 0,
    holdTime,
    stage: 'hold',
    feedback,
    goodForm: !hipBad,
    jointColors,
  };
}

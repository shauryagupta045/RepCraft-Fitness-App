import { calculateAngle, getLandmark } from '../utils/poseUtils';
import {
  LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST,
  RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST,
  LEFT_HIP, LEFT_ANKLE,
} from '../constants/landmarks';

/**
 * Analyse a push-up frame.
 * @param {Array} landmarks  — MediaPipe pose landmarks (33 items)
 * @param {React.MutableRefObject} stateRef
 * @returns {{ reps, stage, feedback, goodForm, jointColors }}
 */
export default function analyzePushup(landmarks, stateRef) {
  const state = stateRef.current;

  // --- Fetch landmarks ---
  const ls = getLandmark(landmarks, LEFT_SHOULDER);
  const le = getLandmark(landmarks, LEFT_ELBOW);
  const lw = getLandmark(landmarks, LEFT_WRIST);
  const rs = getLandmark(landmarks, RIGHT_SHOULDER);
  const re = getLandmark(landmarks, RIGHT_ELBOW);
  const rw = getLandmark(landmarks, RIGHT_WRIST);
  const lh = getLandmark(landmarks, LEFT_HIP);
  const la = getLandmark(landmarks, LEFT_ANKLE);

  // If any critical landmark is missing, return unchanged state
  if (!ls || !le || !lw || !rs || !re || !rw || !lh || !la) {
    return {
      reps: state.reps,
      stage: state.stage,
      feedback: [],
      goodForm: true,
      jointColors: {},
    };
  }

  // --- Angles ---
  const leftElbowAngle  = calculateAngle(ls, le, lw);
  const rightElbowAngle = calculateAngle(rs, re, rw);
  const bodyAngle       = calculateAngle(ls, lh, la);

  // --- Rep counting ---
  let { reps, stage } = state;
  if (leftElbowAngle > 160) {
    stage = 'up';
  }
  if (leftElbowAngle < 90 && stage === 'up') {
    stage = 'down';
    reps += 1;
  }

  // --- Form errors ---
  const feedback = [];
  let elbowBad = false;
  let hipBad   = false;

  if (bodyAngle < 160) {
    feedback.push("Keep your body straight — hips are sagging");
    hipBad = true;
  } else if (bodyAngle > 195) {
    feedback.push("Lower your hips — body is arching");
    hipBad = true;
  }
  if (stage === 'down' && leftElbowAngle > 110) {
    feedback.push("Go lower — aim for full depth");
    elbowBad = true;
  }
  if (Math.abs(leftElbowAngle - rightElbowAngle) > 15) {
    feedback.push("Balance both arms evenly");
    elbowBad = true;
  }

  // --- Joint colours ---
  const jointColors = {
    [LEFT_ELBOW]:  elbowBad ? 'bad' : 'good',
    [RIGHT_ELBOW]: elbowBad ? 'bad' : 'good',
    [LEFT_HIP]:    hipBad   ? 'bad' : 'good',
  };

  return { reps, stage, feedback, goodForm: feedback.length === 0, jointColors };
}

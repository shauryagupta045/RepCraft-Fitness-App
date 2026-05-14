import { calculateAngle, getLandmark } from '../utils/poseUtils';
import { LEFT_HIP, LEFT_KNEE, LEFT_ANKLE, LEFT_SHOULDER } from '../constants/landmarks';

/**
 * Analyse a lunge frame.
 */
export default function analyzeLunge(landmarks, stateRef) {
  const state = stateRef.current;

  const lh = getLandmark(landmarks, LEFT_HIP);
  const lk = getLandmark(landmarks, LEFT_KNEE);
  const la = getLandmark(landmarks, LEFT_ANKLE);
  const ls = getLandmark(landmarks, LEFT_SHOULDER);

  if (!lh || !lk || !la || !ls) {
    return { reps: state.reps, stage: state.stage, feedback: [], goodForm: true, jointColors: {} };
  }

  const frontKneeAngle = calculateAngle(lh, lk, la);
  const torsoLean      = calculateAngle(ls, lh, lk);

  let { reps, stage } = state;
  if (frontKneeAngle > 160) stage = 'up';
  if (frontKneeAngle < 100 && stage === 'up') { stage = 'down'; reps += 1; }

  const feedback = [];
  let kneeBad  = false;
  let torsoBad = false;

  if (lk.x > la.x + 0.06) {
    feedback.push("Front knee is too far forward");
    kneeBad = true;
  }
  if (Math.abs(torsoLean - 90) > 15) {
    feedback.push("Keep your torso upright");
    torsoBad = true;
  }

  const jointColors = {
    [LEFT_KNEE]: kneeBad  ? 'bad' : 'good',
    [LEFT_HIP]:  torsoBad ? 'bad' : 'good',
  };

  return { reps, stage, feedback, goodForm: feedback.length === 0, jointColors };
}

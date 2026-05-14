import { calculateAngle, getLandmark } from '../utils/poseUtils';
import { LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST, LEFT_HIP } from '../constants/landmarks';

/**
 * Analyse a shoulder press frame.
 */
export default function analyzeShoulderPress(landmarks, stateRef) {
  const state = stateRef.current;

  const ls = getLandmark(landmarks, LEFT_SHOULDER);
  const le = getLandmark(landmarks, LEFT_ELBOW);
  const lw = getLandmark(landmarks, LEFT_WRIST);
  const lh = getLandmark(landmarks, LEFT_HIP);

  if (!ls || !le || !lw || !lh) {
    return { reps: state.reps, stage: state.stage, feedback: [], goodForm: true, jointColors: {} };
  }

  const elbowAngle = calculateAngle(ls, le, lw);
  // Torso lean: angle between shoulder, hip, and a point directly below hip
  const torsoAngle = calculateAngle(ls, lh, { x: lh.x, y: lh.y + 1 });

  let { reps, stage } = state;
  if (elbowAngle < 100) stage = 'down';
  if (elbowAngle > 165 && stage === 'down') { stage = 'up'; reps += 1; }

  const feedback = [];
  let torsoBad = false;
  let wristBad = false;

  if (torsoAngle > 15) {
    feedback.push("Don't arch your lower back");
    torsoBad = true;
  }
  if (lw.x > le.x + 0.05) {
    feedback.push("Press directly overhead — wrists over elbows");
    wristBad = true;
  }

  const jointColors = {
    [LEFT_ELBOW]: wristBad  ? 'bad' : 'good',
    [LEFT_WRIST]: wristBad  ? 'bad' : 'good',
    [LEFT_HIP]:   torsoBad  ? 'bad' : 'good',
  };

  return { reps, stage, feedback, goodForm: feedback.length === 0, jointColors };
}

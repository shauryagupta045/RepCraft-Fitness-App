/**
 * Calculate the angle (0–180°) at vertex B formed by points A–B–C.
 * @param {{x:number,y:number}} A
 * @param {{x:number,y:number}} B  — vertex (joint)
 * @param {{x:number,y:number}} C
 * @returns {number} angle in degrees
 */
export function calculateAngle(A, B, C) {
  const radians =
    Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Safely get a landmark by index. Returns null if missing or low confidence.
 * @param {Array} landmarks
 * @param {number} index
 * @returns {object|null}
 */
export function getLandmark(landmarks, index) {
  if (!landmarks || index < 0 || index >= landmarks.length) return null;
  const lm = landmarks[index];
  if (!lm) return null;
  // MediaPipe provides visibility [0,1]; require > 0.5
  if (typeof lm.visibility === 'number' && lm.visibility < 0.5) return null;
  return lm;
}

/**
 * Convert MediaPipe normalised coords (0–1) to pixel coords.
 * @param {{x:number,y:number}} landmark
 * @param {number} frameWidth
 * @param {number} frameHeight
 * @returns {{x:number,y:number}}
 */
export function normalizePoint(landmark, frameWidth, frameHeight) {
  return {
    x: landmark.x * frameWidth,
    y: landmark.y * frameHeight,
  };
}

// MediaPipe Pose Landmarker — all 33 landmark indices
export const NOSE            = 0;
export const LEFT_EYE_INNER  = 1;
export const LEFT_EYE        = 2;
export const LEFT_EYE_OUTER  = 3;
export const RIGHT_EYE_INNER = 4;
export const RIGHT_EYE       = 5;
export const RIGHT_EYE_OUTER = 6;
export const LEFT_EAR        = 7;
export const RIGHT_EAR       = 8;
export const MOUTH_LEFT      = 9;
export const MOUTH_RIGHT     = 10;
export const LEFT_SHOULDER   = 11;
export const RIGHT_SHOULDER  = 12;
export const LEFT_ELBOW      = 13;
export const RIGHT_ELBOW     = 14;
export const LEFT_WRIST      = 15;
export const RIGHT_WRIST     = 16;
export const LEFT_PINKY      = 17;
export const RIGHT_PINKY     = 18;
export const LEFT_INDEX      = 19;
export const RIGHT_INDEX     = 20;
export const LEFT_THUMB      = 21;
export const RIGHT_THUMB     = 22;
export const LEFT_HIP        = 23;
export const RIGHT_HIP       = 24;
export const LEFT_KNEE       = 25;
export const RIGHT_KNEE      = 26;
export const LEFT_ANKLE      = 27;
export const RIGHT_ANKLE     = 28;
export const LEFT_HEEL       = 29;
export const RIGHT_HEEL      = 30;
export const LEFT_FOOT_INDEX = 31;
export const RIGHT_FOOT_INDEX= 32;

// Skeleton connection pairs [fromIndex, toIndex]
export const SKELETON_CONNECTIONS = [
  // Face
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],
  // Upper body
  [11,12],[11,13],[13,15],[12,14],[14,16],
  // Torso
  [11,23],[12,24],[23,24],
  // Lower body
  [23,25],[25,27],[27,29],[27,31],[24,26],[26,28],[28,30],[28,32],
];

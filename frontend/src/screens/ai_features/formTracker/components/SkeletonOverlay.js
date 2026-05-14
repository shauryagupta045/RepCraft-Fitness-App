import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Canvas, Path, Circle } from '@shopify/react-native-skia';
import { SKELETON_CONNECTIONS } from '../constants/landmarks';

const { width: Sw, height: Sh } = Dimensions.get('window');

const COLOR_BAD     = '#FF4D6A';
const COLOR_GOOD    = '#00F5C4';
const COLOR_NEUTRAL = 'rgba(255,255,255,0.7)';
const STROKE_WIDTH  = 3;
const DOT_RADIUS    = 5;

/**
 * SkeletonOverlay — handles coordinate transformation from Video Space (object-fit: cover)
 * to Screen Space, and draws the skeleton.
 */
export default function SkeletonOverlay({
  landmarks,
  jointColors = {},
  frameWidth: Vw,
  frameHeight: Vh,
}) {
  if (!landmarks || landmarks.length === 0 || !Vw || !Vh) return null;

  // ── Coordinate Transformation (object-fit: cover) ──────────────────────────
  const Vr = Vw / Vh;
  const Sr = Sw / Sh;
  
  let scale, ox, oy;
  if (Vr > Sr) {
    // Video is wider than screen: height matches, width cropped
    scale = Sh / Vh;
    ox = (Sw - Vw * scale) / 2;
    oy = 0;
  } else {
    // Video is taller than screen: width matches, height cropped
    scale = Sw / Vw;
    ox = 0;
    oy = (Sh - Vh * scale) / 2;
  }

  const transform = (lm) => ({
    x: lm.x * Vw * scale + ox,
    y: lm.y * Vh * scale + oy,
  });

  // Pre-compute points
  const points = landmarks.map(lm => lm ? transform(lm) : null);

  // Filter connections by visibility
  const bones = SKELETON_CONNECTIONS.map(([a, b], i) => {
    const pa = points[a];
    const pb = points[b];
    if (!pa || !pb) return null;
    
    const la = landmarks[a];
    const lb = landmarks[b];
    if ((la.visibility ?? 1) < 0.5 || (lb.visibility ?? 1) < 0.5) return null;

    const isBad = jointColors[a] === 'bad' || jointColors[b] === 'bad';
    const isGood = jointColors[a] === 'good' && jointColors[b] === 'good';
    const color = isBad ? COLOR_BAD : (isGood ? COLOR_GOOD : COLOR_NEUTRAL);

    return { d: `M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`, color, key: `b-${i}` };
  }).filter(Boolean);

  const dots = landmarks.map((lm, i) => {
    if (!lm || (lm.visibility ?? 1) < 0.5) return null;
    const p = points[i];
    const color = jointColors[i] === 'bad' ? COLOR_BAD : (jointColors[i] === 'good' ? COLOR_GOOD : COLOR_NEUTRAL);
    return { x: p.x, y: p.y, color, key: `d-${i}` };
  }).filter(Boolean);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {bones.map(b => (
        <Path key={b.key} path={b.d} color={b.color} style="stroke" strokeWidth={STROKE_WIDTH} strokeCap="round" />
      ))}
      {dots.map(d => (
        <Circle key={d.key} cx={d.x} cy={d.y} r={DOT_RADIUS} color={d.color} />
      ))}
    </Canvas>
  );
}


import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FONTS, COLORS } from '../../../../constants/theme';

/**
 * RepCounter — animated rep display.
 * Props: { count: number, stage: 'up'|'down'|'hold'|null, isPlank: bool, holdTime: number }
 */
export default function RepCounter({ count, stage, isPlank = false, holdTime = 0 }) {
  const scale = useSharedValue(1);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      scale.value = withSpring(1.35, { damping: 8, stiffness: 200 }, () => {
        scale.value = withSpring(1.0, { damping: 8, stiffness: 200 });
      });
      prevCount.current = count;
    }
  }, [count]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Format plank hold time as MM:SS
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stagePillActive = stage === 'down' || stage === 'up';
  const stageBg = stagePillActive ? COLORS.secondary : 'rgba(255,255,255,0.12)';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{isPlank ? 'HOLD TIME' : 'REPS'}</Text>

      <Animated.Text style={[styles.count, animStyle]}>
        {isPlank ? formatTime(holdTime) : String(count).padStart(2, '0')}
      </Animated.Text>

      {!isPlank && (
        <View style={[styles.stagePill, { backgroundColor: stageBg }]}>
          <Text style={styles.stageText}>
            {stage === 'up' ? 'UP' : stage === 'down' ? 'DOWN' : '—'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: FONTS.black,
    fontSize: 88,
    color: '#FFFFFF',
    lineHeight: 96,
    fontVariant: ['tabular-nums'],
  },
  stagePill: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stageText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1.5,
  },
});

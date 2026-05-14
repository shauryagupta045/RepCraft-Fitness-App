import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FONTS } from '../../../../constants/theme';

const BAD_BG  = 'rgba(255,77,106,0.92)';
const GOOD_BG = 'rgba(0,245,196,0.92)';

const HIDE_TRANSLATE = 80;
const AUTO_DISMISS_MS = 2500;
const MIN_REPEAT_MS   = 3000;

/**
 * FormFeedback — slide-up banner for form errors / good-form praise.
 * Props: { feedback: string[], goodForm: boolean }
 */
export default function FormFeedback({ feedback, goodForm }) {
  const translateY   = useSharedValue(HIDE_TRANSLATE);
  const lastMsgRef   = useRef('');
  const lastShownRef = useRef(0);
  const timerRef     = useRef(null);

  const show = (msg) => {
    const now = Date.now();
    if (msg === lastMsgRef.current && now - lastShownRef.current < MIN_REPEAT_MS) return;
    lastMsgRef.current   = msg;
    lastShownRef.current = now;

    translateY.value = withSpring(0, { damping: 14, stiffness: 180 });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      translateY.value = withSpring(HIDE_TRANSLATE, { damping: 14, stiffness: 180 });
    }, AUTO_DISMISS_MS);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    translateY.value = withSpring(HIDE_TRANSLATE, { damping: 14, stiffness: 180 });
  };

  useEffect(() => {
    if (feedback && feedback.length > 0) {
      show(feedback[0]);
    } else if (goodForm) {
      hide();
    }
  }, [feedback, goodForm]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isBad  = feedback && feedback.length > 0 && !goodForm;
  const isGood = goodForm && !(feedback && feedback.length > 0);
  const msg    = isBad ? feedback[0] : isGood ? 'Perfect form!' : '';
  const bg     = isBad ? BAD_BG : GOOD_BG;
  const textClr = isBad ? '#FFFFFF' : '#0D2B26';

  if (!msg) return null;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bg }, animStyle]}>
      <Text style={[styles.icon]}>{isBad ? '⚠️' : '✅'}</Text>
      <Text style={[styles.text, { color: textClr }]} numberOfLines={2}>
        {msg}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { fontSize: 20 },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
});

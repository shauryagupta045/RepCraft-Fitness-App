import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function StreakToaster() {
  const { user, showStreakAnimation } = useAuthStore();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const plusOneOpacity = useSharedValue(0);
  const plusOneTranslateY = useSharedValue(0);

  useEffect(() => {
    if (showStreakAnimation) {
      // Toast Slide In
      translateY.value = withSpring(50, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12 });

      // +1 Animation
      plusOneOpacity.value = withSequence(
        withDelay(400, withTiming(1, { duration: 200 })),
        withDelay(1500, withTiming(0, { duration: 300 }))
      );
      plusOneTranslateY.value = withSequence(
        withDelay(400, withTiming(-30, { duration: 800, easing: Easing.out(Easing.quad) })),
        withTiming(0, { duration: 0 })
      );

      // Slide Out
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 500, easing: Easing.in(Easing.quad) });
        opacity.value = withTiming(0, { duration: 400 });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showStreakAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const plusOneStyle = useAnimatedStyle(() => ({
    opacity: plusOneOpacity.value,
    transform: [{ translateY: plusOneTranslateY.value }],
  }));

  if (!showStreakAnimation) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.toaster, SHADOWS.primary, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={28} color="#FFD700" />
          <Animated.View style={[styles.plusOneContainer, plusOneStyle]}>
            <Text style={styles.plusOneText}>+1</Text>
          </Animated.View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>STREAK INCREASED!</Text>
          <Text style={styles.subtitle}>You're on a {user?.streak || 1} day fire!</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toaster: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2138',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  iconContainer: {
    marginRight: 15,
    position: 'relative',
  },
  plusOneContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  plusOneText: {
    color: '#fff',
    fontFamily: FONTS.black,
    fontSize: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFD700',
    fontFamily: FONTS.black,
    fontSize: 14,
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});

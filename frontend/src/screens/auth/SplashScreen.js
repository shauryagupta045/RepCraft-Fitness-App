import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function SplashScreen({ navigation }) {
  const { width } = useWindowDimensions();
  
  // Animation values
  const logoOp  = useSharedValue(0);
  const logoTy  = useSharedValue(50); // Translate Y
  const logoRot = useSharedValue('-45deg'); // Rotation
  const pulseSc = useSharedValue(1); // Pulse scale
  const textOp  = useSharedValue(0);
  const textTy  = useSharedValue(20);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [
      { translateY: logoTy.value },
      { rotate: logoRot.value },
      { scale: pulseSc.value }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOp.value,
    transform: [{ translateY: textTy.value }],
  }));

  useEffect(() => {
    // 1. Fade in and slide up logo with spring
    logoOp.value = withTiming(1, { duration: 800 });
    logoTy.value = withSpring(0, { damping: 12, stiffness: 90 });
    
    // 2. Rotate to 0 deg with spring
    logoRot.value = withDelay(400, withSpring('0deg', { damping: 10, stiffness: 80 }));
    
    // 3. Pulse animation (heartbeat style) starts after rotation
    pulseSc.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 })
      ),
      -1, // infinite repeat
      true // reverse
    ));

    // 4. Fade in text smoothly
    textOp.value = withDelay(800, withTiming(1, { duration: 600 }));
    textTy.value = withDelay(800, withSpring(0, { damping: 12 }));

    // Navigate to Intro screen
    const t = setTimeout(() => {
      navigation.replace('Intro');
    }, 3200);

    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={s.container}>
      <Animated.View style={[s.iconRing, logoStyle]}>
        <Ionicons name="barbell" size={60} color="#fff" />
      </Animated.View>

      <Animated.View style={[s.textContainer, textStyle]}>
        <Text style={s.brand}>RepCraft</Text>
        <Text style={s.tagline}>TRAIN · TRACK · CRAFT</Text>
      </Animated.View>

      <View style={s.bottom}>
        <Text style={s.version}>RepCraft v2.0</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    ...Platform.select({
      web: { boxShadow: `0px 10px 30px rgba(232,112,94,0.6)` },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 16,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
  },
  brand: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: '#fff',
    letterSpacing: -1.5,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 6,
    marginTop: SPACING.md,
  },
  bottom: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  version: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },
});

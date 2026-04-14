import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function SplashScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const barW    = useSharedValue(0);
  const logoOp  = useSharedValue(0);
  const logoSc  = useSharedValue(0.85);
  const tagOp   = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ scale: logoSc.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOp.value }));
  const barStyle = useAnimatedStyle(() => ({ width: barW.value }));

  useEffect(() => {
    logoOp.value = withTiming(1, { duration: 600 });
    logoSc.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    tagOp.value  = withDelay(500, withTiming(1, { duration: 500 }));
    barW.value   = withDelay(300, withTiming(width * 0.65, {
      duration: 1900,
      easing: Easing.inOut(Easing.quad),
    }));

    // Always go to Onboarding — auth state handled by RootNav
    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2600);

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.logoBlock, logoStyle]}>
        <View style={s.iconRing}>
          <Ionicons name="barbell" size={52} color="#fff" />
        </View>
        <Text style={s.brand}>RepCraft</Text>
        <Animated.Text style={[s.tagline, tagStyle]}>
          TRAIN · TRACK · CRAFT
        </Animated.Text>
      </Animated.View>

      <View style={s.bottom}>
        <View style={[s.loaderTrack, { width: width * 0.65 }]}>
          <Animated.View style={[s.loaderFill, barStyle]} />
        </View>
        <Text style={s.version}>RepCraft v1.0</Text>
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
  logoBlock: { alignItems: 'center' },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...Platform.select({
      web: { boxShadow: `0px 10px 20px rgba(232,112,94,0.5)` },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 14,
      },
    }),
  },
  brand: {
    fontFamily: FONTS.black,
    fontSize: 40,
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 4,
    marginTop: SPACING.sm,
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loaderTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  loaderFill: {
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  version: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
  },
});

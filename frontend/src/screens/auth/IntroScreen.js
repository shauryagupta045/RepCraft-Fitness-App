import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const SLIDES = [
  {
    icon: 'barbell-outline',
    gradient: [COLORS.primary, '#D96055'],
    title: 'Welcome to\nRepCraft',
    body: 'Your journey starts here. Track your workouts, smash your PRs, and build the body you want.',
  },
  {
    icon: 'hardware-chip-outline',
    gradient: [COLORS.secondary, '#3BBBB2'],
    title: 'AI-Powered\nCoach',
    body: 'RepCraft is not just a tracker. It is an intelligent coach powered by Gemini AI, adapting to your every set.',
  },
];

export default function IntroScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef(null);
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      navigation.navigate('AuthLanding');
      return;
    }
    const nextSlide = slide + 1;
    setSlide(nextSlide);
    scrollRef.current?.scrollTo({ x: nextSlide * width, animated: true });
  };

  const skip = () => {
    navigation.navigate('AuthLanding');
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Skip */}
      <TouchableOpacity style={s.skip} onPress={skip}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((sl, i) => (
          <View key={i} style={[s.slide, { width }]}>
            <LinearGradient
              colors={sl.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.iconHero}
            >
              <View style={s.iconCircle}>
                <Ionicons name={sl.icon} size={64} color="#fff" />
              </View>
            </LinearGradient>

            <View style={s.textBlock}>
              <Text style={s.slideTitle}>{sl.title}</Text>
              <Text style={s.slideBody}>{sl.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === slide && s.dotActive]} />
          ))}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.88} style={s.cta}>
          <LinearGradient
            colors={[COLORS.primary, '#D96055']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <Text style={s.ctaText}>{isLast ? "Get Started" : 'Next'}</Text>
            <Ionicons name={isLast ? 'rocket-outline' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  skip: { position: 'absolute', top: 56, right: SPACING.xl, zIndex: 10 },
  skipText: { fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textMuted },
  slide: { flex: 1 },
  iconHero: {
    height: 380, alignItems: 'center', justifyContent: 'center',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  iconCircle: {
    width: 140, height: 140, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  textBlock: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, flex: 1 },
  slideTitle: {
    fontFamily: FONTS.black, fontSize: 38, color: COLORS.textDark,
    lineHeight: 44, letterSpacing: -0.5, marginBottom: SPACING.md,
  },
  slideBody: {
    fontFamily: FONTS.regular, fontSize: 18, color: COLORS.textMuted,
    lineHeight: 26,
  },
  footer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xl },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.border, marginHorizontal: 4,
  },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  cta: { borderRadius: RADIUS.button || RADIUS.lg, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 18,
  },
  ctaText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff', marginRight: 8 },
});

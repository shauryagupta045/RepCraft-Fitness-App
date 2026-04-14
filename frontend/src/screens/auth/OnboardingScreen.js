/**
 * OnboardingScreen — NEW page (Stitch-accurate)
 * 3-slide swiper: Welcome → Goals → Level
 * Coral CTA, skip link, dot indicators
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const SLIDES = [
  {
    icon: 'barbell-outline',
    iconColor: COLORS.primary,
    iconBg: '#FFF0EE',
    gradient: [COLORS.primary, '#D96055'],
    title: 'Welcome to\nRepCraft',
    body: 'Your AI-powered fitness coach that adapts to you. Track workouts, monitor recovery, and hit your goals.',
  },
  {
    icon: 'trophy-outline',
    iconColor: '#F5A623',
    iconBg: '#FFF8EE',
    gradient: ['#F5A623', '#E8943A'],
    title: 'Set Your\nGoals',
    body: 'Whether you want to build muscle, lose fat, or just stay active — RepCraft builds a plan around you.',
  },
  {
    icon: 'hardware-chip-outline',
    iconColor: COLORS.secondary,
    iconBg: '#EDF9F8',
    gradient: [COLORS.secondary, '#3BBBB2'],
    title: 'AI Coach,\nAlways On',
    body: 'Get personalized insights, workout plans, and nutrition advice powered by Claude AI — any time.',
  },
];

const GOALS = [
  { id: 'muscle', label: 'Build Muscle', icon: 'barbell-outline' },
  { id: 'lose',   label: 'Lose Weight',  icon: 'trending-down-outline' },
  { id: 'strong', label: 'Get Stronger', icon: 'flash-outline' },
  { id: 'active', label: 'Stay Active',  icon: 'leaf-outline' },
];

export default function OnboardingScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { login } = useAuthStore();
  const [slide, setSlide]   = useState(0);
  const [goal, setGoal]     = useState('muscle');
  const scrollRef = useRef(null);
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      login({ name: 'Alex Jordan', email: 'alex@repcraft.app', goal });
    // RootNav automatically switches to MainApp when isAuthenticated becomes true
      return;
    }
    const nextSlide = slide + 1;
    setSlide(nextSlide);
    scrollRef.current?.scrollTo({ x: nextSlide * width, animated: true });
  };

  const skip = () => {
    login({ name: 'Alex Jordan', email: 'alex@repcraft.app', goal });
    // RootNav automatically switches to MainApp when isAuthenticated becomes true
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
            {/* Icon hero */}
            <LinearGradient
              colors={sl.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.iconHero}
            >
              <View style={[s.iconCircle, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Ionicons name={sl.icon} size={56} color="#fff" />
              </View>
            </LinearGradient>

            {/* Text */}
            <View style={s.textBlock}>
              <Text style={s.slideTitle}>{sl.title}</Text>
              <Text style={s.slideBody}>{sl.body}</Text>

              {/* Goal picker on slide 2 */}
              {i === 1 && (
                <View style={s.goalGrid}>
                  {GOALS.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() => setGoal(g.id)}
                      style={[s.goalCard, goal === g.id && s.goalCardActive, SHADOWS.card]}
                    >
                      <Ionicons
                        name={g.icon}
                        size={22}
                        color={goal === g.id ? COLORS.primary : COLORS.textMuted}
                      />
                      <Text style={[s.goalLabel, goal === g.id && { color: COLORS.primary }]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA */}
      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === slide && s.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.88} style={s.cta}>
          <LinearGradient
            colors={[COLORS.primary, '#D96055']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <Text style={s.ctaText}>{isLast ? "Let's Go!" : 'Next'}</Text>
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
  skipText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  slide: { flex: 1 },
  iconHero: {
    height: 300, alignItems: 'center', justifyContent: 'center',
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  textBlock: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, flex: 1 },
  slideTitle: {
    fontFamily: FONTS.black, fontSize: 34, color: COLORS.textDark,
    lineHeight: 40, letterSpacing: -0.5, marginBottom: SPACING.md,
  },
  slideBody: {
    fontFamily: FONTS.regular, fontSize: 16, color: COLORS.textMuted,
    lineHeight: 24,
  },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.lg },
  goalCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.md, alignItems: 'center',
    marginRight: '3%', marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  goalCardActive: { borderColor: COLORS.primary, backgroundColor: '#FFF0EE' },
  goalLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  footer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xl },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.border, marginHorizontal: 4,
  },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  cta: { borderRadius: RADIUS.button, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16,
  },
  ctaText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff', marginRight: 8 },
});

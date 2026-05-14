import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const GOALS = [
  { id: 'muscle', label: 'Build Muscle', icon: 'barbell-outline' },
  { id: 'lose',   label: 'Lose Weight',  icon: 'trending-down-outline' },
  { id: 'strong', label: 'Get Stronger', icon: 'flash-outline' },
  { id: 'active', label: 'Stay Active',  icon: 'leaf-outline' },
];

const EXPERIENCES = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { id: 'advanced', label: 'Advanced', desc: 'Very experienced' },
];

export default function SetupFlowScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { user, updateProfile, login } = useAuthStore();
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef(null);

  // Form State
  const [goal, setGoal] = useState('muscle');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [experience, setExperience] = useState('intermediate');

  const slides = [
    { id: 'goals', title: 'Set Your Goals', subtitle: 'What do you want to achieve?' },
    { id: 'height', title: 'Your Height', subtitle: 'Help us personalize your plan' },
    { id: 'weight', title: 'Your Weight', subtitle: 'We use this to calculate calories' },
    { id: 'experience', title: 'Experience Level', subtitle: 'How familiar are you with working out?' },
    { id: 'ai', title: 'Meet Your AI Coach', subtitle: 'Powered by Gemini AI, ready to build your custom plan.' },
  ];

  const isLast = slide === slides.length - 1;

  const next = async () => {
    if (isLast) {
      if (user?.uid) {
        // If authenticated, update profile in Firestore
        await updateProfile({
          goal,
          height: parseInt(height) || 0,
          weight: parseInt(weight) || 0,
          activityLevel: experience,
        });
      } else {
        // Fallback for guest flow
        login({ 
          name: 'Guest User', 
          email: 'guest@repcraft.app', 
          goal, 
          height, 
          weight, 
          experience 
        });
      }
      return;
    }
    const nextSlide = slide + 1;
    setSlide(nextSlide);
    scrollRef.current?.scrollTo({ x: nextSlide * width, animated: true });
  };

  const skip = async () => {
    if (!user?.uid) {
      login({ name: 'Guest User', email: 'guest@repcraft.app', goal: 'muscle' });
    } else {
      // If already logged in, set a default goal to mark setup as complete
      await updateProfile({ goal: 'muscle' });
    }
  };

  const renderSlideContent = (item) => {
    switch (item.id) {
      case 'goals':
        return (
          <View style={s.grid}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setGoal(g.id)}
                style={[s.card, goal === g.id && s.cardActive, SHADOWS.card]}
              >
                <Ionicons name={g.icon} size={32} color={goal === g.id ? COLORS.primary : COLORS.textMuted} />
                <Text style={[s.cardLabel, goal === g.id && { color: COLORS.primary }]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'height':
        return (
          <View style={s.inputContainer}>
            <Ionicons name="resize-outline" size={80} color={COLORS.primaryLight} style={{ marginBottom: 20 }} />
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                maxLength={3}
              />
              <Text style={s.unit}>cm</Text>
            </View>
          </View>
        );
      case 'weight':
        return (
          <View style={s.inputContainer}>
            <Ionicons name="speedometer-outline" size={80} color={COLORS.primaryLight} style={{ marginBottom: 20 }} />
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                maxLength={3}
              />
              <Text style={s.unit}>kg</Text>
            </View>
          </View>
        );
      case 'experience':
        return (
          <View style={s.listContainer}>
            {EXPERIENCES.map(e => (
              <TouchableOpacity
                key={e.id}
                onPress={() => setExperience(e.id)}
                style={[s.listCard, experience === e.id && s.listCardActive]}
              >
                <View style={s.listCardLeft}>
                  <View style={[s.radio, experience === e.id && s.radioActive]}>
                    {experience === e.id && <View style={s.radioInner} />}
                  </View>
                  <View style={s.listTextContainer}>
                    <Text style={[s.listLabel, experience === e.id && { color: COLORS.primary }]}>{e.label}</Text>
                    <Text style={s.listDesc}>{e.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'ai':
        return (
          <View style={s.aiContainer}>
            <View style={s.aiIconRing}>
              <Ionicons name="hardware-chip" size={80} color="#fff" />
            </View>
            <Text style={s.aiBody}>
              Your profile is complete! The RepCraft AI Coach is analyzing your details to build the perfect workout routine.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={s.skip} onPress={skip}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={s.progressContainer}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${((slide + 1) / slides.length) * 100}%` }]} />
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {slides.map((item, i) => (
            <View key={i} style={[s.slide, { width }]}>
              <View style={s.header}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.subtitle}>{item.subtitle}</Text>
              </View>
              <View style={s.contentArea}>
                {renderSlideContent(item)}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity onPress={next} activeOpacity={0.88} style={s.cta}>
            <LinearGradient
              colors={[COLORS.primary, '#D96055']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaGrad}
            >
              <Text style={s.ctaText}>{isLast ? "Let's Go!" : 'Continue'}</Text>
              <Ionicons name={isLast ? 'rocket-outline' : 'arrow-forward'} size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  skip: { position: 'absolute', top: 16, right: SPACING.xl, zIndex: 10 },
  skipText: { fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textMuted },
  progressContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    width: '80%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  slide: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  header: { marginBottom: SPACING.xxl },
  title: {
    fontFamily: FONTS.black, fontSize: 32, color: COLORS.textDark,
    lineHeight: 38, letterSpacing: -0.5, marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular, fontSize: 16, color: COLORS.textMuted,
  },
  contentArea: { flex: 1, alignItems: 'center' },
  
  // Goals
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    paddingVertical: SPACING.xl, paddingHorizontal: SPACING.sm, alignItems: 'center',
    marginBottom: SPACING.md, borderWidth: 2, borderColor: COLORS.border,
  },
  cardActive: { borderColor: COLORS.primary, backgroundColor: '#FFF0EE' },
  cardLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textMid, marginTop: 12, textAlign: 'center' },
  
  // Height / Weight
  inputContainer: { alignItems: 'center', marginTop: 40 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 3, borderBottomColor: COLORS.primary, paddingBottom: 8 },
  input: { fontFamily: FONTS.black, fontSize: 64, color: COLORS.textDark, minWidth: 100, textAlign: 'center' },
  unit: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textMuted, marginBottom: 12, marginLeft: 8 },
  
  // Experience
  listContainer: { width: '100%' },
  listCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border,
  },
  listCardActive: { borderColor: COLORS.primary, backgroundColor: '#FFF0EE' },
  listCardLeft: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.borderDark,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  listTextContainer: { flex: 1 },
  listLabel: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark, marginBottom: 4 },
  listDesc: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  
  // AI
  aiContainer: { alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
  aiIconRing: {
    width: 140, height: 140, borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
    ...Platform.select({
      web: { boxShadow: '0px 10px 20px rgba(78,205,196,0.4)' },
      default: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
  },
  aiBody: { fontFamily: FONTS.regular, fontSize: 18, color: COLORS.textMid, textAlign: 'center', lineHeight: 28 },

  footer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.md },
  cta: { borderRadius: RADIUS.button || RADIUS.lg, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 18,
  },
  ctaText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff', marginRight: 8 },
});

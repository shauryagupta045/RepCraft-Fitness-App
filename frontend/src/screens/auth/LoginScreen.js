/**
 * LoginScreen — Stitch-accurate
 * Coral-to-teal gradient hero, clean white form below
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { login } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    navigation.navigate('SetupFlow');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero gradient ── */}
        <LinearGradient
          colors={[COLORS.primary, '#E8705E', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { height: height * 0.34 }]}
        >
          {/* Deco circles */}
          <View style={[s.deco, { width: 160, height: 160, top: -50, right: -50 }]} />
          <View style={[s.deco, { width: 100, height: 100, bottom: -20, left: -30 }]} />

          <View style={s.heroContent}>
            <View style={s.heroIcon}>
              <Ionicons name="barbell" size={34} color="#fff" />
            </View>
            <Text style={s.heroTitle}>RepCraft</Text>
            <Text style={s.heroSub}>Your personal fitness coach</Text>
          </View>
        </LinearGradient>

        {/* ── Form card ── */}
        <View style={s.form}>
          <Text style={s.heading}>Welcome Back</Text>
          <Text style={s.sub}>Sign in to continue your journey</Text>

          {/* Email */}
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={s.inputIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
              <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity style={s.forgot}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login CTA */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.88} style={s.cta}>
            <LinearGradient
              colors={[COLORS.primary, '#D96055']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaGrad}
            >
              <Text style={s.ctaText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>or</Text>
            <View style={s.divLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={[s.socialBtn, SHADOWS.card]} onPress={handleLogin}>
            <Ionicons name="logo-google" size={18} color={COLORS.textDark} />
            <Text style={s.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity style={[s.socialBtn, SHADOWS.card, { marginBottom: SPACING.xl }]} onPress={handleLogin}>
            <Ionicons name="logo-facebook" size={18} color="#1877F2" />
            <Text style={s.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <View style={s.signupRow}>
            <Text style={s.signupPrompt}>New to RepCraft? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={s.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  hero: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  deco: { position: 'absolute', borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.13)' },
  heroContent: { alignItems: 'center', zIndex: 1 },
  heroIcon: {
    width: 66, height: 66, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  heroTitle: { fontFamily: FONTS.black, fontSize: 30, color: '#fff' },
  heroSub: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 3 },
  form: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    marginTop: -22,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  heading: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark, marginBottom: 4 },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.input,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1, fontFamily: FONTS.regular, fontSize: 15,
    color: COLORS.textDark, paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  errorText: {
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.danger,
    marginTop: -6, marginBottom: SPACING.sm, marginLeft: 2,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary },
  cta: { borderRadius: RADIUS.button, overflow: 'hidden', marginBottom: SPACING.xl },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff', marginRight: 8 },
  divRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginHorizontal: 12 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.button,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingVertical: 14, marginBottom: SPACING.xl,
  },
  socialText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginLeft: 10 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted },
  signupLink: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';



export default function SignupScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const handleSignup = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.includes('@')) newErrors.email = 'Enter a valid email';
    if (password.length < 6) newErrors.password = 'Password must be 6+ characters';
    if (password !== confirm) newErrors.confirm = 'Passwords do not match';
    if (!agreed) {
      setToast({ visible: true, message: 'Please agree to the terms', type: 'error' });
      return;
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    navigation.navigate('SetupFlow');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#6DD5C0', '#FF7D6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { height: height * 0.28 }]}
        >
          <View style={styles.headerContent}>
            <Ionicons name="person-add-outline" size={48} color="#fff" />
            <Text style={styles.headerTitle}>Join RepCraft</Text>
            <Text style={styles.headerSub}>Start your transformation today</Text>
          </View>
          <View style={[styles.circle, { top: -30, left: -30, width: 120, height: 120 }]} />
          <View style={[styles.circle, { bottom: -20, right: -20, width: 90, height: 90 }]} />
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.heading}>Create Your Account</Text>

          <Input label="Full Name" placeholder="Alex Jordan" value={name} onChangeText={setName} error={errors.name} leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />} />
          <Input label="Email" placeholder="alex@repcraft.app" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />} />
          <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />} />
          <Input label="Confirm Password" placeholder="••••••••" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />} />


          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignup} style={styles.signupBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF7D6B', '#FF9A8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signupGrad}
            >
              <Text style={styles.signupBtnText}>Sign Up</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          <TouchableOpacity style={[styles.socialBtn, SHADOWS.card]} onPress={handleSignup}>
            <Ionicons name="logo-google" size={18} color={COLORS.textDark} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.socialBtn, SHADOWS.card, { marginBottom: SPACING.xl }]} onPress={handleSignup}>
            <Ionicons name="logo-facebook" size={18} color="#1877F2" />
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((t) => ({ ...t, visible: false }))} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerContent: { alignItems: 'center', zIndex: 1 },
  headerTitle: { fontFamily: FONTS.black, fontSize: 28, color: '#fff', marginTop: 8 },
  headerSub: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  circle: { position: 'absolute', borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.12)' },
  form: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  heading: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark, marginBottom: SPACING.xl },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xl },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontFamily: FONTS.medium },
  signupBtn: { borderRadius: RADIUS.button, overflow: 'hidden', marginBottom: SPACING.xl },
  signupGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  signupBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
  divRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginHorizontal: 12 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.button,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingVertical: 14, marginBottom: SPACING.md,
  },
  socialText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginLeft: 10 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted },
  loginLink: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
});

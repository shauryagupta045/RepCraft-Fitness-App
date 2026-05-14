import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, useWindowDimensions,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import CountryPicker from '../../components/common/CountryPicker';
import Toast from '../../components/common/Toast';
import { auth } from '../../services/firebase';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
// ✅ REMOVED: import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { setUser } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState({ name: 'India', code: '+91', flag: '🇮🇳' });
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  // ✅ REMOVED: recaptchaVerifier ref (no longer needed)

  // Google Sign-In Setup
  const redirectUri = makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: redirectUri,
    responseType: ResponseType.IdToken,
    usePKCE: false,
  });

  React.useEffect(() => {
    console.log('--- GOOGLE AUTH DEBUG ---');
    console.log('Redirect URI:', redirectUri);
    console.log('Web Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
    console.log('-------------------------');
  }, []);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;

      if (!idToken) {
        console.error('Google Auth Success but no id_token found:', response);
        setError('Google Sign-In failed: No identity token received.');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          await setUser(result.user);
          navigation.navigate('SetupFlow');
        })
        .catch((err) => {
          console.error('Google Sign-In Error:', err);
          setError('Google Sign-In failed. Check your Firebase/Google configuration.');
        })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      console.error('Google Sign-In Error response:', response.error);
      setError('Google Sign-In error: ' + (response.error?.message || 'Check your client IDs in .env'));
    }
  }, [response]);

  const handleGoogleLogin = () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      setError('Google Web Client ID is missing in .env');
      return;
    }
    promptAsync();
  };

  const handleSendOtp = async () => {
    // Phone auth is discontinued — show message and return
    setToast({
      visible: true,
      message: 'Due to technical problems, phone authentication is discontinued. Please use Google Login.',
      type: 'error'
    });
    return;
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      await setUser(result.user);
      navigation.navigate('SetupFlow');
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      handleGoogleLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ✅ REMOVED: <FirebaseRecaptchaVerifierModal> component */}

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

        <View style={s.form}>
          <Text style={s.heading}>Welcome Back</Text>
          <Text style={s.sub}>
            {confirmationResult ? 'Enter the code sent to your phone' : 'Sign in with your phone number to continue'}
          </Text>

          {!confirmationResult ? (
            <>
              <Text style={s.label}>Phone Number</Text>
              <View style={s.phoneInputRow}>
                <CountryPicker
                  selectedCountry={country}
                  onSelect={setCountry}
                />
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.textMuted}
                    value={phoneNumber}
                    onChangeText={v => { setPhoneNumber(v); setError(''); }}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={s.label}>Verification Code</Text>
              <View style={s.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="6-digit OTP"
                  placeholderTextColor={COLORS.textMuted}
                  value={otp}
                  onChangeText={v => { setOtp(v); setError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity onPress={() => setConfirmationResult(null)}>
                <Text style={s.resendText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={confirmationResult ? handleVerifyOtp : handleSendOtp}
            activeOpacity={0.88}
            style={s.cta}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, '#D96055']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaGrad}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={s.ctaText}>{confirmationResult ? 'Verify OTP' : 'Send Code'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!confirmationResult && (
            <>
              <View style={s.divRow}>
                <View style={s.divLine} />
                <Text style={s.divText}>or</Text>
                <View style={s.divLine} />
              </View>

              <TouchableOpacity
                style={[s.socialBtn, SHADOWS.card, { marginBottom: SPACING.xl }]}
                onPress={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={18} color={COLORS.textDark} />
                <Text style={s.socialText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={s.signupRow}>
            <Text style={s.signupPrompt}>New to RepCraft? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={s.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
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
  label: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textDark, marginBottom: 6 },
  phoneInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.input,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, ...SHADOWS.card,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textDark, paddingVertical: 14 },
  resendText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary, marginBottom: SPACING.xl, textAlign: 'right' },
  errorText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.danger, marginTop: -6, marginBottom: SPACING.sm, marginLeft: 2 },
  cta: { borderRadius: RADIUS.button, overflow: 'hidden', marginBottom: SPACING.xl },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  ctaText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff', marginRight: 8 },
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
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted },
  signupLink: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
});
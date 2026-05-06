import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions, useWindowDimensions,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import CountryPicker from '../../components/common/CountryPicker';
import { auth } from '../../services/firebase';
import { 
  signInWithPhoneNumber,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

export default function SignupScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { setUser } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState({ name: 'India', code: '+91', flag: '🇮🇳' });
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  
  const recaptchaVerifier = useRef(null);

  // Google Sign-In Setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then((result) => {
          setUser(result.user);
          navigation.navigate('SetupFlow');
        })
        .catch((err) => {
          console.error('Google Sign-In Error:', err);
          setToast({ visible: true, message: 'Google Sign-In failed', type: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleAppleLogin = async () => {
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
      
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken } = appleCredential;
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      setLoading(true);
      const result = await signInWithCredential(auth, credential);
      setUser(result.user);
      navigation.navigate('SetupFlow');
    } catch (err) {
      if (err.code === 'ERR_CANCELED') {
        // user cancelled
      } else {
        console.error('Apple Sign-In Error:', err);
        setToast({ visible: true, message: 'Apple Sign-In failed', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setErrors({ phone: 'Enter a valid phone number' });
      return;
    }
    if (!agreed) {
      setToast({ visible: true, message: 'Please agree to the terms', type: 'error' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const fullPhone = `${country.code}${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier.current);
      setConfirmationResult(confirmation);
      setToast({ visible: true, message: 'Code sent!', type: 'success' });
    } catch (err) {
      console.error('Send OTP Error:', err);
      setToast({ visible: true, message: err.message || 'Failed to send code', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Enter 6-digit OTP' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await confirmationResult.confirm(otp);
      setUser(result.user);
      navigation.navigate('SetupFlow');
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setToast({ visible: true, message: 'Invalid OTP', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    if (provider === 'Google') {
      handleGoogleLogin();
    } else if (provider === 'Apple') {
      handleAppleLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleRetries={3}
      />

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

          {!confirmationResult ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <CountryPicker 
                  selectedCountry={country} 
                  onSelect={setCountry} 
                />
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.textMuted}
                    value={phoneNumber}
                    onChangeText={v => { setPhoneNumber(v); setErrors({}); }}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

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
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} style={{ marginRight: SPACING.sm }} />
                <TextInput
                  style={styles.input}
                  placeholder="6-digit OTP"
                  placeholderTextColor={COLORS.textMuted}
                  value={otp}
                  onChangeText={v => { setOtp(v); setErrors({}); }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
              <TouchableOpacity onPress={() => setConfirmationResult(null)} style={{ marginBottom: SPACING.xl }}>
                <Text style={styles.termsLink}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            onPress={confirmationResult ? handleVerifyOtp : handleSendOtp} 
            style={styles.signupBtn} 
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FF7D6B', '#FF9A8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signupGrad}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.signupBtnText}>{confirmationResult ? 'Verify OTP' : 'Continue'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!confirmationResult && (
            <>
              <View style={styles.divRow}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or</Text>
                <View style={styles.divLine} />
              </View>

              <TouchableOpacity style={[styles.socialBtn, SHADOWS.card]} onPress={() => handleSocialSignup('Google')} disabled={loading}>
                <Ionicons name="logo-google" size={18} color={COLORS.textDark} />
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.socialBtn, SHADOWS.card, { marginBottom: SPACING.xl }]} onPress={() => handleSocialSignup('Apple')} disabled={loading}>
                <Ionicons name="logo-apple" size={18} color={COLORS.textDark} />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity>
            </>
          )}

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
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.card,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 14,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.danger,
    marginTop: -4,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
});

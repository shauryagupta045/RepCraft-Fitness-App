import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function AuthLandingScreen({ navigation }) {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.hero}>
          <View style={s.iconRing}>
            <Ionicons name="barbell" size={60} color="#fff" />
          </View>
          <Text style={s.title}>RepCraft</Text>
          <Text style={s.subtitle}>TRAIN · TRACK · CRAFT</Text>
        </View>

        <View style={s.footer}>
          <TouchableOpacity 
            style={s.button}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Signup')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#D96055']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.buttonGrad}
            >
              <Text style={s.buttonTextPrimary}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.button, s.buttonOutline]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.buttonTextSecondary}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.guestButton}
            onPress={() => navigation.navigate('SetupFlow')}
          >
            <Text style={s.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  hero: {
    flex: 1,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 42,
    color: COLORS.textDark,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginTop: SPACING.xs,
  },
  footer: {
    width: '100%',
    paddingBottom: SPACING.lg,
  },
  button: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  buttonGrad: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#fff',
  },
  buttonTextSecondary: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  guestButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  guestText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, settings, updateProfile, isLoading } = useAuthStore();
  
  const isMetric = settings?.units === 'metric';
  const weightUnit = isMetric ? 'kg' : 'lb';
  const heightUnit = isMetric ? 'cm' : 'in';
  
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    goal: user?.profile?.goal || '',
    level: user?.profile?.activityLevel || '',
    weight: user?.profile?.weight?.toString() || '',
    height: user?.profile?.height?.toString() || '',
    age: user?.profile?.age?.toString() || '',
  });

  const handleSave = async () => {
    try {
      // Basic validation and type conversion
      const updates = {
        displayName: formData.displayName,
        goal: formData.goal,
        activityLevel: formData.level,
        weight: parseFloat(formData.weight) || user?.profile?.weight || 0,
        height: parseFloat(formData.height) || user?.profile?.height || 0,
        age: parseInt(formData.age, 10) || user?.profile?.age || 0,
      };
      
      await updateProfile(updates);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Optional: show error toast
    }
  };

  const renderInput = (label, key, icon, keyboardType = 'default') => (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrapper}>
        <Ionicons name={icon} size={20} color={COLORS.textMuted} style={s.inputIcon} />
        <TextInput
          style={s.input}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.textLight}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.avatarSection}>
            <View style={s.avatarRing}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{(formData.name || 'A')[0].toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={s.cameraBtn} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={s.avatarNote}>Tap to change avatar</Text>
          </View>

          <View style={s.form}>
            {renderInput('Full Name', 'displayName', 'person-outline')}
            {renderInput('Fitness Goal', 'goal', 'flag-outline')}
            {renderInput('Fitness Level', 'level', 'ribbon-outline')}
            
            <View style={s.row}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                {renderInput(`Weight (${weightUnit})`, 'weight', 'scale-outline', 'numeric')}
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                {renderInput(`Height (${heightUnit})`, 'height', 'body-outline', 'numeric')}
              </View>
            </View>

            {renderInput('Age', 'age', 'calendar-outline', 'numeric')}
          </View>

          <TouchableOpacity 
            style={[s.saveBtn, SHADOWS.primary]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={s.saveBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.saveBtnText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textDark,
  },
  scroll: {
    padding: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.card,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarNote: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 54,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textDark,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    height: 56,
    marginBottom: SPACING.md,
  },
  saveBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
  },
  cancelBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textMuted,
  },
});

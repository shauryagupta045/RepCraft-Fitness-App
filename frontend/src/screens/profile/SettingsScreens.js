import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// ─── Reusable Header Component ───
const ScreenHeader = ({ title, onBack }) => (
  <View style={s.header}>
    <TouchableOpacity onPress={onBack} style={s.backBtn}>
      <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>{title}</Text>
    <View style={{ width: 40 }} />
  </View>
);

// ─── Main Settings List ───
export const SettingsMainScreen = ({ navigation }) => {
  const settingsItems = [
    { id: 'NotificationSettings', label: 'Notifications', icon: 'notifications-outline', color: COLORS.primary },
    { id: 'UnitSettings', label: 'Units & Display', icon: 'options-outline', color: COLORS.secondary },
    { id: 'Information', label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: '#6C8FC7', params: { type: 'privacy' } },
    { id: 'Information', label: 'Help & Support', icon: 'help-circle-outline', color: '#F5A623', params: { type: 'help' } },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={[s.card, SHADOWS.card]}>
          {settingsItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[s.row, i < settingsItems.length - 1 && s.rowBorder]}
              onPress={() => navigation.navigate(item.id, item.params)}
            >
              <View style={s.rowLeft}>
                <View style={[s.iconBox, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={s.rowLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Notifications Screen ───
export const NotificationSettingsScreen = ({ navigation }) => {
  const { settings, updateSettings } = useAuthStore();
  const options = [
    { id: 'daily', label: 'Daily Reminders', sub: 'Receive prompts for tracking metrics' },
    { id: 'workouts', label: 'Workout Alerts', sub: 'Status on your planned routines' },
    { id: 'diet', label: 'Diet Log Prompts', sub: 'Reminders to log your meals' },
  ];

  const toggle = (id) => {
    updateSettings({ notifications: { [id]: !settings.notifications[id] } });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll}>
        <View style={[s.card, SHADOWS.card]}>
          {options.map((opt, i) => (
            <View key={opt.id} style={[s.row, i < options.length - 1 && s.rowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{opt.label}</Text>
                <Text style={s.rowSubText}>{opt.sub}</Text>
              </View>
              <Switch
                value={settings.notifications[opt.id]}
                onValueChange={() => toggle(opt.id)}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={settings.notifications[opt.id] ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Units Screen ───
export const UnitSettingsScreen = ({ navigation }) => {
  const { settings, toggleUnits } = useAuthStore();
  const isMetric = settings.units === 'metric';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader title="Units & Display" onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll}>
        <View style={[s.card, SHADOWS.card]}>
          <TouchableOpacity style={s.row} activeOpacity={0.8} onPress={toggleUnits}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Unit System</Text>
              <Text style={s.rowSubText}>Currently using: {isMetric ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}</Text>
            </View>
            <View style={s.unitToggle}>
              <View style={[s.unitPill, isMetric && s.unitPillActive]}>
                <Text style={[s.unitText, isMetric && s.unitTextActive]}>Metric</Text>
              </View>
              <View style={[s.unitPill, !isMetric && s.unitPillActive]}>
                <Text style={[s.unitText, !isMetric && s.unitTextActive]}>Imperial</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={s.noteText}>Changing unit system will automatically convert your weight and height values in your profile.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Information Screen (Privacy / Help) ───
export const InformationScreen = ({ route, navigation }) => {
  const { type } = route.params || { type: 'privacy' };
  const isPrivacy = type === 'privacy';
  
  const content = isPrivacy ? {
    title: 'Privacy Policy',
    body: 'At RepCraft, we value your data privacy. Your workout logs and health metrics are stored locally and only synced to the cloud if you enable account backup. We do not sell your personal information to third parties. Your data is used solely to provide personalized fitness and diet insights via our AI features. Security is our top priority, and we use industry-standard encryption for all data transmissions.'
  } : {
    title: 'Help & Support',
    body: 'Need help with RepCraft? Our AI-powered assistant is always available in the AI tab to answer questions about the app. If you encounter technical issues or have feedback, please contact us at support@repcraft.app. We regularly update the app with new features and optimizations based on user feedback. Stay consistent, stay strong!'
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader title={content.title} onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll}>
        <View style={[s.card, SHADOWS.card]}>
          <Text style={s.bodyText}>{content.body}</Text>
          <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={s.btnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={s.btnText}>{isPrivacy ? 'Read Full Policy' : 'Contact Support'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  scroll: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  rowSubText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  unitToggle: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.pill, padding: 3 },
  unitPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  unitPillActive: { backgroundColor: COLORS.surface, ...SHADOWS.sm },
  unitText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  unitTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  noteText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 20 },
  bodyText: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMid, lineHeight: 22, marginBottom: SPACING.xl },
  actionBtn: { height: 50, borderRadius: RADIUS.md, overflow: 'hidden' },
  btnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
});

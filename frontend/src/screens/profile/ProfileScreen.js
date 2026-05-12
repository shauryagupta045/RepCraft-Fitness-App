/**
 * ProfileScreen — Stitch-accurate redesign
 * Clean white cards, avatar + stats, streak, badges, settings rows
 */
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { useMetricsStore } from '../../store/metricsStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import StreakToaster from '../../components/common/StreakToaster';

/* Badge definitions */
const BADGE_DEFS = [
  { id: 'streak7', icon: 'medal-outline', label: '7-Day Streak', color: COLORS.primary, unlocked: (u) => u?.streak >= 7 },
  { id: 'hydro', icon: 'water-outline', label: 'Hydration Hero', color: COLORS.secondary, unlocked: (_, __, m) => m.todayMetrics.water >= 2.5 },
  { id: 'w10', icon: 'barbell-outline', label: '10 Workouts', color: '#6C8FC7', unlocked: (_, logs) => logs.length >= 10 },
  { id: 'hyrox', icon: 'stopwatch-outline', label: 'Hyrox Starter', color: '#F5A623', unlocked: (_, __, _m, hyrox) => hyrox.length > 0 },
  { id: 'streak30', icon: 'trophy-outline', label: '30-Day Streak', color: '#FFD700', unlocked: (u) => u?.streak >= 30 },
  { id: 'sleep8', icon: 'moon-outline', label: 'Sleep Master', color: '#6C8FC7', unlocked: (_, __, m) => m.todayMetrics.sleep >= 8 },
];

function Badge({ def, unlocked }) {
  return (
    <View style={[bS.badge, !unlocked && bS.locked]}>
      <View style={[bS.iconBox, { backgroundColor: unlocked ? def.color + '18' : COLORS.border }]}>
        <Ionicons name={def.icon} size={22} color={unlocked ? def.color : COLORS.textMuted} />
        {!unlocked && (
          <View style={bS.lockDot}>
            <Ionicons name="lock-closed" size={9} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      <Text style={[bS.label, !unlocked && { color: COLORS.textMuted }]}>{def.label}</Text>
    </View>
  );
}

const bS = StyleSheet.create({
  badge: { alignItems: 'center', width: 74, marginRight: SPACING.md },
  locked: { opacity: 0.45 },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6, position: 'relative',
  },
  lockDot: {
    position: 'absolute', bottom: -3, right: -3,
    backgroundColor: COLORS.border, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  label: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textDark, textAlign: 'center', lineHeight: 13 },
});

const SETTINGS = [
  { icon: 'notifications-outline', label: 'Notifications', color: COLORS.primary, screen: 'NotificationSettings' },
  { icon: 'options-outline', label: 'Units & Display', color: COLORS.secondary, screen: 'UnitSettings' },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#6C8FC7', screen: 'Information', params: { type: 'privacy' } },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#F5A623', screen: 'Information', params: { type: 'help' } },
];

export default function ProfileScreen({ navigation }) {
  const { user, settings, logout } = useAuthStore();
  const { workoutLogs, cardioSessions, hyroxSessions } = useWorkoutStore();
  const metrics = useMetricsStore();

  const isMetric = settings.units === 'metric';
  const weightUnit = isMetric ? 'kg' : 'lb';
  const heightUnit = isMetric ? 'cm' : 'in';

  const badges = useMemo(() =>
    BADGE_DEFS.map(b => ({
      ...b,
      isUnlocked: b.unlocked(user, workoutLogs, metrics, hyroxSessions),
    })),
    [user, workoutLogs, metrics, hyroxSessions]
  );

  const totalMin = workoutLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const firstName = user?.name?.split(' ')[0] || 'Alex';

  // Last 7 days streak dots
  const today = new Date();
  const streakDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    return workoutLogs.some(l => l.date === ds);
  });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StreakToaster />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero header ── */}
        <LinearGradient
          colors={[COLORS.dark, '#252848']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Avatar */}
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(user?.name || 'A')[0].toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={s.editAvatarBtn}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={s.heroName}>{user?.name || 'Alex Jordan'}</Text>
          <Text style={s.heroEmail}>{user?.email || 'alex@repcraft.app'}</Text>

          {/* Goal pill */}
          <View style={s.goalPill}>
            <Ionicons name="barbell-outline" size={12} color={COLORS.primary} />
            <Text style={s.goalText}>{user?.goal || 'Build Muscle'} · {user?.level || 'Intermediate'}</Text>
          </View>
        </LinearGradient>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          {[
            { icon: 'barbell-outline', label: 'Workouts', value: workoutLogs.length, color: COLORS.primary },
            { icon: 'bicycle-outline', label: 'Cardio', value: cardioSessions.length, color: COLORS.secondary },
            { icon: 'time-outline', label: 'Hours', value: Math.round(totalMin / 60), color: '#6C8FC7' },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, SHADOWS.card]}>
              <Text style={[s.statNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Streak card ── */}
        {user?.streak > 0 && (
          <View style={[s.card, SHADOWS.card]}>
            <View style={s.cardHeader}>
              <View style={s.cardHeaderLeft}>
                <Ionicons name="trophy-outline" size={20} color="#FFD700" />
                <Text style={s.cardTitle}>Current Streak</Text>
              </View>
              <Text style={s.streakCount}>{user?.streak} days</Text>
            </View>

            <View style={s.streakDots}>
              {streakDots.map((active, i) => (
                <View key={i} style={s.streakCol}>
                  <View style={[s.dot, active ? s.dotActive : s.dotInactive]}>
                    {active && <Ionicons name="flame" size={11} color="#fff" />}
                  </View>
                  <Text style={s.dotDay}>{days[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Badges ── */}
        <View style={[s.card, SHADOWS.card]}>
          <Text style={s.cardTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.md }}>
            {badges.map(b => <Badge key={b.id} def={b} unlocked={b.isUnlocked} />)}
          </ScrollView>
        </View>

        {/* ── Personal info ── */}
        <View style={[s.card, SHADOWS.card]}>
          <View style={s.cardHeader}>
            <View style={s.cardHeaderLeft}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <Text style={s.cardTitle}>Personal Info</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {[
            { icon: 'flag-outline', label: 'Goal', value: user?.goal || 'Build Muscle' },
            { icon: 'ribbon-outline', label: 'Level', value: user?.level || 'Intermediate' },
            { icon: 'scale-outline', label: 'Weight', value: `${user?.weight || 82} ${weightUnit}` },
            { icon: 'body-outline', label: 'Height', value: `${user?.height || 180} ${heightUnit}` },
            { icon: 'person-outline', label: 'Age', value: `${user?.age || 28}` },
          ].map((row, i, arr) => (
            <View key={row.label} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
              <View style={s.infoLeft}>
                <Ionicons name={row.icon} size={17} color={COLORS.textMuted} />
                <Text style={s.infoLabel}>{row.label}</Text>
              </View>
              <Text style={s.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Settings ── */}
        <View style={[s.card, SHADOWS.card]}>
          <Text style={s.cardTitle}>Settings</Text>
          {SETTINGS.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[s.infoRow, i < SETTINGS.length - 1 && s.infoRowBorder]}
              onPress={() => navigation.navigate(row.screen, row.params)}
              activeOpacity={0.7}
            >
              <View style={s.infoLeft}>
                <View style={[s.settingIcon, { backgroundColor: row.color + '18' }]}>
                  <Ionicons name={row.icon} size={16} color={row.color} />
                </View>
                <Text style={s.infoLabel}>{row.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={[s.logoutBtn, SHADOWS.card]}
          onPress={() => {
            logout();
            // RootNavigator automatically switches to Auth stack
          }}
          activeOpacity={0.88}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>RepCraft v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 0 },

  hero: {
    paddingTop: SPACING.xl, paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md, position: 'relative',
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.black, fontSize: 30, color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.dark,
  },
  heroName: { fontFamily: FONTS.black, fontSize: 22, color: '#fff', marginBottom: 3 },
  heroEmail: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: SPACING.sm },
  goalPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(232,112,94,0.22)',
    borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 5,
  },
  goalText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary, marginLeft: 5 },

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginTop: -24, marginBottom: SPACING.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card, padding: SPACING.md,
    alignItems: 'center', marginHorizontal: 4,
  },
  statNum: { fontFamily: FONTS.black, fontSize: 24 },
  statLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card, padding: SPACING.lg,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, marginLeft: 8 },
  streakCount: { fontFamily: FONTS.black, fontSize: 20, color: '#FFD700' },

  streakDots: { flexDirection: 'row', justifyContent: 'space-between' },
  streakCol: { alignItems: 'center' },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dotActive: { backgroundColor: COLORS.primary },
  dotInactive: { backgroundColor: COLORS.border },
  dotDay: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textMuted },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  infoLabel: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textDark, marginLeft: 10 },
  infoValue: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.lg, paddingVertical: 15,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.button,
    borderWidth: 1.5, borderColor: COLORS.danger + '40',
    marginBottom: SPACING.md,
  },
  logoutText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.danger, marginLeft: 8 },
  version: {
    fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: SPACING.sm,
  },
  editLink: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring,
} from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { useMetricsStore } from '../../store/metricsStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { PedometerService } from '../../services/sensors/pedometerService';
import {
  ReadinessCard,
  StepCard,
  CaloriesCard,
  WaterCard,
  SleepCard,
  WorkoutWeekCard,
  DietTargetsCard,
} from '../../components/home/HomeCards';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// Staggered fade-in animation wrapper
function AnimCard({ children, index }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(18);

  useEffect(() => {
    opacity.value = withDelay(index * 70, withSpring(1, { damping: 20 }));
    ty.value = withDelay(index * 70, withSpring(0, { damping: 20 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { weeklyData, todayMetrics, setSteps, resetDailyStepsIfNewDay } = useMetricsStore();
  const { routines, workoutLogs } = useWorkoutStore();
  const todayRoutine = routines[0];

  const [showCount, setShowCount] = useState(true);
  const [pedometerStatus, setPedometerStatus] = useState('initializing'); // 'initializing' | 'unavailable' | 'denied' | 'active' | 'error'
  const notificationCount = 5; // Example count

  useEffect(() => {
    // Reset step count to 0 if it's a new calendar day
    resetDailyStepsIfNewDay();

    const timer = setTimeout(() => {
      setShowCount(false);
    }, 15000);

    let subscription;
    const initPedometer = async () => {
      try {
        // Check availability
        const isAvailable = await PedometerService.isAvailable();
        if (!isAvailable) {
          setPedometerStatus('unavailable');
          return;
        }

        // Request permission
        const granted = await PedometerService.requestPermissions();
        if (!granted) {
          setPedometerStatus('denied');
          return;
        }

        // Step 1: get steps walked from midnight until now
        const initialSteps = await PedometerService.getStepsToday();
        setSteps(Math.max(0, initialSteps));
        setPedometerStatus('active');

        // Step 2: subscribe — result.steps = steps taken SINCE subscription started
        // Total = initialSteps (before subscription) + sessionSteps (since subscription)
        subscription = PedometerService.subscribe((sessionSteps) => {
          setSteps(Math.max(0, initialSteps + sessionSteps));
        });
      } catch (err) {
        console.error('Pedometer error:', err);
        setPedometerStatus('error');
      }
    };

    initPedometer();

    return () => {
      clearTimeout(timer);
      if (subscription) subscription.remove();
    };
  }, []);


  const hour = new Date().getHours();
  const greetingUpper = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const firstName = user?.name?.split(' ')[0] || 'Alex';
  const weekSteps = weeklyData.map((d) => d.steps);
  const weekWater = weeklyData.map((d) => d.water);
  const weekSleep = weeklyData.map((d) => d.sleep);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header (Stitch: small avatar, GOOD MORNING, Hello Alex) ── */}
        <AnimCard index={0}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Avatar circle with initial */}
              <TouchableOpacity 
                style={styles.avatarRing}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.greetingCol}>
                <Text style={styles.greetingSmall}>{greetingUpper}</Text>
                <Text style={styles.greetingLarge}>Hello, {firstName}</Text>
              </View>
            </View>
            {/* Bell */}
            <TouchableOpacity 
              style={styles.bellBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#6C7A87" />
              {notificationCount > 0 && (
                <View style={[styles.badge, !showCount && styles.dotBadge]}>
                  {showCount && <Text style={styles.badgeText}>{notificationCount}</Text>}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </AnimCard>

        {/* ── Streak Banner ── */}
        <AnimCard index={1}>
          <LinearGradient
            colors={[COLORS.dark, '#252848']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakBanner}
          >
            <Ionicons name="trophy-outline" size={18} color="#FFD700" />
            <Text style={styles.streakText}>
              <Text style={styles.streakNum}>{user?.streak || 14}</Text>
              {' '}day streak — keep it up!
            </Text>
            <Ionicons name="flame" size={18} color={COLORS.primary} />
          </LinearGradient>
        </AnimCard>

        {/* ── Readiness Card ── */}
        <AnimCard index={2}>
          <ReadinessCard onPress={() => navigation.navigate('ReadinessDetail')} />
        </AnimCard>

        {/* ── Step Counter ── */}
        <AnimCard index={3}>
          <StepCard
            onPress={() => navigation.navigate('StepDetail')}
            weekData={weekSteps}
            pedometerStatus={pedometerStatus}
          />
        </AnimCard>

        {/* ── Daily Calories ── */}
        <AnimCard index={4}>
          <CaloriesCard onPress={() => navigation.navigate('CaloriesDetail')} />
        </AnimCard>

        {/* ── Water + Sleep (half row) ── */}
        <AnimCard index={5}>
          <View style={styles.halfRow}>
            <WaterCard
              onPress={() => navigation.navigate('WaterDetail')}
              weekData={weekWater}
            />
            <View style={{ width: SPACING.md }} />
            <SleepCard
              onPress={() => navigation.navigate('SleepDetail')}
              weekData={weekSleep}
            />
          </View>
        </AnimCard>

        {/* ── Workout Week ── */}
        <AnimCard index={6}>
          <WorkoutWeekCard
            onPress={() => navigation.navigate('WorkoutWeekDetail')}
            logs={workoutLogs}
          />
        </AnimCard>

        {/* ── Today's Workout Plan ── */}
        {todayRoutine ? (
          <AnimCard index={7}>
            <View style={[styles.todayCard, SHADOWS.card]}>
              <LinearGradient
                colors={[COLORS.dark, '#262A4A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.todayGrad}
              >
                <View style={styles.todayHeader}>
                  <Text style={styles.todayLabel}>Today's Plan</Text>
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyText}>READY</Text>
                  </View>
                </View>
                <Text style={styles.todayTitle}>{todayRoutine.title}</Text>
                <Text style={styles.todayMuscle}>{todayRoutine.muscleGroup}</Text>
                <Text style={styles.todayMeta}>
                  {todayRoutine.exercises.length} exercises · ~60 min
                </Text>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => navigation.navigate('Workout', { screen: 'WorkoutMain' })}
                >
                  <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startBtnGrad}
                  >
                    <Ionicons name="play-circle-outline" size={19} color="#fff" />
                    <Text style={styles.startBtnText}>Start Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </AnimCard>
        ) : null}

        {/* ── Diet Targets ── */}
        <AnimCard index={8}>
          <DietTargetsCard onPress={() => navigation.navigate('DailyTargetsDetail')} />
        </AnimCard>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },

  // ── Header (matches Stitch) ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E232A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  greetingCol: { justifyContent: 'center' },
  greetingSmall: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#8A94A6',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  greetingLarge: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#0A1B28',
    letterSpacing: -0.2,
  },
  bellBtn: { padding: 6, marginRight: -6, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    zIndex: 10,
  },
  dotBadge: {
    minWidth: 10,
    height: 10,
    top: 5,
    right: 5,
    borderRadius: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 12,
  },
  bellDot: {
    display: 'none',
  },

  // ── Streak banner ──
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  streakText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    marginHorizontal: SPACING.sm,
  },
  streakNum: { fontFamily: FONTS.black, fontSize: 15, color: '#FFD700' },

  // ── Half row ──
  halfRow: { flexDirection: 'row', marginBottom: SPACING.md },

  // ── Today's Plan card ──
  todayCard: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  todayGrad: {
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  todayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  readyBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  readyText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 1,
  },
  todayTitle: {
    fontFamily: FONTS.black,
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  todayMuscle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 3,
  },
  todayMeta: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: SPACING.lg,
  },
  startBtn: { borderRadius: RADIUS.button, overflow: 'hidden' },
  startBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  startBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
    marginLeft: 7,
  },
});

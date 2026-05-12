/**
 * WorkoutScreen — Stitch-accurate
 * Material top tabs: My Routine | Cardio | Hyrox
 * Each tab fully redesigned to match Stitch
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useAuthStore } from '../../store/authStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { LocationService } from '../../services/locationService';
import { PedometerService } from '../../services/sensors/pedometerService';
const MapView = Platform.OS !== 'web' ? require('react-native-maps').default : View;
const Polyline = Platform.OS !== 'web' ? require('react-native-maps').Polyline : View;
const Marker = Platform.OS !== 'web' ? require('react-native-maps').Marker : View;

const Tab = createMaterialTopTabNavigator();

/* ─────────────────────────────────────────────────────────────────────────────
   MY ROUTINE TAB
   Stitch: list of day cards — coral day badge, title, muscle group, exercise chips
   + coral gradient "Start" button, floating + FAB
─────────────────────────────────────────────────────────────────────────────── */


function MyRoutineTab({ navigation }) {
  const { routines, workoutLogs, cardioSessions, hyroxSessions } = useWorkoutStore();

  const parseDurationToMinutes = (durationStr) => {
    if (typeof durationStr === 'number') return durationStr;
    if (!durationStr || typeof durationStr !== 'string') return 0;
    const parts = durationStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
    } else if (parts.length === 2) {
      return parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    return parseFloat(durationStr) || 0;
  };

  const performanceScore = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const relevantWorkouts = workoutLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
    const relevantCardio = cardioSessions.filter(s => new Date(s.date) >= sevenDaysAgo);
    const relevantHyrox = hyroxSessions.filter(s => new Date(s.date) >= sevenDaysAgo);

    if (relevantWorkouts.length === 0 && relevantCardio.length === 0 && relevantHyrox.length === 0) return 0; 

    let totalScore = 0;
    let counts = 0;

    relevantWorkouts.forEach(log => {
      totalScore += (log.effort || 0) * 10;
      counts++;
    });

    relevantCardio.forEach(s => {
      const dur = parseFloat(s.duration) || 0;
      const rpeVal = parseFloat(s.rpe) || 0;
      const sessionScore = Math.min(100, (dur / 30) * 50 + (rpeVal / 10) * 50);
      if (!isNaN(sessionScore)) {
        totalScore += sessionScore;
        counts++;
      }
    });

    relevantHyrox.forEach(s => {
      const dur = parseDurationToMinutes(s.duration);
      const diff = parseFloat(s.difficulty) || 0;
      const sessionScore = Math.min(100, (dur / 30) * 50 + (diff / 5) * 50);
      if (!isNaN(sessionScore)) {
        totalScore += sessionScore;
        counts++;
      }
    });

    return counts > 0 ? Math.round(totalScore / counts) : 0;
  }, [workoutLogs, cardioSessions, hyroxSessions]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={rS.scroll}
      >
        {routines.length === 0 ? (
          <View style={rS.empty}>
            <View style={rS.emptyIcon}>
              <Ionicons name="barbell-outline" size={44} color={COLORS.textMuted} />
            </View>
            <Text style={rS.emptyTitle}>No routines yet</Text>
            <Text style={rS.emptyBody}>Tap the + button to build your first workout</Text>
          </View>
        ) : (
          routines.map((r, index) => <RoutineCard key={r.id} routine={r} navigation={navigation} index={index} />)
        )}

        {/* Performance Section */}
        <View style={pS.perfScoreCard}>
          <Text style={pS.perfScoreTitle}>PERFORMANCE SCORE</Text>
          <View style={pS.perfScoreRow}>
            <View>
              <Text style={pS.perfScoreVal}>{performanceScore}%</Text>
              <Text style={pS.perfScoreSub}>{performanceScore > 0 ? 'Tracking your progress' : 'Complete a session to start'}</Text>
            </View>
            <View style={pS.perfScoreChart}>
              <View style={[pS.bar, { height: 20, backgroundColor: performanceScore > 20 ? '#17584D' : 'rgba(23,88,77,0.3)' }]} />
              <View style={[pS.bar, { height: 35, backgroundColor: performanceScore > 40 ? '#17584D' : 'rgba(23,88,77,0.3)' }]} />
              <View style={[pS.bar, { height: 50, backgroundColor: performanceScore > 60 ? '#17584D' : 'rgba(23,88,77,0.3)' }]} />
              <View style={[pS.bar, { height: 25, backgroundColor: performanceScore > 80 ? '#17584D' : 'rgba(23,88,77,0.3)' }]} />
            </View>
          </View>
        </View>

        <View style={pS.statsGrid}>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <View style={pS.statHeader}>
              <Text style={pS.statCardTitle}>WEEKLY VOLUME</Text>
              <Ionicons name="stats-chart" size={12} color="#D96055" />
            </View>
            <Text style={pS.statVal}>0</Text>
            <Text style={pS.statDelta}>0% VS LAST WEEK</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <View style={pS.statHeader}>
              <Text style={pS.statCardTitleLight}>RECENT PR</Text>
              <Ionicons name="trophy" size={12} color="#D96055" />
            </View>
            <Text style={pS.statVal}>0</Text>
            <Text style={pS.statSubLight}>NO DATA</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <Ionicons name="flame" size={20} color="#D96055" style={{ marginBottom: 8 }} />
            <Text style={pS.statVal}>0</Text>
            <Text style={pS.statSubLight}>KCAL</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <Ionicons name="stopwatch" size={20} color="#17584D" style={{ marginBottom: 8 }} />
            <Text style={pS.statVal}>0h</Text>
            <Text style={pS.statSubLight2}>UPTIME</Text>
          </View>
        </View>




        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={rS.fab}
        onPress={() => navigation.navigate('RoutineBuilder', {})}
        activeOpacity={0.88}
      >
        <LinearGradient colors={['#F57D71', '#DE6659']} style={rS.fabGrad}>
          <Ionicons name="add" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function RoutineCard({ routine, navigation, index }) {
  const isFirst = index % 2 === 0;

  const pillBg = isFirst ? '#FFF0EE' : '#E6F6F2';
  const pillText = isFirst ? '#F7706A' : '#49A28A';

  const preview = routine.exercises.slice(0, 3);

  return (
    <TouchableOpacity
      style={[rS.card, SHADOWS.md]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RoutineBuilder', { routineId: routine.id })}
    >
      <View style={rS.cardHeader}>
        <View style={[rS.dayPill, { backgroundColor: pillBg }]}>
          <Text style={[rS.dayPillText, { color: pillText }]}>{routine.day.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={rS.cardTitle}>{routine.title}</Text>
      <Text style={rS.cardDesc}>
        {routine.muscleGroup} focused training day.
      </Text>

      <View style={rS.exerciseList}>
        {preview.map((ex, i) => (
          <View key={ex.id} style={rS.exerciseListItem}>
            <View style={rS.exLeft}>
              <View style={rS.exBullet} />
              <Text style={rS.exName}>{ex.name}</Text>
            </View>
            <Text style={rS.exSetsReps}>{ex.sets} x {ex.reps}</Text>
          </View>
        ))}
      </View>

      {routine.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('ActiveWorkout', { routine })}
          activeOpacity={0.88}
          style={rS.startBtn}
        >
          <LinearGradient
            colors={['#DE6659', '#F47F71']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={rS.startGrad}
          >
            <Text style={rS.startText}>Start Routine</Text>
            <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 6 }} />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate('RoutineBuilder', { routineId: routine.id })}
          activeOpacity={0.88}
          style={rS.viewBtn}
        >
          <Text style={rS.viewText}>View & Edit Routine</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const rS = StyleSheet.create({
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark, marginBottom: 6 },
  emptyBody: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayPill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  dayPillText: { fontFamily: FONTS.bold, fontSize: 10, letterSpacing: 0.5 },
  editBtn: { padding: 4 },
  cardTitle: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark, marginBottom: 6 },
  cardDesc: { fontFamily: FONTS.regular, fontSize: 13, color: '#6A7185', marginBottom: 20, lineHeight: 18 },
  exerciseList: { marginBottom: 24 },
  exerciseListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exLeft: { flexDirection: 'row', alignItems: 'center' },
  exBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#17584D', marginRight: 12 },
  exName: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textDark },
  exSetsReps: { fontFamily: FONTS.regular, fontSize: 13, color: '#F1A9A0' },
  startBtn: { borderRadius: 12, overflow: 'hidden' },
  startGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  startText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
  viewBtn: { borderRadius: 12, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  viewText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 30, overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0px 8px 16px rgba(222,102,89,0.4)' }, default: { shadowColor: '#DE6659', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 } }) },
  fabGrad: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
});

const pS = StyleSheet.create({
  perfScoreCard: { backgroundColor: '#E6FAF5', borderRadius: 24, padding: 20, marginBottom: 20 },
  perfScoreTitle: { fontFamily: FONTS.bold, fontSize: 11, color: '#49A28A', letterSpacing: 1, marginBottom: 12 },
  perfScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  perfScoreVal: { fontFamily: FONTS.black, fontSize: 48, color: '#17584D', lineHeight: 52, letterSpacing: -1.5 },
  perfScoreSub: { fontFamily: FONTS.medium, fontSize: 12, color: '#49A28A' },
  perfScoreChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingBottom: 4 },
  bar: { width: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 16 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statCardTitle: { fontFamily: FONTS.bold, fontSize: 10, color: '#D96055', letterSpacing: 0.5 },
  statCardTitleLight: { fontFamily: FONTS.bold, fontSize: 10, color: '#EDC9C7', letterSpacing: 0.5 },
  statVal: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark, marginBottom: 4, letterSpacing: -0.5 },
  statDelta: { fontFamily: FONTS.bold, fontSize: 10, color: '#49A28A' },
  statSubLight: { fontFamily: FONTS.bold, fontSize: 10, color: '#EDC9C7' },
  statSubLight2: { fontFamily: FONTS.bold, fontSize: 10, color: '#F1A9A0' },
});

/* ─────────────────────────────────────────────────────────────────────────────
   CARDIO TAB
   Stitch: activity type pills (Run/Cycle/Row/Swim/HIIT), duration+distance,
   RPE selector (dots), save button, past sessions list with teal left border
─────────────────────────────────────────────────────────────────────────────── */
const CARDIO_TYPES = [
  { label: 'Run', icon: 'walk-outline', color: '#FF7669' },
  { label: 'Cycle', icon: 'bicycle-outline', color: '#4ECDC4' },
  { label: 'Treadmill', icon: 'speedometer-outline', color: '#6C8FC7' },
  { label: 'Stairclimber', icon: 'trending-up-outline', color: '#F5A623' },
  { label: 'Walk', icon: 'walk', color: '#27AE60' },
  { label: 'Swim', icon: 'water-outline', color: '#3498DB' },
  { label: 'Indoor Cycling', icon: 'bicycle', color: '#9B59B6' },
  { label: 'Custom', icon: 'ellipsis-horizontal-outline', color: '#95A5A6' },
];

function CardioTab() {
  const { cardioSessions, addCardioSession } = useWorkoutStore();
  const [type, setType] = useState('Run');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [heartRate, setHeartRate] = useState('--');
  const [viewMode, setViewMode] = useState('PACE'); // 'PACE' or 'SPEED'
  const [rpe, setRpe] = useState(7);
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  // Active Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [route, setRoute] = useState([]);
  const [liveDistance, setLiveDistance] = useState(0);
  const [liveSteps, setLiveSteps] = useState(0);

  useEffect(() => {
    let interval;
    let locationSub;
    let pedometerSub;

    if (isTracking && !isPaused) {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

      const startTracking = async () => {
        locationSub = await LocationService.watchPosition((coords) => {
          setRoute(prev => {
            const last = prev[prev.length - 1];
            if (last) {
              const d = LocationService.calculateDistance(last.latitude, last.longitude, coords.latitude, coords.longitude);
              setLiveDistance(dist => dist + d);
            }
            return [...prev, coords];
          });
        });

        const isPedoAvail = await PedometerService.isAvailable();
        if (isPedoAvail) {
          pedometerSub = PedometerService.subscribe((steps) => {
            setLiveSteps(s => s + steps);
          });
        }
      };
      startTracking();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (locationSub && locationSub.remove) locationSub.remove();
      if (pedometerSub && pedometerSub.remove) pedometerSub.remove();
    };
  }, [isTracking, isPaused]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculatePace = () => {
    const timeInMins = isTracking ? elapsedSeconds / 60 : parseFloat(duration) || 0;
    const distInKm = isTracking ? liveDistance : parseFloat(distance) || 0;
    if (timeInMins === 0 || distInKm === 0) return '0:00';

    const paceSecondsPerKm = (timeInMins * 60) / distInKm;
    const min = Math.floor(paceSecondsPerKm / 60);
    const sec = Math.round(paceSecondsPerKm % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const calculateSpeed = () => {
    const timeInHrs = isTracking ? elapsedSeconds / 3600 : (parseFloat(duration) || 0) / 60;
    const distInKm = isTracking ? liveDistance : parseFloat(distance) || 0;
    if (timeInHrs === 0 || distInKm === 0) return '0.0';
    return (distInKm / timeInHrs).toFixed(1);
  };

  const startTracking = () => {
    setElapsedSeconds(0);
    setLiveDistance(0);
    setLiveSteps(0);
    setRoute([]);
    setIsPaused(false);
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setDuration(Math.round(elapsedSeconds / 60).toString());
    setDistance(liveDistance.toFixed(2));
  };

  const save = () => {
    const finalDuration = isTracking ? Math.round(elapsedSeconds / 60) : parseInt(duration);
    const finalDistance = isTracking ? liveDistance : parseFloat(distance);

    if (!finalDuration && !isTracking) return;

    addCardioSession({
      type,
      duration: finalDuration,
      distance: finalDistance || 0,
      heartRate: heartRate === '--' ? null : parseInt(heartRate),
      rpe,
      calories: parseInt(calories) || 0,
      notes,
      route: route.length > 0 ? route : null,
      date: new Date().toISOString().split('T')[0],
    });

    setDuration(''); setDistance(''); setNotes(''); setCalories('');
    setRoute([]); setLiveDistance(0); setElapsedSeconds(0);
    setIsTracking(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cS.scroll}
        showsVerticalScrollIndicator={false}
      >
        {!isTracking ? (
          <>
            <Text style={cS.selectActivityTitle}>SELECT ACTIVITY</Text>

            {/* Activity Grid */}
            <View style={cS.activityGrid}>
              {CARDIO_TYPES.map(t => (
                <TouchableOpacity
                  key={t.label}
                  onPress={() => setType(t.label)}
                  style={[
                    cS.activityCard,
                    type === t.label && { backgroundColor: t.color, borderColor: t.color }
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={24}
                    color={type === t.label ? '#fff' : t.color}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[cS.activityCardText, type === t.label && { color: '#fff' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual Entry or Start Button */}
            <View style={[cS.logCard, SHADOWS.card]}>
              <TouchableOpacity
                onPress={startTracking}
                activeOpacity={0.9}
                style={[cS.startTrackerBtn, { backgroundColor: CARDIO_TYPES.find(t => t.label === type)?.color || COLORS.primary }]}
              >
                <Ionicons name="play-circle" size={32} color="#fff" />
                <View style={{ marginLeft: 16 }}>
                  <Text style={cS.startTrackerTitle}>Start Tracking {type}</Text>
                  <Text style={cS.startTrackerSub}>GPS & Pedometer Enabled</Text>
                </View>
              </TouchableOpacity>

              <View style={cS.dividerRow}>
                <View style={cS.dividerLine} />
                <Text style={cS.dividerText}>OR MANUAL ENTRY</Text>
                <View style={cS.dividerLine} />
              </View>

              <View style={cS.logRow}>
                <View style={cS.logCol}>
                  <Text style={cS.logLabel}>DURATION</Text>
                  <View style={cS.logValueRow}>
                    <TextInput
                      style={cS.logInput}
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <Text style={cS.logUnit}>min</Text>
                  </View>
                  <View style={[cS.logUnderline, { backgroundColor: CARDIO_TYPES.find(t => t.label === type)?.color || COLORS.primary }]} />
                </View>
                <View style={cS.logCol}>
                  <Text style={cS.logLabel}>DISTANCE</Text>
                  <View style={cS.logValueRow}>
                    <TextInput
                      style={cS.logInput}
                      value={distance}
                      onChangeText={setDistance}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <Text style={cS.logUnit}>km</Text>
                  </View>
                  <View style={cS.logUnderline} />
                </View>
              </View>

              {/* Heart Rate Section */}
              <View style={cS.hrContainer}>
                <View style={cS.hrInfo}>
                  <Ionicons name="heart" size={24} color="#FF7669" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={cS.hrLabel}>AVG HEART RATE</Text>
                    <TextInput
                      style={cS.hrValue}
                      value={heartRate}
                      onChangeText={setHeartRate}
                      keyboardType="number-pad"
                      placeholder="--"
                    />
                  </View>
                </View>
                <View style={cS.zoneBadge}>
                  <Text style={cS.zoneText}>ZONE 2</Text>
                </View>
              </View>

              <TouchableOpacity onPress={save} activeOpacity={0.88} style={cS.logBtn}>
                <LinearGradient
                  colors={['#DE6659', '#F47F71']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={cS.logBtnGrad}
                >
                  <Text style={cS.logBtnText}>{saved ? 'Logged!' : 'Log Manual Session'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ACTIVE TRACKING VIEW */
          <View style={cS.activeContainer}>
            <View style={[cS.activeHeader, { backgroundColor: CARDIO_TYPES.find(t => t.label === type)?.color || COLORS.primary }]}>
              <Text style={cS.activeType}>{type.toUpperCase()}</Text>
              <Text style={cS.activeTimer}>{formatTime(elapsedSeconds)}</Text>
            </View>

            <View style={cS.liveStatsGrid}>
              <View style={cS.liveStatCard}>
                <Text style={cS.liveStatLabel}>DISTANCE</Text>
                <Text style={cS.liveStatValue}>{liveDistance.toFixed(2)} <Text style={cS.liveStatUnit}>km</Text></Text>
              </View>
              <View style={cS.liveStatCard}>
                <Text style={cS.liveStatLabel}>PACE</Text>
                <Text style={cS.liveStatValue}>{calculatePace()} <Text style={cS.liveStatUnit}>min/km</Text></Text>
              </View>
              <View style={cS.liveStatCard}>
                <Text style={cS.liveStatLabel}>STEPS</Text>
                <Text style={cS.liveStatValue}>{liveSteps} <Text style={cS.liveStatUnit}>pts</Text></Text>
              </View>
              <View style={cS.liveStatCard}>
                <Text style={cS.liveStatLabel}>CALORIES</Text>
                <Text style={cS.liveStatValue}>{Math.round(elapsedSeconds * 0.15)} <Text style={cS.liveStatUnit}>kcal</Text></Text>
              </View>
            </View>

            {/* Live Map */}
            <View style={cS.liveMapContainer}>
              {Platform.OS !== 'web' ? (
                <MapView
                  style={cS.map}
                  initialRegion={{
                    latitude: route[0]?.latitude || 37.78825,
                    longitude: route[0]?.longitude || -122.4324,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  showsUserLocation
                >
                  {route.length > 0 && (
                    <Polyline
                      coordinates={route}
                      strokeColor="#FF7669"
                      strokeWidth={4}
                    />
                  )}
                </MapView>
              ) : (
                <View style={cS.mapPlaceholder}>
                  <Ionicons name="navigate" size={48} color={COLORS.textLight} />
                  <Text style={cS.mapPlaceholderText}>Live GPS Tracking Active</Text>
                  <Text style={cS.mapPlaceholderSub}>{route.length} points recorded</Text>
                </View>
              )}
            </View>

            <View style={cS.activeControls}>
              <TouchableOpacity
                onPress={() => setIsPaused(!isPaused)}
                style={cS.pauseBtn}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopTracking}
                style={cS.stopBtn}
              >
                <Text style={cS.stopBtnText}>FINISH</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pace / Speed Toggle (Only for manual/review) */}
        {!isTracking && (
          <View style={[cS.logCard, SHADOWS.card, { marginTop: -16 }]}>
            <View style={cS.paceSpeedHeader}>
              <Text style={cS.logLabel}>PACE / SPEED</Text>
              <View style={cS.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setViewMode('PACE')}
                  style={[cS.toggleBtn, viewMode === 'PACE' && cS.toggleBtnActive]}
                >
                  <Text style={[cS.toggleText, viewMode === 'PACE' && cS.toggleTextActive]}>PACE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode('SPEED')}
                  style={[cS.toggleBtn, viewMode === 'SPEED' && cS.toggleBtnActive]}
                >
                  <Text style={[cS.toggleText, viewMode === 'SPEED' && cS.toggleTextActive]}>SPEED</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={cS.calcBox}>
              <Text style={cS.calcValue}>
                {viewMode === 'PACE' ? calculatePace() : calculateSpeed()}
              </Text>
              <Text style={cS.calcUnit}>
                {viewMode === 'PACE' ? 'min/km' : 'km/h'}
              </Text>
            </View>
          </View>
        )}

        {/* Calories & Notes */}
        <View style={cS.bottomInputs}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={cS.logLabel}>CALORIES</Text>
            <TextInput
              style={cS.miniInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cS.logLabel}>NOTES</Text>
            <TextInput
              style={cS.miniInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Route..."
              multiline={false}
            />
          </View>
        </View>

        {/* Map Section (Run/Walk Only) */}
        {(type === 'Run' || type === 'Walk') && (
          <View style={cS.mapSection}>
            <Text style={cS.logLabel}>ROUTE MAP</Text>
            <View style={cS.mapPlaceholder}>
              <Ionicons name="map-outline" size={32} color={COLORS.textLight} />
              <Text style={cS.mapText}>GPS Route Tracked</Text>
              <View style={cS.mapLine} />
            </View>
          </View>
        )}

        <TouchableOpacity onPress={save} activeOpacity={0.88} style={cS.logBtn}>
          <LinearGradient
            colors={['#DE6659', '#F47F71']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={cS.logBtnGrad}
          >
            <Text style={cS.logBtnText}>{saved ? 'Logged!' : 'Log Session'}</Text>
            <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Past sessions */}
        {cardioSessions.length > 0 && (
          <>
            <View style={cS.historyHeader}>
              <Text style={cS.historyTitle}>Recent Sessions</Text>
              <TouchableOpacity><Text style={cS.seeAll}>SEE ALL</Text></TouchableOpacity>
            </View>
            {cardioSessions.map(s => (
              <View key={s.id} style={[cS.sessionItem, SHADOWS.sm]}>
                <View style={cS.sessionIconBox}>
                  <Ionicons
                    name={CARDIO_TYPES.find(t => t.label === s.type)?.icon || 'walk'}
                    size={20}
                    color={CARDIO_TYPES.find(t => t.label === s.type)?.color || COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={cS.sessionTitleText}>{s.type}</Text>
                  <Text style={cS.sessionMetaText}>{s.date} • {s.duration}m {s.calories ? `• ${s.calories} kcal` : ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={cS.sessionDistText}>{s.distance} km</Text>
                  <View style={cS.rpeBadgeSmall}>
                    <Text style={cS.rpeBadgeTextSmall}>RPE {s.rpe}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const cS = StyleSheet.create({
  scroll: { padding: SPACING.lg, paddingBottom: 100 },
  selectActivityTitle: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMid, letterSpacing: 1, marginBottom: 20 },

  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  activityCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 }
    })
  },
  activityCardText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textMid, marginTop: 4 },

  logCard: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 24, marginBottom: 32 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  logCol: { width: '45%' },
  logLabel: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.textMid, letterSpacing: 0.5, marginBottom: 8 },
  logValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  logInput: { fontFamily: FONTS.black, fontSize: 36, color: COLORS.textDark, marginRight: 8, padding: 0 },
  logUnit: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textLight },
  logUnderline: { height: 3, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 8, width: '100%' },

  hrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FD',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24
  },
  hrInfo: { flexDirection: 'row', alignItems: 'center' },
  hrLabel: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMid, letterSpacing: 0.5 },
  hrValue: { fontFamily: FONTS.black, fontSize: 20, color: COLORS.textDark, padding: 0, marginTop: -4 },
  zoneBadge: { backgroundColor: '#E1F5F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  zoneText: { fontFamily: FONTS.bold, fontSize: 10, color: '#49A28A' },

  paceSpeedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#EDF1F7', borderRadius: 12, padding: 4 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#FFFFFF' },
  toggleText: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMid },
  toggleTextActive: { color: COLORS.textDark },

  calcBox: { alignItems: 'center', marginBottom: 24 },
  calcValue: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark },
  calcUnit: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textLight },

  rpeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  rpeValueText: { fontFamily: FONTS.black, fontSize: 20, color: '#FF7669' },
  rpeScale: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  rpeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0F2F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rpeCircleText: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },

  bottomInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  miniInput: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8
  },

  mapSection: { marginBottom: 24 },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F8F9FD',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  },
  mapText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  mapLine: { position: 'absolute', width: '60%', height: 2, backgroundColor: '#FF766933', top: '50%' },

  logBtn: { borderRadius: 24, overflow: 'hidden' },
  logBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  logBtnText: { fontFamily: FONTS.black, fontSize: 18, color: '#fff', letterSpacing: 0.5 },

  /* Active Tracker Styles */
  startTrackerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },
  startTrackerTitle: { fontFamily: FONTS.black, fontSize: 18, color: '#fff' },
  startTrackerSub: { fontFamily: FONTS.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textLight, marginHorizontal: 12 },

  activeContainer: { flex: 1 },
  activeHeader: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' },
      default: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }
    })
  },
  activeType: { fontFamily: FONTS.bold, fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 2, marginBottom: 8 },
  activeTimer: { fontFamily: FONTS.black, fontSize: 56, color: '#fff', letterSpacing: -1 },

  liveStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  liveStatCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    ...SHADOWS.sm
  },
  liveStatLabel: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  liveStatValue: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark },
  liveStatUnit: { fontSize: 12, color: COLORS.textLight },

  liveMapContainer: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  mapPlaceholderText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textMid, marginTop: 12 },
  mapPlaceholderSub: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  activeControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  pauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DE6659',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md
  },
  stopBtn: {
    flex: 1,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E2340',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md
  },
  stopBtnText: { fontFamily: FONTS.black, fontSize: 20, color: '#fff', letterSpacing: 1 },

  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historyTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  seeAll: { fontFamily: FONTS.bold, fontSize: 11, color: '#FF7669', letterSpacing: 0.5 },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12
  },
  sessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FD',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sessionTitleText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  sessionMetaText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sessionDistText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  rpeBadgeSmall: { backgroundColor: '#FFF0EE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  rpeBadgeTextSmall: { fontFamily: FONTS.bold, fontSize: 10, color: '#FF7669' },
});


/* ─────────────────────────────────────────────────────────────────────────────
   HYROX TAB REDESIGN
   Stitch: detailed performance tracking for 8 stations, run intervals, 
   and premium summary aggregate section.
─────────────────────────────────────────────────────────────────────────────── */
const HYROX_STATIONS = [
  { id: '01', name: 'SkiErg', target: '1000M TARGET', metric: 'Damper' },
  { id: '02', name: 'Sled Push', target: '50M DISTANCE', metric: 'Weight' },
  { id: '03', name: 'Sled Pull', target: '50M DISTANCE', metric: 'Weight' },
  { id: '04', name: 'Burpee Broad Jumps', target: '80M DISTANCE', metric: null },
  { id: '05', name: 'Rowing', target: '1000M TARGET', metric: 'Damper' },
  { id: '06', name: 'Farmers Carry', target: '200M DISTANCE', metric: 'Weight' },
  { id: '07', name: 'Sandbag Lunges', target: '100M DISTANCE', metric: 'Weight' },
  { id: '08', name: 'Wall Balls', target: '75/100 REPS', metric: 'Weight' },
];

const HYROX_RACE_SEQUENCE = [
  { id: 'R1', name: '1km Run', type: 'run' },
  { id: 'S1', name: 'SkiErg (1000m)', type: 'station' },
  { id: 'R2', name: '1km Run', type: 'run' },
  { id: 'S2', name: 'Sled Push (50m)', type: 'station' },
  { id: 'R3', name: '1km Run', type: 'run' },
  { id: 'S3', name: 'Sled Pull (50m)', type: 'station' },
  { id: 'R4', name: '1km Run', type: 'run' },
  { id: 'S4', name: 'Burpee Broad Jumps (80m)', type: 'station' },
  { id: 'R5', name: '1km Run', type: 'run' },
  { id: 'S5', name: 'Rowing (1000m)', type: 'station' },
  { id: 'R6', name: '1km Run', type: 'run' },
  { id: 'S6', name: 'Farmers Carry (200m)', type: 'station' },
  { id: 'R7', name: '1km Run', type: 'run' },
  { id: 'S7', name: 'Sandbag Lunges (100m)', type: 'station' },
  { id: 'R8', name: '1km Run', type: 'run' },
  { id: 'S8', name: 'Wall Balls (75/100)', type: 'station' },
];

const formatRaceTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

function Section({ title, label, children }) {
  return (
    <View style={hS.sectionContainer}>
      <Text style={hS.sectionTitle}>{title}</Text>
      <View style={hS.sectionMain}>
        <Text style={hS.sectionLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}


function HistoryItem({ session }) {
  const isRace = session.type === 'Race Simulation';
  const accent = isRace ? '#E8705E' : '#94A3B8';

  // Extract drill stats if available
  const firstStnId = Object.keys(session.stationData || {})[0];
  const drillStats = !isRace && firstStnId ? session.stationData[firstStnId] : null;

  return (
    <View style={[hS.histCard, SHADOWS.sm]}>
      <View style={[hS.histAccent, { backgroundColor: accent }]} />
      <View style={hS.histMain}>
        <View style={hS.histTop}>
          <Text style={hS.histDate}>{session.date}</Text>
          <View style={hS.histRPE}>
            <Ionicons name="star" size={10} color="#F97316" />
            <Text style={hS.histRPEText}>{session.difficulty}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={hS.histDuration}>{session.duration}</Text>
            <Text style={hS.histTitle}>{session.title}</Text>
          </View>
          {isRace && session.splits && (
            <Text style={hS.histStats}>
              {session.splits.filter(s => s.type === 'station').length} Stations Complete
            </Text>
          )}
          {drillStats && (
            <Text style={hS.histStats}>
              {drillStats.sets} Sets · {drillStats.weight}kg
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </View>
  );
}



function HyroxTab() {
  const { hyroxSessions, addHyroxSession } = useWorkoutStore();
  const [mode, setMode] = useState('Race'); // 'Race' or 'Drill'
  const [selectedStationId, setSelectedStationId] = useState('01');
  const [drillSets, setDrillSets] = useState(4);
  const [drillRest, setDrillRest] = useState('60s');
  const [drillTime, setDrillTime] = useState('04:20');
  const [drillWeight, setDrillWeight] = useState('80');
  const [selectorOpen, setSelectorOpen] = useState(false);

  const [stationData, setStationData] = useState({});
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [aggregateTime, setAggregateTime] = useState('01:24:15');
  const [saved, setSaved] = useState(false);

  // Live Race Simulation State
  const [raceActive, setRaceActive] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState([]); // [{ name, time, cumulative }]

  useEffect(() => {
    let interval;
    if (raceActive) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [raceActive]);

  const startRace = () => {
    setRaceActive(true);
    setRaceFinished(false);
    setCurrentStep(0);
    setElapsed(0);
    setSplits([]);
  };

  const completeStep = () => {
    const step = HYROX_RACE_SEQUENCE[currentStep];
    const prevCumulative = splits.length > 0 ? splits[splits.length - 1].cumulative : 0;
    const splitTime = elapsed - prevCumulative;

    const newSplit = {
      name: step.name,
      type: step.type,
      time: splitTime,
      cumulative: elapsed
    };

    setSplits([...splits, newSplit]);

    if (currentStep < HYROX_RACE_SEQUENCE.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setRaceActive(false);
      setRaceFinished(true);
    }
  };

  const selectedStn = HYROX_STATIONS.find(s => s.id === selectedStationId);
  const raceLogs = (hyroxSessions || []).filter(s => s.type === 'Race Simulation');
  const drillLogs = (hyroxSessions || []).filter(s => s.type === 'Station Drill');

  const save = () => {
    const isRace = mode === 'Race';
    addHyroxSession({
      type: isRace ? 'Race Simulation' : 'Station Drill',
      title: isRace ? 'Full Race Simulation' : `${selectedStn.name} Drill`,
      duration: isRace ? formatRaceTime(elapsed) : drillTime,
      difficulty: rpe,
      notes: notes,
      splits: isRace ? splits : null,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (isRace) {
        setRaceActive(false);
        setRaceFinished(false);
      }
    }, 2000);
  };

  // Stats calculation
  const raceStats = useMemo(() => {
    if (!raceFinished || splits.length === 0) return null;
    const totalSeconds = splits[splits.length - 1].cumulative;
    const stationSplits = splits.filter(s => s.type === 'station');
    const runSplits = splits.filter(s => s.type === 'run');

    const avgStation = stationSplits.length > 0 ? (stationSplits.reduce((acc, s) => acc + s.time, 0) / stationSplits.length) : 0;
    const avgRun = runSplits.length > 0 ? (runSplits.reduce((acc, s) => acc + s.time, 0) / runSplits.length) : 0;

    const sortedStations = [...stationSplits].sort((a, b) => a.time - b.time);
    const fastest = sortedStations.length > 0 ? sortedStations[0] : { name: 'N/A' };
    const slowest = sortedStations.length > 0 ? sortedStations[sortedStations.length - 1] : { name: 'N/A' };

    return {
      totalTime: formatRaceTime(totalSeconds),
      avgStation: formatRaceTime(Math.round(avgStation)),
      avgRunPace: formatRaceTime(Math.round(avgRun)),
      fastest: fastest.name,
      slowest: slowest.name,
      calories: Math.round(totalSeconds * 0.18 * (rpe / 3)), // Mock formula
    };
  }, [raceFinished, splits, rpe]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={hS.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={hS.headerSection}>
        <Text style={hS.pageHeader}>Hyrox Performance</Text>
        <Text style={hS.pageSubheader}>
          {mode === 'Race'
            ? "Precision tracking for the human laboratory. Map your race simulation with clinical accuracy."
            : "Focus on individual movement standards and station-specific power output."}
        </Text>
      </View>

      <View style={hS.selectionRow}>
        <TouchableOpacity
          style={[hS.selectCard, mode === 'Race' && hS.selectCardActive]}
          onPress={() => setMode('Race')}
        >
          <View style={hS.selectIconRow}>
            <View style={[hS.modeIconCircle, { backgroundColor: '#F97316' }]}>
              <Ionicons name="stopwatch" size={18} color="#fff" />
            </View>
            {mode === 'Race' && <Ionicons name="checkmark-circle" size={20} color="#F97316" />}
          </View>
          <Text style={hS.selectTitle}>Race Simulation</Text>
          <Text style={hS.selectDesc}>Full 8-station circuit with 1km run intervals.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[hS.selectCard, mode === 'Drill' && hS.selectCardActive]}
          onPress={() => setMode('Drill')}
        >
          <View style={hS.selectIconRow}>
            <View style={[hS.modeIconCircle, { backgroundColor: '#94A3B8' }]}>
              <Ionicons name="barbell" size={18} color="#fff" />
            </View>
            {mode === 'Drill' && <Ionicons name="checkmark-circle" size={20} color="#94A3B8" />}
          </View>
          <Text style={hS.selectTitle}>Station Drill</Text>
          <Text style={hS.selectDesc}>Focus on specific segments and technical skill.</Text>
        </TouchableOpacity>
      </View>

      {mode === 'Race' ? (
        raceActive ? (
          /* ACTIVE RACE VIEW */
          <View style={hS.activeRaceContainer}>
            <View style={hS.activeTimerCard}>
              <Text style={hS.activeTimerLabel}>ELAPSED TIME</Text>
              <Text style={hS.activeTimerVal}>{formatRaceTime(elapsed)}</Text>
            </View>

            <View style={hS.currentSegmentCard}>
              <View style={hS.segmentHeader}>
                <View style={[hS.segmentTypeBadge, { backgroundColor: HYROX_RACE_SEQUENCE[currentStep].type === 'run' ? '#4ECDC4' : '#F97316' }]}>
                  <Text style={hS.segmentTypeBtnText}>{HYROX_RACE_SEQUENCE[currentStep].type.toUpperCase()}</Text>
                </View>
                <Text style={hS.segmentStepText}>STEP {currentStep + 1} OF 16</Text>
              </View>
              <Text style={hS.segmentName}>{HYROX_RACE_SEQUENCE[currentStep].name}</Text>

              <TouchableOpacity onPress={completeStep} style={hS.completeBtn}>
                <LinearGradient colors={['#E8705E', '#D96055']} style={hS.completeGrad}>
                  <Text style={hS.completeBtnText}>TICK & CONTINUE</Text>
                  <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginLeft: 10 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={hS.splitsList}>
              <Text style={hS.splitsHeader}>SPLIT TIMES</Text>
              {splits.slice().reverse().map((s, i) => (
                <View key={i} style={hS.splitItem}>
                  <Text style={hS.splitName}>{s.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={hS.splitValue}>{formatRaceTime(s.time)}</Text>
                    <View style={hS.splitDivider} />
                    <Text style={hS.splitCumulative}>{formatRaceTime(s.cumulative)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : raceFinished ? (
          /* RACE SUMMARY VIEW */
          <View style={hS.summaryContainer}>
            <View style={hS.congratsCard}>
              <Ionicons name="trophy" size={48} color="#FFD700" style={{ marginBottom: 12 }} />
              <Text style={hS.congratsTitle}>Simulation Complete</Text>
              <Text style={hS.congratsTime}>{raceStats.totalTime}</Text>
              <Text style={hS.congratsSub}>TOTAL RACE DURATION</Text>
            </View>

            <View style={hS.statsGrid}>
              <View style={hS.statRowItem}>
                <Text style={hS.statRowLabel}>AVG RUN PACE</Text>
                <Text style={hS.statRowVal}>{raceStats.avgRunPace}</Text>
              </View>
              <View style={hS.statRowItem}>
                <Text style={hS.statRowLabel}>AVG STATION TIME</Text>
                <Text style={hS.statRowVal}>{raceStats.avgStation}</Text>
              </View>
              <View style={hS.statRowItem}>
                <Text style={hS.statRowLabel}>CALORIES BURNED</Text>
                <Text style={hS.statRowVal}>{raceStats.calories} kcal</Text>
              </View>
            </View>

            <View style={hS.analysisCard}>
              <View style={hS.analysisItem}>
                <Ionicons name="flash" size={20} color="#4ECDC4" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={hS.analysisLabel}>FASTEST STATION</Text>
                  <Text style={hS.analysisVal}>{raceStats.fastest}</Text>
                </View>
              </View>
              <View style={hS.analysisItem}>
                <Ionicons name="trending-down" size={20} color="#D96055" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={hS.analysisLabel}>SLOWEST STATION</Text>
                  <Text style={hS.analysisVal}>{raceStats.slowest}</Text>
                </View>
              </View>
            </View>

            <View style={[hS.summaryCard, SHADOWS.lg, { backgroundColor: '#111827' }]}>
              <Text style={hS.summaryLabel}>SESSION DIFFICULTY (RPE)</Text>
              <View style={hS.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setRpe(n)}>
                    <Ionicons
                      name={n <= rpe ? 'star' : 'star-outline'}
                      size={24}
                      color={n <= rpe ? '#F97316' : '#475569'}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={hS.notesContainer}>
              <Text style={hS.notesLabel}>RACE OBSERVATIONS</Text>
              <TextInput
                style={hS.notesInput}
                multiline
                placeholder="How was the transition? Fueling strategy..."
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        ) : (
          /* START SCREEN */
          <View style={hS.startRaceScreen}>
            <View style={hS.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color="#64748B" />
              <Text style={hS.infoText}>
                This simulation follows the official Hyrox sequence: 1km Run followed by each of the 8 stations.
              </Text>
            </View>

            <TouchableOpacity onPress={startRace} style={hS.heroStartBtn}>
              <LinearGradient colors={['#1E2340', '#4A5568']} style={hS.heroStartGrad}>
                <Ionicons name="play" size={40} color="#fff" />
                <Text style={hS.heroStartTitle}>START RACE SIMULATION</Text>
                <Text style={hS.heroStartSub}>Timer will begin immediately</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={hS.sequenceLabel}>RACE PROTOCOL</Text>
            {HYROX_RACE_SEQUENCE.map((s, i) => (
              <View key={i} style={hS.sequenceItem}>
                <View style={[hS.seqDot, { backgroundColor: s.type === 'run' ? '#4ECDC4' : '#F97316' }]} />
                <Text style={hS.seqName}>{s.name}</Text>
              </View>
            ))}
          </View>
        )
      ) : (
        <View style={hS.drillContainer}>
          <Text style={hS.drillFocusLabel}>CURRENT FOCUS</Text>
          <TouchableOpacity
            onPress={() => setSelectorOpen(!selectorOpen)}
            style={hS.stnSelector}
          >
            <Text style={hS.stnSelectorText}>{selectedStn.name}</Text>
            <Ionicons name={selectorOpen ? "chevron-up" : "chevron-down"} size={20} color="#1E2340" />
          </TouchableOpacity>

          {selectorOpen && (
            <View style={hS.selectorDropdown}>
              {HYROX_STATIONS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={hS.selectorItem}
                  onPress={() => {
                    setSelectedStationId(s.id);
                    setSelectorOpen(false);
                  }}
                >
                  <Text style={[hS.selectorItemText, s.id === selectedStationId && { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[hS.drillForm, SHADOWS.card]}>
            <Section title="VOLUME" label="Sets">
              <View style={hS.counterContainer}>
                <TouchableOpacity onPress={() => setDrillSets(Math.max(1, drillSets - 1))} style={hS.counterBtn}>
                  <Ionicons name="remove" size={24} color="#E8705E" />
                </TouchableOpacity>
                <Text style={hS.counterValue}>{drillSets}</Text>
                <TouchableOpacity onPress={() => setDrillSets(drillSets + 1)} style={[hS.counterBtn, { backgroundColor: '#FF8F7E' }]}>
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </Section>

            <Section title="RESISTANCE" label="Weight">
              <View style={hS.drillInputBox}>
                <TextInput
                  style={hS.drillMainInput}
                  value={drillWeight}
                  onChangeText={setDrillWeight}
                  placeholder="0"
                />
                <Text style={hS.drillInputUnit}>KG</Text>
              </View>
            </Section>

            <Section title="RECOVERY" label="Rest">
              <View style={hS.restRow}>
                {['30s', '60s', '90s', '2m'].map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setDrillRest(r)}
                    style={[
                      hS.restPill,
                      drillRest === r && hS.restPillActive,
                      drillRest === r && r === '30s' && { backgroundColor: '#4ECDC4' },
                      drillRest === r && r === '60s' && { backgroundColor: '#FF8F7E' },
                    ]}
                  >
                    <Text style={[hS.restPillText, drillRest === r && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            <Text style={hS.drillNotesLabel}>OBSERVATIONS</Text>
            <View style={hS.drillNotesBox}>
              <TextInput
                multiline
                style={hS.drillNotesInput}
                placeholder="How was the heart rate recovery? Any form cues..."
                placeholderTextColor="#C5CBD8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          <View style={hS.focusBanner}>
            <LinearGradient
              colors={['#1E2340', '#4A5568']}
              style={hS.bannerImg}
            >
              <View style={hS.bannerContent}>
                <Text style={hS.bannerTop}>TRAINING FOCUS</Text>
                <Text style={hS.bannerTitle}>Scientific Precision.</Text>
                <Text style={hS.bannerSub}>REFINING THE 1% ADVANTAGE</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {!raceActive && (
        <TouchableOpacity onPress={save} activeOpacity={0.88} style={hS.logBtn}>
          <LinearGradient
            colors={['#E8705E', '#D96055']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={hS.logGrad}
          >
            <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
            <Text style={hS.logBtnText}>
              {saved ? 'Saved!' : (mode === 'Race' ? (raceFinished ? 'Save Race Results' : 'Log HYROX Session') : 'Save Drill')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}


      {/* History Section */}
      <View style={hS.historyHeaderRow}>
        <Text style={hS.historySectionTitle}>View History</Text>
        <Ionicons name="time-outline" size={18} color="#64748B" />
      </View>

      <View style={hS.historySubtitleRow}>
        <View style={[hS.historyTypePill, { backgroundColor: '#FDE6D2' }]}>
          <Text style={[hS.historyTypePillText, { color: '#F97316' }]}>RACE SIMULATION</Text>
        </View>
      </View>
      {raceLogs.length === 0 ? (
        <Text style={hS.emptyHist}>No race simulations logged yet.</Text>
      ) : (
        raceLogs.map(s => <HistoryItem key={s.id} session={s} />)
      )}

      <View style={[hS.historySubtitleRow, { marginTop: 24 }]}>
        <View style={[hS.historyTypePill, { backgroundColor: '#F1F5F9' }]}>
          <Text style={[hS.historyTypePillText, { color: '#64748B' }]}>STATION DRILLS</Text>
        </View>
      </View>
      {drillLogs.length === 0 ? (
        <Text style={hS.emptyHist}>No station drills logged yet.</Text>
      ) : (
        drillLogs.map(s => <HistoryItem key={s.id} session={s} />)
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const hS = StyleSheet.create({
  scroll: { padding: SPACING.lg },
  headerSection: { marginBottom: 24, marginTop: 8 },
  pageHeader: { fontFamily: FONTS.black, fontSize: 32, color: '#1E2340', marginBottom: 8 },
  pageSubheader: { fontFamily: FONTS.regular, fontSize: 14, color: '#64748B', lineHeight: 20 },

  selectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  selectCard: {
    width: '48%', backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16,
    borderWidth: 2, borderColor: 'transparent'
  },
  selectCardActive: { borderColor: '#FDE6D2', backgroundColor: '#fff' },
  selectIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modeIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectTitle: { fontFamily: FONTS.black, fontSize: 16, color: '#1E2340', marginBottom: 4 },
  selectDesc: { fontFamily: FONTS.regular, fontSize: 12, color: '#64748B', lineHeight: 16 },

  // Drill View Styles
  drillContainer: { marginBottom: 24 },
  drillFocusLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 1, marginBottom: 12 },
  stnSelector: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
    ...Platform.select({ web: { boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 } })
  },
  stnSelectorText: { fontFamily: FONTS.bold, fontSize: 17, color: '#1E2340' },
  selectorDropdown: {
    backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 20,
    ...Platform.select({ web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 } }),
    zIndex: 100,
  },
  selectorItem: { padding: 14, borderRadius: 10 },
  selectorItemText: { fontFamily: FONTS.medium, fontSize: 15, color: '#475569' },

  drillForm: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24 },
  sectionContainer: { marginBottom: 32 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 12 },
  sectionMain: {},
  sectionLabel: { fontFamily: FONTS.black, fontSize: 32, color: '#1E2340', marginBottom: 16 },

  counterContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 100, padding: 6, alignSelf: 'flex-start'
  },
  counterBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 } })
  },
  counterValue: { fontFamily: FONTS.black, fontSize: 24, color: '#1E2340', marginHorizontal: 24 },

  drillInputBox: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8, flexDirection: 'row', alignItems: 'baseline' },
  drillMainInput: { flex: 1, fontFamily: FONTS.black, fontSize: 32, color: '#E2E8F0' }, // color matches placeholder shade in image
  drillInputUnit: { fontFamily: FONTS.bold, fontSize: 12, color: '#94A3B8' },

  restRow: { flexDirection: 'row', gap: 10 },
  restPill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center'
  },
  restPillActive: { backgroundColor: '#1E2340' },
  restPillText: { fontFamily: FONTS.bold, fontSize: 13, color: '#475569' },

  drillNotesLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 12 },
  drillNotesBox: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, minHeight: 120 },
  drillNotesInput: { fontFamily: FONTS.medium, fontSize: 15, color: '#475569', lineHeight: 22 },

  focusBanner: { borderRadius: 24, overflow: 'hidden', height: 160, marginBottom: 30 },
  bannerImg: { flex: 1, padding: 24, justifyContent: 'center' },
  bannerContent: {},
  bannerTop: { fontFamily: FONTS.bold, fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 8 },
  bannerTitle: { fontFamily: FONTS.black, fontSize: 26, color: '#fff' },
  bannerSub: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8', letterSpacing: 1, marginTop: 4 },

  stationCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8
  },
  stationAccent: {
    position: 'absolute', left: 0, top: 16, bottom: 16, width: 4,
    backgroundColor: '#E8705E', borderTopRightRadius: 4, borderBottomRightRadius: 4
  },
  stnBadge: {
    width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  stnBadgePrefix: { fontFamily: FONTS.bold, fontSize: 9, color: '#94A3B8' },
  stnBadgeId: { fontFamily: FONTS.black, fontSize: 18, color: '#1E2340' },
  stnInfo: { flex: 1 },
  stnName: { fontFamily: FONTS.black, fontSize: 16, color: '#1E2340' },
  stnTarget: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8', marginTop: 2 },
  stnInputs: { flexDirection: 'row', gap: 8 },
  miniInput: {
    backgroundColor: '#F1F5F9', borderRadius: RADIUS.sm, paddingHorizontal: 12,
    paddingVertical: 10, minWidth: 70, textAlign: 'center',
    fontFamily: FONTS.bold, fontSize: 12, color: '#1E2340'
  },

  runDivider: { alignItems: 'center', paddingVertical: 12 },
  runPill: { backgroundColor: '#EDF2F7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  runPillText: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 0.5 },

  summaryCard: { backgroundColor: '#111827', borderRadius: RADIUS.xl, padding: 24, marginTop: 16, marginBottom: 24 },
  summaryLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 1, marginBottom: 12 },
  aggregateTimeVal: { fontFamily: FONTS.black, fontSize: 44, color: '#fff', marginBottom: 16 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  tierText: { flex: 1, textAlign: 'right', fontFamily: FONTS.bold, fontSize: 11, color: '#475569' },

  notesLabel: { fontFamily: FONTS.bold, fontSize: 11, color: '#64748B', letterSpacing: 1, marginBottom: 12 },
  notesContainer: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, marginBottom: 24 },
  notesInput: { fontFamily: FONTS.regular, fontSize: 14, color: '#1E2340', minHeight: 80, textAlignVertical: 'top' },

  logBtn: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 40 },
  logGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  logBtnText: { fontFamily: FONTS.black, fontSize: 16, color: '#fff', marginLeft: 10 },

  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  historySectionTitle: { fontFamily: FONTS.black, fontSize: 24, color: '#1E2340' },
  historySubtitleRow: { marginBottom: 16 },
  historyTypePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historyTypePillText: { fontFamily: FONTS.bold, fontSize: 10, letterSpacing: 0.5 },

  histCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, overflow: 'hidden'
  },
  histAccent: { width: 4, position: 'absolute', left: 0, top: 12, bottom: 12, borderRadius: 2 },
  histMain: { flex: 1, marginLeft: 8 },
  histTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  histDate: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8' },
  histRPE: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  histRPEText: { fontFamily: FONTS.black, fontSize: 10, color: '#D97706', marginLeft: 4 },
  histDuration: { fontFamily: FONTS.black, fontSize: 18, color: '#1E2340' },
  histTitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B' },
  emptyHist: { fontFamily: FONTS.regular, fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },
  histStats: { fontFamily: FONTS.bold, fontSize: 13, color: '#94A3B8', marginBottom: 2 },

  // New Race Simulation Styles
  startRaceScreen: { marginBottom: 30 },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 24
  },
  infoText: { flex: 1, fontFamily: FONTS.medium, fontSize: 13, color: '#64748B', marginLeft: 12, lineHeight: 18 },
  heroStartBtn: { borderRadius: 24, overflow: 'hidden', marginBottom: 32 },
  heroStartGrad: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  heroStartTitle: { fontFamily: FONTS.black, fontSize: 20, color: '#fff', marginTop: 12, letterSpacing: 0.5 },
  heroStartSub: { fontFamily: FONTS.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  sequenceLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16 },
  sequenceItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  seqDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  seqName: { fontFamily: FONTS.bold, fontSize: 14, color: '#475569' },

  activeRaceContainer: { flex: 1 },
  activeTimerCard: {
    backgroundColor: '#1E2340', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24,
    ...Platform.select({ web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }, default: { elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 } })
  },
  activeTimerLabel: { fontFamily: FONTS.bold, fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 4 },
  activeTimerVal: { fontFamily: FONTS.black, fontSize: 56, color: '#fff', letterSpacing: -1 },

  currentSegmentCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#F1F5F9', ...SHADOWS.sm
  },
  segmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  segmentTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  segmentTypeBtnText: { fontFamily: FONTS.black, fontSize: 10, color: '#fff' },
  segmentStepText: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8' },
  segmentName: { fontFamily: FONTS.black, fontSize: 28, color: '#1E2340', marginBottom: 24 },
  completeBtn: { borderRadius: 16, overflow: 'hidden' },
  completeGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  completeBtnText: { fontFamily: FONTS.black, fontSize: 16, color: '#fff', letterSpacing: 0.5 },

  splitsList: { flex: 1 },
  splitsHeader: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16 },
  splitItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  splitName: { fontFamily: FONTS.bold, fontSize: 14, color: '#475569' },
  splitValue: { fontFamily: FONTS.black, fontSize: 14, color: '#1E2340' },
  splitDivider: { width: 1, height: 12, backgroundColor: '#CBD5E1', marginHorizontal: 10 },
  splitCumulative: { fontFamily: FONTS.medium, fontSize: 12, color: '#94A3B8' },

  summaryContainer: { flex: 1 },
  congratsCard: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  congratsTitle: { fontFamily: FONTS.black, fontSize: 24, color: '#1E2340', marginBottom: 8 },
  congratsTime: { fontFamily: FONTS.black, fontSize: 48, color: '#E8705E', letterSpacing: -1 },
  congratsSub: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8', letterSpacing: 1.5 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap' },
  statRowItem: { width: '31%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, alignItems: 'center' },
  statRowLabel: { fontFamily: FONTS.bold, fontSize: 9, color: '#94A3B8', marginBottom: 4, textAlign: 'center' },
  statRowVal: { fontFamily: FONTS.black, fontSize: 14, color: '#1E2340' },

  analysisCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 20,
    justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9'
  },
  analysisItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  analysisLabel: { fontFamily: FONTS.bold, fontSize: 9, color: '#94A3B8', marginBottom: 2 },
  analysisVal: { fontFamily: FONTS.bold, fontSize: 13, color: '#1E2340' },
});



/* ─────────────────────────────────────────────────────────────────────────────
   ROOT WORKOUT SCREEN — Material Top Tabs container
─────────────────────────────────────────────────────────────────────────────── */
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={wS.customTabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={[wS.customTabItem, isFocused && wS.customTabItemActive]}
          >
            <Text style={[wS.customTabLabel, isFocused && wS.customTabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function WorkoutScreen({ navigation }) {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Alex';

  return (
    <SafeAreaView style={wS.container} edges={['top']}>
      {/* Screen header */}
      <View style={wS.mainHeaderRow}>
        <TouchableOpacity style={wS.menuBtn}>
          <Ionicons name="menu-outline" size={30} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={wS.repLogo}>REPCRAFT</Text>
        <TouchableOpacity style={wS.avatarRing}>
          <View style={wS.avatar}>
            <Text style={wS.avatarText}>{firstName[0].toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={wS.titleBanner}>
        <Text style={wS.labText}>YOUR LABORATORY</Text>
        <Text style={wS.pageTitleText}>Training</Text>
        <Text style={wS.pageTitleText}>Protocol</Text>
      </View>

      {/* Top tabs */}
      <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
        <Tab.Screen name="MyRoutine" options={{ tabBarLabel: 'My Routine' }}>
          {() => <MyRoutineTab navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="Cardio" options={{ tabBarLabel: 'Cardio' }}>
          {() => <CardioTab />}
        </Tab.Screen>
        <Tab.Screen name="Hyrox" options={{ tabBarLabel: 'Hyrox' }}>
          {() => <HyroxTab />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const wS = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mainHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 10, paddingBottom: 20,
  },
  menuBtn: { padding: 4, marginLeft: -4 },
  repLogo: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.textDark, letterSpacing: 1 },
  avatarRing: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1E232A', alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },

  titleBanner: { paddingHorizontal: SPACING.lg, marginBottom: 20 },
  labText: { fontFamily: FONTS.bold, fontSize: 11, color: '#CD4C40', letterSpacing: 1.5, marginBottom: 6 },
  pageTitleText: { fontFamily: FONTS.black, fontSize: 38, color: COLORS.textDark, lineHeight: 42, letterSpacing: -1.5 },

  customTabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F8',
    marginHorizontal: SPACING.lg,
    borderRadius: 30,
    padding: 6,
    marginBottom: SPACING.lg,
  },
  customTabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 24,
  },
  customTabItemActive: {
    backgroundColor: '#fff',
    ...Platform.select({ web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 } })
  },
  customTabLabel: {
    fontFamily: FONTS.bold, fontSize: 13, color: '#8A94A6',
  },
  customTabLabelActive: {
    color: '#CD4C40',
  },
});

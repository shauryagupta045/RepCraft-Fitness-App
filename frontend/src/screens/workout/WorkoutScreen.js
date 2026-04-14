/**
 * WorkoutScreen — Stitch-accurate
 * Material top tabs: My Routine | Cardio | Hyrox
 * Each tab fully redesigned to match Stitch
 */
import React, { useState } from 'react';
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

const Tab = createMaterialTopTabNavigator();

/* ─────────────────────────────────────────────────────────────────────────────
   MY ROUTINE TAB
   Stitch: list of day cards — coral day badge, title, muscle group, exercise chips
   + coral gradient "Start" button, floating + FAB
─────────────────────────────────────────────────────────────────────────────── */
function MuscleRow({ label, pct, color }) {
  return (
    <View style={pS.muscleRow}>
      <View style={pS.muscleLabelRow}>
        <Text style={pS.muscleLabel}>{label}</Text>
        <Text style={pS.musclePct}>{pct}%</Text>
      </View>
      <View style={pS.muscleTrack}>
        <View style={[pS.muscleFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function MyRoutineTab({ navigation }) {
  const { routines } = useWorkoutStore();

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
              <Text style={pS.perfScoreVal}>94%</Text>
              <Text style={pS.perfScoreSub}>Top 5% in your bracket</Text>
            </View>
            <View style={pS.perfScoreChart}>
               <View style={[pS.bar, {height: 20, backgroundColor: 'rgba(23,88,77,0.3)'}]} />
               <View style={[pS.bar, {height: 35, backgroundColor: 'rgba(23,88,77,0.3)'}]} />
               <View style={[pS.bar, {height: 50, backgroundColor: '#17584D'}]} />
               <View style={[pS.bar, {height: 25, backgroundColor: 'rgba(23,88,77,0.3)'}]} />
            </View>
          </View>
        </View>

        <View style={pS.statsGrid}>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <View style={pS.statHeader}>
              <Text style={pS.statCardTitle}>WEEKLY VOLUME</Text>
              <Ionicons name="stats-chart" size={12} color="#D96055" />
            </View>
            <Text style={pS.statVal}>42.5k</Text>
            <Text style={pS.statDelta}>+12% VS LAST WEEK</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
            <View style={pS.statHeader}>
              <Text style={pS.statCardTitleLight}>RECENT PR</Text>
              <Ionicons name="trophy" size={12} color="#D96055" />
            </View>
            <Text style={pS.statVal}>225lb</Text>
            <Text style={pS.statSubLight}>BENCH PRESS</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
             <Ionicons name="flame" size={20} color="#D96055" style={{marginBottom: 8}} />
             <Text style={pS.statVal}>12k</Text>
             <Text style={pS.statSubLight}>KCAL</Text>
          </View>
          <View style={[pS.statCard, SHADOWS.sm]}>
             <Ionicons name="stopwatch" size={20} color="#17584D" style={{marginBottom: 8}} />
             <Text style={pS.statVal}>34h</Text>
             <Text style={pS.statSubLight2}>UPTIME</Text>
          </View>
        </View>

        <View style={[pS.muscleCard, SHADOWS.sm]}>
           <Text style={pS.muscleTitle}>MUSCLE FOCUS DISTRIBUTION</Text>
           <MuscleRow label="CHEST" pct={25} color="#D96055" />
           <MuscleRow label="BACK" pct={20} color="#17584D" />
           <MuscleRow label="SHOULDERS" pct={15} color="#D96055" />
           <MuscleRow label="ABDOMINAL" pct={10} color="#17584D" />
           <MuscleRow label="LEGS" pct={20} color="#D96055" />
           <MuscleRow label="ARMS" pct={10} color="#17584D" />
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
  const mockSetsReps = isFirst ? ["4 x 8-10", "3 x 12", "3 x 15"] : ["5 x 5", "4 x 12", "3 x 15"];

  return (
    <TouchableOpacity 
      style={[rS.card, SHADOWS.md]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RoutineBuilder', { routineId: routine.id })}
    >
      <View style={rS.cardHeader}>
        <View style={[rS.dayPill, { backgroundColor: pillBg }]}>
          <Text style={[rS.dayPillText, { color: pillText }]}>{isFirst ? "MONDAY" : "WEDNESDAY"}</Text>
        </View>
      </View>

      <Text style={rS.cardTitle}>{isFirst ? "Chest Day" : "Back & Pull"}</Text>
      <Text style={rS.cardDesc}>
        {isFirst 
         ? "Focus on eccentric control and peak contraction for hypertrophy." 
         : "High volume vertical and horizontal pulling movements."}
      </Text>

      <View style={rS.exerciseList}>
        {preview.map((ex, i) => (
          <View key={ex.id} style={rS.exerciseListItem}>
             <View style={rS.exLeft}>
               <View style={rS.exBullet} />
               <Text style={rS.exName}>{ex.name}</Text>
             </View>
             <Text style={rS.exSetsReps}>{mockSetsReps[i] || "3 x 10"}</Text>
          </View>
        ))}
      </View>

      {isFirst ? (
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
            <Ionicons name="play" size={12} color="#fff" style={{marginLeft: 6}} />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate('ActiveWorkout', { routine })}
          activeOpacity={0.88}
          style={rS.viewBtn}
        >
          <Text style={rS.viewText}>View Routine</Text>
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
  muscleCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20 },
  muscleTitle: { fontFamily: FONTS.bold, fontSize: 11, color: '#EDC9C7', letterSpacing: 1, marginBottom: 20 },
  muscleRow: { marginBottom: 14 },
  muscleLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  muscleLabel: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.textDark },
  musclePct: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.textDark },
  muscleTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  muscleFill: { height: '100%', borderRadius: 3 },
});

/* ─────────────────────────────────────────────────────────────────────────────
   CARDIO TAB
   Stitch: activity type pills (Run/Cycle/Row/Swim/HIIT), duration+distance,
   RPE selector (dots), save button, past sessions list with teal left border
─────────────────────────────────────────────────────────────────────────────── */
const CARDIO_TYPES = [
  { label: 'Run',   icon: 'walk-outline' },
  { label: 'Cycle', icon: 'bicycle-outline' },
  { label: 'Row',   icon: 'boat-outline' },
  { label: 'Swim',  icon: 'water-outline' },
  { label: 'HIIT',  icon: 'flash-outline' },
];

function CardioTab() {
  const { cardioSessions, addCardioSession } = useWorkoutStore();
  const [type, setType]         = useState('Run');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [rpe, setRpe]           = useState(6);
  const [notes, setNotes]       = useState('');
  const [saved, setSaved]       = useState(false);

  const save = () => {
    if (!duration) return;
    addCardioSession({
      type, duration: parseInt(duration),
      distance: parseFloat(distance) || 0,
      rpe, notes,
      date: new Date().toISOString().split('T')[0],
    });
    setDuration(''); setDistance(''); setNotes('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={cS.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Activity type row */}
      <Text style={cS.sectionTitle}>Activity Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
        {CARDIO_TYPES.map(t => (
          <TouchableOpacity
            key={t.label}
            onPress={() => setType(t.label)}
            style={[cS.typePill, type === t.label && cS.typePillActive]}
          >
            <Ionicons name={t.icon} size={16} color={type === t.label ? '#fff' : COLORS.textMuted} />
            <Text style={[cS.typePillText, type === t.label && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input card */}
      <View style={[cS.inputCard, SHADOWS.card]}>
        <View style={cS.inputRow}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={cS.label}>Duration (min)</Text>
            <View style={cS.field}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={cS.fieldInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                placeholder="35"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cS.label}>Distance (km)</Text>
            <View style={cS.field}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={cS.fieldInput}
                value={distance}
                onChangeText={setDistance}
                keyboardType="decimal-pad"
                placeholder="5.2"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        <Text style={cS.label}>Effort / RPE  <Text style={{ color: COLORS.primary, fontFamily: FONTS.black }}>{rpe}</Text>/10</Text>
        <View style={cS.rpeRow}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setRpe(n)}
              style={[cS.rpeDot, n <= rpe && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            >
              <Text style={[cS.rpeDotText, n <= rpe && { color: '#fff' }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={cS.label}>Notes (optional)</Text>
        <TextInput
          style={cS.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Easy zone 2 run..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
      </View>

      {/* Save */}
      <TouchableOpacity onPress={save} activeOpacity={0.88} style={cS.saveBtn}>
        <LinearGradient
          colors={[COLORS.primary, '#D96055']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={cS.saveGrad}
        >
          <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
          <Text style={cS.saveText}>{saved ? 'Saved!' : 'Log Session'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Past sessions */}
      {cardioSessions.length > 0 && (
        <>
          <Text style={cS.sectionTitle}>Recent Sessions</Text>
          {cardioSessions.map(s => (
            <View key={s.id} style={[cS.sessionCard, SHADOWS.card]}>
              <View style={cS.sessionAccent} />
              <View style={{ flex: 1 }}>
                <View style={cS.sessionTop}>
                  <Text style={cS.sessionType}>{s.type}</Text>
                  <View style={cS.rpeBadge}>
                    <Text style={cS.rpeBadgeText}>RPE {s.rpe}</Text>
                  </View>
                </View>
                <View style={cS.sessionMeta}>
                  <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                  <Text style={cS.sessionMetaText}>{s.duration} min</Text>
                  {s.distance > 0 && (
                    <>
                      <Ionicons name="navigate-outline" size={12} color={COLORS.textMuted} style={{ marginLeft: 10 }} />
                      <Text style={cS.sessionMetaText}>{s.distance} km</Text>
                    </>
                  )}
                  <Text style={cS.sessionDate}>{s.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const cS = StyleSheet.create({
  scroll: { padding: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark, marginBottom: SPACING.md },
  typePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.pill,
    paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  typePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typePillText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, marginLeft: 6 },
  inputCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
  inputRow: { flexDirection: 'row', marginBottom: SPACING.md },
  label: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginBottom: 6, letterSpacing: 0.3 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.input, paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  fieldInput: {
    flex: 1, fontFamily: FONTS.regular, fontSize: 15,
    color: COLORS.textDark, paddingVertical: 11,
  },
  rpeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  rpeDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 5, marginBottom: 5,
  },
  rpeDotText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.textMuted },
  notesInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.input,
    backgroundColor: COLORS.background, padding: 12,
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textDark,
    minHeight: 60,
  },
  saveBtn: { borderRadius: RADIUS.button, overflow: 'hidden', marginBottom: SPACING.xl },
  saveGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14,
  },
  saveText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff', marginLeft: 8 },
  sessionCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.button, padding: SPACING.md,
    marginBottom: SPACING.sm, overflow: 'hidden',
  },
  sessionAccent: { width: 4, backgroundColor: COLORS.secondary, borderRadius: 3, marginRight: SPACING.md },
  sessionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sessionType: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  rpeBadge: {
    backgroundColor: COLORS.primary + '18', borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  rpeBadgeText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.primary },
  sessionMeta: { flexDirection: 'row', alignItems: 'center' },
  sessionMetaText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginLeft: 3 },
  sessionDate: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, flex: 1, textAlign: 'right' },
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

  const selectedStn = HYROX_STATIONS.find(s => s.id === selectedStationId);

  const raceLogs = (hyroxSessions || []).filter(s => s.type === 'Race Simulation');
  const drillLogs = (hyroxSessions || []).filter(s => s.type === 'Station Drill');

  const updateStation = (id, field, value) => {
    setStationData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const save = () => {
    const isRace = mode === 'Race';
    addHyroxSession({
      type: isRace ? 'Race Simulation' : 'Station Drill',
      title: isRace ? 'Full Race Simulation' : `${selectedStn.name} Drill`,
      duration: isRace ? aggregateTime : drillTime,
      difficulty: rpe,
      notes: isRace ? notes : notes, // unified notes
      stationData: isRace ? stationData : { [selectedStationId]: { time: drillTime, weight: drillWeight, sets: drillSets, rest: drillRest } },
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
        HYROX_STATIONS.map((stn, idx) => (
          <View key={stn.id}>
            <View style={[hS.stationCard, SHADOWS.card]}>
              <View style={hS.stationAccent} />
              <View style={hS.stnBadge}>
                <Text style={hS.stnBadgePrefix}>STN</Text>
                <Text style={hS.stnBadgeId}>{stn.id}</Text>
              </View>
              <View style={hS.stnInfo}>
                <Text style={hS.stnName}>{stn.name}</Text>
                <Text style={hS.stnTarget}>{stn.target}</Text>
              </View>
              <View style={hS.stnInputs}>
                <TextInput
                  style={hS.miniInput}
                  placeholder="MM:SS"
                  placeholderTextColor="#94A3B8"
                  value={stationData[stn.id]?.time || ''}
                  onChangeText={v => updateStation(stn.id, 'time', v)}
                />
                {stn.metric && (
                  <TextInput
                    style={hS.miniInput}
                    placeholder={stn.metric}
                    placeholderTextColor="#94A3B8"
                    value={stationData[stn.id]?.metric || ''}
                    onChangeText={v => updateStation(stn.id, 'metric', v)}
                  />
                )}
              </View>
            </View>
            {idx < HYROX_STATIONS.length - 1 && (
              <View style={hS.runDivider}>
                <View style={hS.runPill}>
                  <Text style={hS.runPillText}>1KM RUN INTERVAL</Text>
                </View>
              </View>
            )}
          </View>
        ))
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

            {/* Note: drill time field removed per user request */}

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

      {/* Summary Card & Notes - Only show for Race mode as requested */}
      {mode === 'Race' && (
        <>
          <View style={[hS.summaryCard, SHADOWS.lg]}>
            <Text style={hS.summaryLabel}>AGGREGATE TOTAL TIME</Text>
            <TextInput
              style={hS.aggregateTimeVal}
              value={aggregateTime}
              onChangeText={setAggregateTime}
            />
            
            <Text style={hS.summaryLabel}>DIFFICULTY RPE</Text>
            <View style={hS.starsRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRpe(n)}>
                  <Ionicons 
                    name={n <= rpe ? 'star' : 'star-outline'} 
                    size={24} 
                    color={n <= rpe ? '#F97316' : '#475569'} 
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
              <Text style={hS.tierText}>Tier: PRO-ELITE</Text>
            </View>
          </View>

          <Text style={hS.notesLabel}>SESSION LABORATORY NOTES</Text>
          <View style={[hS.notesContainer, SHADOWS.sm]}>
            <TextInput
              style={hS.notesInput}
              multiline
              placeholder="Record observations on nutrition, heart rate recovery, and transition times..."
              placeholderTextColor="#94A3B8"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </>
      )}

      <TouchableOpacity onPress={save} activeOpacity={0.88} style={hS.logBtn}>
        <LinearGradient
          colors={['#E8705E', '#D96055']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={hS.logGrad}
        >
          <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
          <Text style={hS.logBtnText}>
            {saved ? 'Saved!' : (mode === 'Race' ? 'Log HYROX Session' : 'Save Drill')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>


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
  sectionMain: { },
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
  bannerContent: { },
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

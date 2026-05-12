/**
 * ActiveWorkoutScreen — Stitch-accurate workout session
 * Header with timer, exercise list with sets table, rest timer modal, finish confirm
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutStore } from '../../store/workoutStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { formatTime } from '../../utils/dateUtils';

/* ─── Confirm modal (web-safe) ────────────────────────────────────────────── */
function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!visible) return null;
  return (
    <View style={cm.overlay}>
      <View style={cm.box}>
        <Text style={cm.title}>{title}</Text>
        <Text style={cm.msg}>{message}</Text>
        <View style={cm.actions}>
          <TouchableOpacity style={cm.cancelBtn} onPress={onCancel}>
            <Text style={cm.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[cm.confirmBtn, danger && { backgroundColor: COLORS.danger }]} onPress={onConfirm}>
            <Text style={cm.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const cm = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,35,64,0.82)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  box: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, width: '82%', maxWidth: 340 },
  title: { fontFamily: FONTS.black, fontSize: 20, color: COLORS.textDark, marginBottom: 8 },
  msg: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, lineHeight: 21, marginBottom: SPACING.xl },
  actions: { flexDirection: 'row' },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', marginRight: SPACING.sm },
  cancelText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },
});

/* ─── Rest Timer ──────────────────────────────────────────────────────────── */
function RestTimerModal({ visible, duration, onComplete, onClose }) {
  // Ensure duration is a number
  const initialDuration = typeof duration === 'number' ? duration : parseInt(duration) || 60;
  const [left, setLeft] = useState(initialDuration);
  const [running, setRunning] = useState(true);
  const pct = initialDuration > 0 ? Math.max(left / initialDuration, 0) : 0;

  useEffect(() => { 
    const dur = typeof duration === 'number' ? duration : parseInt(duration) || 60;
    setLeft(dur); 
    setRunning(true); 
  }, [duration, visible]);

  useEffect(() => {
    if (!visible || !running) return;
    if (left <= 0) { onComplete?.(); return; }
    const t = setTimeout(() => setLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running, visible]);

  if (!visible) return null;
  const m = Math.floor(left / 60);
  const sec = left % 60;

  return (
    <View style={rt.overlay}>
      <View style={rt.card}>
        <Text style={rt.restLabel}>REST TIME</Text>
        <View style={rt.circle}>
          <View style={[rt.circleInner, { borderColor: COLORS.primary, borderWidth: 4 * pct + 1 }]}>
            <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
            <Text style={rt.time}>{m}:{sec.toString().padStart(2, '0')}</Text>
          </View>
        </View>
        <View style={rt.btns}>
          <TouchableOpacity style={rt.adjBtn} onPress={() => setLeft(p => Math.max(0, p - 15))}>
            <Text style={rt.adjText}>-15s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[rt.adjBtn, { backgroundColor: COLORS.primary }]} onPress={() => setRunning(p => !p)}>
            <Ionicons name={running ? 'pause' : 'play'} size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={rt.adjBtn} onPress={() => setLeft(p => p + 15)}>
            <Text style={rt.adjText}>+15s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[rt.adjBtn, { backgroundColor: COLORS.secondary }]} onPress={onClose}>
            <Text style={[rt.adjText, { color: '#fff' }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const rt = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,35,64,0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 90 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', width: '80%' },
  restLabel: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: SPACING.lg },
  circle: { width: 130, height: 130, borderRadius: 65, borderWidth: 5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  circleInner: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderColor: COLORS.primary },
  time: { fontFamily: FONTS.black, fontSize: 30, color: COLORS.textDark },
  btns: { flexDirection: 'row' },
  adjBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, flexDirection: 'row' },
  adjText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark },
});

/* ─── Set row ────────────────────────────────────────────────────────────── */
function SetRow({ setNum, prev, reps, weight, done, warmup, onUpdate, onToggle }) {
  return (
    <View style={[sr.row, done && sr.rowDone, warmup && sr.rowWarmup]}>
      <View style={sr.numCell}>
        {warmup ? <Text style={sr.warmupLabel}>W</Text> : <Text style={[sr.num, done && { color: COLORS.secondary }]}>{setNum}</Text>}
      </View>
      <View style={sr.prevCell}>
        <Text style={sr.prevText}>{prev}</Text>
      </View>
      <View style={sr.inputCell}>
        <TextInput
          style={[sr.input, done && sr.inputDone]}
          value={String(reps || '')}
          onChangeText={v => onUpdate({ reps: parseInt(v) || 0 })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={COLORS.textMuted}
          editable={!done}
        />
      </View>
      <View style={sr.inputCell}>
        <TextInput
          style={[sr.input, done && sr.inputDone]}
          value={String(weight || '')}
          onChangeText={v => onUpdate({ weight: parseFloat(v) || 0 })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={COLORS.textMuted}
          editable={!done}
        />
      </View>
      <TouchableOpacity onPress={onToggle} style={sr.checkCell}>
        <Ionicons
          name={done ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={26}
          color={done ? COLORS.secondary : COLORS.border}
        />
      </TouchableOpacity>
    </View>
  );
}
const sr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowDone: { backgroundColor: COLORS.secondary + '08' },
  rowWarmup: { backgroundColor: COLORS.border + '30' },
  numCell: { width: 32 },
  num: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  warmupLabel: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center' },
  prevCell: { flex: 1.5, paddingHorizontal: 4 },
  prevText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted },
  inputCell: { flex: 1, marginHorizontal: 3 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 6, fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, textAlign: 'center', backgroundColor: COLORS.background },
  inputDone: { borderColor: COLORS.secondary, backgroundColor: COLORS.secondary + '10', color: COLORS.secondary },
  checkCell: { width: 36, alignItems: 'flex-end' },
});

/* ─── Main Screen ─────────────────────────────────────────────────────────── */
export default function ActiveWorkoutScreen({ route, navigation }) {
  const { routine } = route.params || {};
  const { startSession, finishSession, cancelSession } = useWorkoutStore();

  const [elapsed, setElapsed] = useState(0);
  const [expandedEx, setExpandedEx] = useState(routine?.exercises?.[0]?.id);
  const [sets, setSets] = useState(() => {
    const init = {};
    routine?.exercises?.forEach(ex => {
      init[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.reps, weight: ex.weight,
        done: false, warmup: i === 0 && ex.sets > 2,
      }));
    });
    return init;
  });
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [effort, setEffort] = useState(7);
  const [showFinish, setShowFinish] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    startSession(routine || { id: 'manual', title: 'Workout' });
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleSet = (exId, idx, restTime) => {
    const wasDone = sets[exId]?.[idx]?.done;
    setSets(prev => {
      const updated = [...(prev[exId] || [])];
      updated[idx] = { ...updated[idx], done: !updated[idx].done };
      return { ...prev, [exId]: updated };
    });
    if (!wasDone) { setRestDuration(restTime || 90); setShowRest(true); }
  };

  const updateSet = (exId, idx, data) => {
    setSets(prev => {
      const updated = [...(prev[exId] || [])];
      updated[idx] = { ...updated[idx], ...data };
      return { ...prev, [exId]: updated };
    });
  };

  const addSet = (exId, template) => {
    setSets(prev => {
      const cur = prev[exId] || [];
      return { ...prev, [exId]: [...cur, { setNumber: cur.length + 1, reps: template.reps, weight: template.weight, done: false }] };
    });
  };

  const totalSets = Object.values(sets).flat().length;
  const doneSets  = Object.values(sets).flat().filter(s => s.done).length;
  const pct = totalSets ? (doneSets / totalSets) * 100 : 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setShowCancel(true)} style={s.headerBtn}>
          <Ionicons name="close" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.routineName}>{routine?.title || 'Workout'}</Text>
          <Text style={s.timer}>{formatTime(elapsed)}</Text>
        </View>
        <View style={[s.progressBadge]}>
          <Text style={s.progressText}>{doneSets}/{totalSets}</Text>
        </View>
      </View>

      {/* Global progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${pct}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {routine?.exercises?.map(ex => {
          const exSets = sets[ex.id] || [];
          const allDone = exSets.length > 0 && exSets.every(s => s.done);
          const expanded = expandedEx === ex.id;

          return (
            <View key={ex.id} style={[s.exCard, allDone && s.exCardDone, SHADOWS.sm]}>
              {/* Exercise header */}
              <TouchableOpacity
                style={s.exHeader}
                onPress={() => setExpandedEx(expanded ? null : ex.id)}
              >
                <View style={s.exHeaderLeft}>
                  {allDone && <View style={s.doneCheck}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exMeta}>{ex.sets} sets · {ex.reps} reps · {ex.weight > 0 ? `${ex.weight}kg` : 'Bodyweight'}</Text>
                  </View>
                </View>
                <View style={s.exHeaderRight}>
                  {ex.pr && (
                    <View style={s.prBadge}>
                      <Text style={s.prText}>PR {ex.pr}</Text>
                    </View>
                  )}
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>

              {expanded && (
                <View>
                  {/* Column headers */}
                  <View style={s.setHeaders}>
                    {['SET', 'PREV', 'REPS', 'KG', ''].map((h, i) => (
                      <Text key={i} style={[s.setHeaderText,
                        i === 0 && { width: 32 },
                        i === 1 && { flex: 1.5 },
                        i === 2 && { flex: 1 },
                        i === 3 && { flex: 1 },
                        i === 4 && { width: 36 },
                      ]}>{h}</Text>
                    ))}
                  </View>

                  {exSets.map((set, idx) => (
                    <SetRow
                      key={idx}
                      setNum={set.setNumber}
                      prev={`${ex.weight}×${ex.reps}`}
                      reps={set.reps}
                      weight={set.weight}
                      done={set.done}
                      warmup={set.warmup}
                      onUpdate={data => updateSet(ex.id, idx, data)}
                      onToggle={() => toggleSet(ex.id, idx, ex.rest)}
                    />
                  ))}

                  <TouchableOpacity style={s.addSetBtn} onPress={() => addSet(ex.id, ex)}>
                    <Ionicons name="add-outline" size={16} color={COLORS.primary} />
                    <Text style={s.addSetText}>Add Set</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Effort picker */}
        <View style={[s.effortCard, SHADOWS.sm]}>
          <View style={s.effortHeader}>
            <Ionicons name="speedometer-outline" size={18} color={COLORS.primary} />
            <Text style={s.effortTitle}>Session Effort: <Text style={{ color: COLORS.primary }}>{effort}/10</Text></Text>
          </View>
          <View style={s.effortRow}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <TouchableOpacity key={n} onPress={() => setEffort(n)}
                style={[s.effortDot, n <= effort && { backgroundColor: COLORS.primary }]}
              >
                <Text style={[s.effortNum, n <= effort && { color: '#fff' }]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Finish */}
        <TouchableOpacity onPress={() => setShowFinish(true)} style={s.finishBtn}>
          <LinearGradient colors={[COLORS.primary, '#D45A48']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishGrad}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={s.finishText}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Rest Timer */}
      <RestTimerModal
        visible={showRest}
        duration={restDuration}
        onComplete={() => setShowRest(false)}
        onClose={() => setShowRest(false)}
      />

      {/* Finish confirm */}
      <ConfirmModal
        visible={showFinish}
        title="Finish Workout?"
        message={`Time: ${formatTime(elapsed)}  ·  Effort: ${effort}/10\n\nThis will be saved to your history.`}
        confirmLabel="Save & Finish"
        onConfirm={() => { setShowFinish(false); finishSession(effort); navigation.goBack(); }}
        onCancel={() => setShowFinish(false)}
      />

      {/* Cancel confirm */}
      <ConfirmModal
        visible={showCancel}
        title="Cancel Workout?"
        message="Progress won't be saved."
        confirmLabel="Yes, Cancel"
        danger
        onConfirm={() => { setShowCancel(false); cancelSession(); navigation.goBack(); }}
        onCancel={() => setShowCancel(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerBtn: { width: 36, alignItems: 'center', justifyContent: 'center' },
  routineName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted },
  timer: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.primary, letterSpacing: -1 },
  progressBadge: { backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 5 },
  progressText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.primary },
  progressTrack: { height: 3, backgroundColor: COLORS.border },
  progressFill: { height: 3, backgroundColor: COLORS.primary },
  scroll: { padding: SPACING.lg },
  exCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, marginBottom: SPACING.md, overflow: 'hidden' },
  exCardDone: { borderWidth: 1.5, borderColor: COLORS.secondary + '60' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  exHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  doneCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  exName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  exMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  exHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  prBadge: { backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3, marginRight: SPACING.sm },
  prText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.primary },
  setHeaders: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 8, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  setHeaderText: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, textAlign: 'center' },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  addSetText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary, marginLeft: 4 },
  effortCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
  effortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  effortTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginLeft: 8 },
  effortRow: { flexDirection: 'row', flexWrap: 'wrap' },
  effortDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', margin: 3 },
  effortNum: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted },
  finishBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  finishGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  finishText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff', marginLeft: 8 },
});

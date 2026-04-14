import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

// ─── RoutineCard ─────────────────────────────────────────────────────────────
export function RoutineCard({ routine, onPress, onStart, onEdit }) {
  const preview = routine.exercises.slice(0, 3);
  const extra = routine.exercises.length - 3;

  return (
    <View style={[styles.routineCard, SHADOWS.card]}>
      <View style={styles.routineHeader}>
        <View style={styles.dayPill}>
          <Text style={styles.dayPillText}>{routine.day}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="create-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.routineTitle}>{routine.title}</Text>
      <Text style={styles.routineMuscle}>{routine.muscleGroup}</Text>
      <View style={styles.exercisePreview}>
        {preview.map((ex) => (
          <Text key={ex.id} style={styles.exercisePreviewItem}>
            · {ex.name} · {ex.sets}×{ex.reps}
          </Text>
        ))}
        {extra > 0 && (
          <Text style={[styles.exercisePreviewItem, { color: COLORS.primary }]}>+{extra} more</Text>
        )}
      </View>
      <TouchableOpacity onPress={onStart} style={styles.startBtn}>
        <LinearGradient
          colors={['#FF7D6B', '#FF9A8B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startBtnGrad}
        >
          <Ionicons name="play-circle-outline" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Start Routine</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── ExerciseRow ─────────────────────────────────────────────────────────────
export function ExerciseRow({ exercise, onEdit, onRemove, onMoveUp, onMoveDown, showOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.exerciseRow}>
      <TouchableOpacity
        style={styles.exerciseRowMain}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="reorder-three-outline" size={22} color={COLORS.textMuted} />
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.exerciseRowName}>{exercise.name}</Text>
          <Text style={styles.exerciseRowDetail}>
            {exercise.sets} sets · {exercise.reps} reps · Rest {exercise.rest}s
          </Text>
        </View>
        {exercise.pr && (
          <View style={styles.prBadge}>
            <Text style={styles.prBadgeText}>PR {exercise.pr}</Text>
          </View>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.exerciseRowActions}>
          {showOrder && (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={onMoveUp}>
                <Ionicons name="arrow-up" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={onMoveDown}>
                <Ionicons name="arrow-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <Ionicons name="create-outline" size={16} color={COLORS.secondary} />
            <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onRemove}>
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── SetRow ──────────────────────────────────────────────────────────────────
export function SetRow({ setNumber, previous, reps, weight, completed, isWarmup, onUpdate, onToggle }) {
  return (
    <View style={[styles.setRow, isWarmup && styles.setRowWarmup, completed && styles.setRowCompleted]}>
      <View style={styles.setNumCell}>
        {isWarmup ? (
          <Text style={styles.warmupLabel}>W</Text>
        ) : (
          <Text style={[styles.setNum, completed && { color: COLORS.secondary }]}>{setNumber}</Text>
        )}
      </View>
      <View style={styles.setPrevCell}>
        <Text style={styles.setPrevText}>{previous || '—'}</Text>
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={[styles.setInput, completed && styles.setInputCompleted]}
          value={String(reps || '')}
          onChangeText={(v) => onUpdate({ reps: parseInt(v) || 0 })}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          editable={!completed}
        />
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={[styles.setInput, completed && styles.setInputCompleted]}
          value={String(weight || '')}
          onChangeText={(v) => onUpdate({ weight: parseFloat(v) || 0 })}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          editable={!completed}
        />
      </View>
      <TouchableOpacity onPress={onToggle} style={styles.setCheckCell}>
        <Ionicons
          name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={26}
          color={completed ? COLORS.secondary : COLORS.border}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── RestTimer ───────────────────────────────────────────────────────────────
// Web-compatible: uses View-based circular track (no SVG Reanimated)
export function RestTimer({ duration = 90, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { onComplete?.(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, running]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = Math.max(timeLeft / duration, 0);

  return (
    <View style={styles.restTimer}>
      <View style={styles.restCircle}>
        {/* Simple progress ring using border trick */}
        <View style={[styles.restRingBg, { borderColor: COLORS.border }]} />
        <View
          style={[
            styles.restRingFg,
            {
              borderColor: COLORS.primary,
              opacity: pct,
            },
          ]}
        />
        <View style={styles.restCircleInner}>
          <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
          <Text style={styles.restTime}>{mins}:{secs.toString().padStart(2, '0')}</Text>
          <Text style={styles.restLabel}>REST</Text>
        </View>
      </View>
      <View style={styles.restButtons}>
        <TouchableOpacity
          style={styles.restBtn}
          onPress={() => setTimeLeft((p) => Math.max(0, p - 15))}
        >
          <Text style={styles.restBtnText}>-15s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.restBtn, { backgroundColor: running ? COLORS.border : COLORS.primary }]}
          onPress={() => setRunning((p) => !p)}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={16} color={running ? COLORS.textDark : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.restBtn}
          onPress={() => setTimeLeft((p) => p + 15)}
        >
          <Text style={styles.restBtnText}>+15s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.restBtn, { backgroundColor: COLORS.primary }]} onPress={onComplete}>
          <Text style={[styles.restBtnText, { color: '#fff' }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // RoutineCard
  routineCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.md },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  dayPill: { backgroundColor: COLORS.primary, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 4 },
  dayPillText: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },
  editBtn: { padding: 4 },
  routineTitle: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark, marginBottom: 2 },
  routineMuscle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.md },
  exercisePreview: { marginBottom: SPACING.md },
  exercisePreviewItem: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 22 },
  startBtn: { borderRadius: RADIUS.button, overflow: 'hidden' },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  startBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },

  // ExerciseRow
  exerciseRow: { backgroundColor: COLORS.surface, borderRadius: RADIUS.button, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOWS.card },
  exerciseRowMain: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  exerciseRowName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  exerciseRowDetail: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  prBadge: { backgroundColor: 'rgba(255,125,107,0.12)', borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3 },
  prBadgeText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.primary },
  exerciseRowActions: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.background, borderRadius: RADIUS.pill },
  actionBtnText: { fontFamily: FONTS.medium, fontSize: 12 },

  // SetRow
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  setRowWarmup: { backgroundColor: 'rgba(155,163,175,0.06)' },
  setRowCompleted: { backgroundColor: 'rgba(109,213,192,0.06)' },
  setNumCell: { width: 30 },
  setNum: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted },
  warmupLabel: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  setPrevCell: { flex: 1.2 },
  setPrevText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted },
  setInputCell: { flex: 1, marginHorizontal: 4 },
  setInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.input, paddingHorizontal: 8, paddingVertical: 6, fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark, textAlign: 'center' },
  setInputCompleted: { borderColor: COLORS.secondary, backgroundColor: 'rgba(109,213,192,0.08)', color: COLORS.secondary },
  setCheckCell: { width: 36, alignItems: 'flex-end' },

  // RestTimer
  restTimer: { alignItems: 'center', paddingVertical: SPACING.lg },
  restRingBg: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 5,
  },
  restRingFg: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 5,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  restCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, backgroundColor: 'rgba(255,125,107,0.06)' },
  restCircleInner: { alignItems: 'center' },
  restTime: { fontFamily: FONTS.black, fontSize: 28, color: COLORS.textDark },
  restLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, letterSpacing: 2 },
  restButtons: { flexDirection: 'row', gap: SPACING.sm },
  restBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.pill, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  restBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark },
});
